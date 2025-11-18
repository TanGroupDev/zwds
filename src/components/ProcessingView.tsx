
import React from 'react';
import { ProcessingStep } from '../types';

interface ProcessingViewProps {
  step: ProcessingStep;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ step }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
      <h2 className="mt-6 text-2xl font-semibold text-gray-200">Processing Image...</h2>
      <p className="mt-2 text-gray-400">{step}</p>
    </div>
  );
};

export default ProcessingView;
