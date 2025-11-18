import React from "react";
import { ChartIcon } from "./icons";

export const Header: React.FC = () => (
  <header className="w-full max-w-6xl mb-8 text-center">
    <div className="flex items-center justify-center gap-4 mb-2">
      <ChartIcon className="w-10 h-10 text-indigo-400" />
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
        ZWDS Chart Segmenter & AI Analyst
      </h1>
    </div>
    <p className="text-lg text-gray-400 max-w-3xl mx-auto">
      Upload a chart to extract the 13 palace boxes, then generate a detailed
      astrological report with AI.
    </p>
  </header>
);
