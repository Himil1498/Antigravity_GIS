import React from "react";

interface ElevationPromptProps {
  loadingElevation: boolean;
  fetchElevationForPoints: () => void;
  setShowElevationPrompt: (show: boolean) => void;
}

const ElevationPrompt: React.FC<ElevationPromptProps> = ({
  loadingElevation,
  fetchElevationForPoints,
  setShowElevationPrompt
}) => {
  return (
    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
        📊 Would you like to fetch elevation data for this measurement?
      </p>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            fetchElevationForPoints();
          }}
          disabled={loadingElevation}
          className="flex-1 px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-all"
        >
          {loadingElevation ? "Loading..." : "Yes, Get Elevation"}
        </button>
        <button
          onClick={() => setShowElevationPrompt(false)}
          className="flex-1 px-3 py-1.5 text-xs font-bold bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
        >
          Not Now
        </button>
      </div>
    </div>
  );
};

export default ElevationPrompt;

