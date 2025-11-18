
import React from 'react';
import { AIIcon } from './icons';

const AnalyzingView: React.FC = () => {
  const messages = [
    "Consulting the celestial archives...",
    "Aligning stars and palaces...",
    "Interpreting cosmic patterns...",
    "Decoding the heavenly stems...",
    "This may take a moment."
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setMessage(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
        <div className="w-full h-full flex items-center justify-center">
            <AIIcon className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-gray-200">Generating AI Analysis...</h2>
      <p className="mt-2 text-gray-400 h-6">{message}</p>
    </div>
  );
};

export default AnalyzingView;
