// src/App.tsx
import React, { useState, useCallback } from "react";
import { useImageProcessor } from "./hooks/useImageProcessor";
import { AppState } from "./types";
import { generateZwdReport } from "./services/geminiService";
import ImageUploader from "./components/ImageUploader";
import ProcessingView from "./components/ProcessingView";
import ResultsView from "./components/ResultsView";
import AnalyzingView from "./components/AnalyzingView";
import ReportView from "./components/ReportView";
import { Header } from "./components/Header";
import { ErrorIcon } from "./components/icons";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [report, setReport] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const {
    processImage,
    processingStep,
    processedImages,
    error: processorError,
    reset: resetProcessor,
  } = useImageProcessor();

  const handleImageUpload = useCallback(
    async (file: File) => {
      setAppState("processing");
      setAnalysisError(null);
      try {
        await processImage(file);
        setAppState("success");
      } catch (e) {
        setAppState("error");
      }
    },
    [processImage],
  );

  const handleGenerateReport = useCallback(async () => {
    if (processedImages.length === 0) return;
    setAppState("analyzing");
    setAnalysisError(null);

    try {
      const generatedReport = await generateZwdReport(processedImages);
      if (generatedReport.startsWith("Error generating report:")) {
        throw new Error(generatedReport);
      }
      setReport(generatedReport);
      setAppState("reportReady");
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An unknown error occurred during analysis.";
      setAnalysisError(errorMessage);
      setAppState("error");
    }
  }, [processedImages]);

  const handleReset = useCallback(() => {
    resetProcessor();
    setReport("");
    setAnalysisError(null);
    setAppState("idle");
  }, [resetProcessor]);

  const renderContent = () => {
    const error = processorError || analysisError;

    switch (appState) {
      case "processing":
        return <ProcessingView step={processingStep} />;
      case "analyzing":
        return <AnalyzingView />;
      case "success":
        return (
          <ResultsView
            images={processedImages}
            onReset={handleReset}
            onGenerateReport={handleGenerateReport}
          />
        );
      case "reportReady":
        return <ReportView report={report} onReset={handleReset} />;
      case "error":
        return (
          <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
            <div className="mx-auto bg-red-900/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-red-500">
              <ErrorIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              An Error Occurred
            </h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
              Try Again
            </button>
          </div>
        );
      case "idle":
      default:
        return <ImageUploader onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-6xl flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
