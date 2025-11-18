
import { useState, useCallback } from 'react';
import { ProcessingStep, BoundingBox, ProcessedImage } from '../types';

const TARGET_COLOR = { r: 69, g: 27, b: 125 }; // #451b7d
const EUCLIDEAN_DISTANCE_THRESHOLD = 40;
const MIN_BOX_SIZE_RATIO = 0.01;
const EXPECTED_BOXES = 13;

const euclideanDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
};

export const useImageProcessor = () => {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('Initializing');
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProcessingStep('Initializing');
    setProcessedImages([]);
    setError(null);
  }, []);

  const processImage = useCallback(async (file: File) => {
    reset();

    // 1. Load Image
    setProcessingStep('Reading Image');
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = URL.createObjectURL(file);
    });
    const { naturalWidth: width, naturalHeight: height } = image;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not get canvas context.');
    }
    ctx.drawImage(image, 0, 0);
    const originalImageData = ctx.getImageData(0, 0, width, height);

    // 2. Create Cut-Out Map
    setProcessingStep('Generating Cut-Out Map');
    const cutOutImageData = ctx.createImageData(width, height);
    for (let i = 0; i < originalImageData.data.length; i += 4) {
      const r = originalImageData.data[i];
      const g = originalImageData.data[i + 1];
      const b = originalImageData.data[i + 2];
      const distance = euclideanDistance(r, g, b, TARGET_COLOR.r, TARGET_COLOR.g, TARGET_COLOR.b);

      if (distance <= EUCLIDEAN_DISTANCE_THRESHOLD) {
        // Part of the line color -> make it black for inverted map
        cutOutImageData.data[i] = 0;
        cutOutImageData.data[i + 1] = 0;
        cutOutImageData.data[i + 2] = 0;
        cutOutImageData.data[i + 3] = 255;
      } else {
        // Background -> make it white for inverted map
        cutOutImageData.data[i] = 255;
        cutOutImageData.data[i + 1] = 255;
        cutOutImageData.data[i + 2] = 255;
        cutOutImageData.data[i + 3] = 255;
      }
    }
    
    // 3a. Invert and Label (Connected Component Analysis via Flood Fill)
    setProcessingStep('Inverting & Labeling Regions');
    const visited = new Uint8Array(width * height);
    const boxes: BoundingBox[] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x);
        const pixelColor = cutOutImageData.data[index * 4]; // Check Red channel
        if (pixelColor === 255 && !visited[index]) {
          // New component found (white area)
          const queue: [number, number][] = [[x, y]];
          visited[index] = 1;
          let minX = x, minY = y, maxX = x, maxY = y;

          while (queue.length > 0) {
            const [cx, cy] = queue.shift()!;
            minX = Math.min(minX, cx);
            minY = Math.min(minY, cy);
            maxX = Math.max(maxX, cx);
            maxY = Math.max(maxY, cy);

            const neighbors: [number, number][] = [
              [cx, cy - 1], [cx, cy + 1], [cx - 1, cy], [cx + 1, cy]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIndex = (ny * width + nx);
                const nColor = cutOutImageData.data[nIndex * 4];
                if (nColor === 255 && !visited[nIndex]) {
                  visited[nIndex] = 1;
                  queue.push([nx, ny]);
                }
              }
            }
          }
          const boxWidth = maxX - minX + 1;
          const boxHeight = maxY - minY + 1;
          boxes.push({ minX, minY, maxX, maxY, width: boxWidth, height: boxHeight, area: boxWidth * boxHeight });
        }
      }
    }

    // 3b. Filter Bounding Boxes
    setProcessingStep('Filtering Boxes');
    if (boxes.length === 0) {
        setError('No regions were detected. Please check the input image and try again.');
        throw new Error('No regions detected.');
    }

    // Filter 1: Remove largest box (background)
    boxes.sort((a, b) => b.area - a.area);
    const filteredBoxes = boxes.slice(1);

    // Filter 2: Remove noise/thin lines
    const minWidth = width * MIN_BOX_SIZE_RATIO;
    const minHeight = height * MIN_BOX_SIZE_RATIO;
    const finalBoxes = filteredBoxes.filter(box => box.width >= minWidth && box.height >= minHeight);

    // 3c. Validation
    if (finalBoxes.length !== EXPECTED_BOXES) {
      setError(`Expected ${EXPECTED_BOXES} boxes but found ${finalBoxes.length}. The image may not be a standard ZWDS chart or has unusual formatting.`);
      throw new Error(`Incorrect number of boxes found: ${finalBoxes.length}`);
    }

    // 4. Final Cropping and Output
    setProcessingStep('Cropping Final Images');
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) {
      throw new Error('Could not get crop canvas context.');
    }

    const finalImages: ProcessedImage[] = finalBoxes
      .sort((a, b) => a.minY === b.minY ? a.minX - b.minX : a.minY - b.minY) // Sort top-to-bottom, left-to-right
      .map((box, index) => {
        cropCanvas.width = box.width;
        cropCanvas.height = box.height;
        cropCtx.drawImage(
          image,
          box.minX, box.minY, box.width, box.height, // Source rect
          0, 0, box.width, box.height // Destination rect
        );
        return {
          id: index,
          dataUrl: cropCanvas.toDataURL('image/jpeg', 0.9),
          filename: `zwds_box_${index + 1}.jpg`,
        };
    });

    setProcessedImages(finalImages);
    setProcessingStep('Done');
  }, [reset]);

  return { processImage, processingStep, processedImages, error, reset };
};
