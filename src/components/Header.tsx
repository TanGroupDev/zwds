import React, { useState } from "react";
import { ChartIcon } from "./icons";

export const Header: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("isLoggedIn");

    // Toast
    const toast = document.createElement("div");
    toast.textContent = "Logged out successfully!";
    toast.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      window.location.reload();
    }, 900);
  };

  return (
    <header className="w-full max-w-6xl mb-8 text-center relative">
      {/* Logout Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute right-0 top-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition"
      >
        Logout
      </button>

      {/* Confirm Logout Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-white mb-3">Are you sure?</h3>
            <p className="text-gray-300 mb-6">
              You will be logged out from the dashboard.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={doLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER TITLE */}
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
};
