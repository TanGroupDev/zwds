
export type AppState = 'idle' | 'processing' | 'success' | 'analyzing' | 'reportReady' | 'error';

export type ProcessingStep = 
  | 'Initializing'
  | 'Reading Image'
  | 'Generating Cut-Out Map'
  | 'Inverting & Labeling Regions'
  | 'Extracting Bounding Boxes'
  | 'Filtering Boxes'
  | 'Cropping Final Images'
  | 'Done';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  area: number;
}

export interface ProcessedImage {
  id: number;
  dataUrl: string;
  filename: string;
}
