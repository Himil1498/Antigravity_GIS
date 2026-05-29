import React from "react";

interface ElevationButtonProps {
  loadingElevation: boolean;
  fetchElevationForPoints: () => void;
}

const ElevationButton: React.FC<ElevationButtonProps> = ({
  loadingElevation,
  fetchElevationForPoints
}) => {
  return (
    <div className="mb-4">
      <button
        onClick={fetchElevationForPoints}
        disabled={loadingElevation}
        className="w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loadingElevation ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading Elevation...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Get Elevation Data
          </>
        )}
      </button>
    </div>
  );
};

export default ElevationButton;

