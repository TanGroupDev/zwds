
import React from 'react';
import JSZip from 'jszip';
import { ProcessedImage } from '../types';
import { DownloadIcon, RefreshIcon, AIIcon } from './icons';

interface ResultsViewProps {
  images: ProcessedImage[];
  onReset: () => void;
  onGenerateReport: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ images, onReset, onGenerateReport }) => {
  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const promises = images.map(async (image) => {
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      zip.file(image.filename, blob);
    });
    await Promise.all(promises);
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'zwds_chart_boxes.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-100">
          Segmentation Complete: <span className="text-indigo-400">{images.length} Boxes Found</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
          >
            <RefreshIcon className="w-5 h-5" />
            Start Over
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            <DownloadIcon className="w-5 h-5" />
            Download All (.zip)
          </button>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 shadow-lg hover:shadow-xl"
          >
            <AIIcon className="w-5 h-5" />
            Generate AI Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-800">
            <img
              src={image.dataUrl}
              alt={`Segmented Box ${image.id + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <a
                href={image.dataUrl}
                download={image.filename}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                aria-label={`Download box ${image.id + 1}`}
              >
                <DownloadIcon className="w-5 h-5" />
                <span>Save</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
