import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import {
  CopyIcon,
  DownloadIcon,
  RefreshIcon,
  FileTextIcon,
  ChevronDownIcon,
} from "./icons";

interface ReportViewProps {
  report: string;
  onReset: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(report).then(() => {
      setCopyButtonText("Copied!");
      setTimeout(() => setCopyButtonText("Copy"), 2000);
    });
  }, [report]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    triggerDownload(blob, "zwds_ai_report.txt");
  }, [report]);

  const handleDownloadDocx = useCallback(() => {
    const doc = new Document({
      sections: [
        {
          children: report.split("\n").map((line) => {
            const parts: TextRun[] = [];
            let lastIndex = 0;
            const regex = /\*\*(.*?)\*\*/g;
            let match;

            while ((match = regex.exec(line)) !== null) {
              if (match.index > lastIndex) {
                parts.push(new TextRun(line.substring(lastIndex, match.index)));
              }
              parts.push(new TextRun({ text: match[1], bold: true }));
              lastIndex = regex.lastIndex;
            }

            if (lastIndex < line.length) {
              parts.push(new TextRun(line.substring(lastIndex)));
            }

            return new Paragraph({
              children: parts.length > 0 ? parts : [new TextRun(line)],
            });
          }),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      triggerDownload(blob, "zwds_ai_report.docx");
    });
  }, [report]);

  const handleDownloadPdf = useCallback(() => {
    const doc = new jsPDF();
    doc.setFont("Courier", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(report, 180);
    doc.text(lines, 15, 15);
    const blob = doc.output("blob");
    triggerDownload(blob, "zwds_ai_report.pdf");
  }, [report]);

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 flex-wrap gap-y-2">
        <div className="flex items-center gap-3">
          <FileTextIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-gray-100">
            AI Generated Report
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
            aria-label="Copy report to clipboard"
          >
            <CopyIcon className="w-4 h-4" />
            {copyButtonText}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
              aria-label="Download report options"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-600 rounded-md shadow-lg z-20 border border-gray-500">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={handleDownloadTxt}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500"
                    >
                      <FileTextIcon className="w-5 h-5 text-gray-300" /> As Text
                      (.txt)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDownloadDocx}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500"
                    >
                      <FileTextIcon className="w-5 h-5 text-blue-400" /> As Word
                      (.docx)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDownloadPdf}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500"
                    >
                      <FileTextIcon className="w-5 h-5 text-red-400" /> As PDF
                      (.pdf)
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
            aria-label="Start over"
          >
            <RefreshIcon className="w-4 h-4" />
            New Chart
          </button>
        </div>
      </header>
      <main className="p-6 bg-gray-900 flex-grow overflow-y-auto h-[60vh] custom-scrollbar">
        <pre className="text-gray-300 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
          {report}
        </pre>
      </main>
    </div>
  );
};

export default ReportView;
