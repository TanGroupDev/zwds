import React, { useState, useCallback, DragEvent } from "react";
import { UploadIcon } from "./icons";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
      } else {
        alert("Please upload a valid image file.");
      }
    }
  };

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [onImageUpload],
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
        isDragging
          ? "border-indigo-400 bg-gray-800/50 scale-105"
          : "border-gray-600 bg-gray-800"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`p-4 rounded-full transition-colors duration-300 ${
            isDragging ? "bg-indigo-500/20" : "bg-gray-700"
          }`}
        >
          <UploadIcon
            className={`w-12 h-12 transition-colors duration-300 ${
              isDragging ? "text-indigo-300" : "text-gray-400"
            }`}
          />
        </div>
        <p className="mt-4 text-xl font-semibold text-gray-200">
          Drag & drop your chart image here
        </p>
        <p className="mt-1 text-gray-400">or</p>
        <label
          htmlFor="file-upload"
          className="mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
        >
          Browse Files
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <p className="mt-4 text-sm text-gray-500">Supports PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};

export default ImageUploader;
