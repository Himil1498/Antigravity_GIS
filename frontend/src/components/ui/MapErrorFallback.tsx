import React from "react";

interface MapErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const MapErrorFallback: React.FC<MapErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="text-center p-6 max-w-sm">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Map Failed to Load
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {error?.message ||
            "An unexpected error occurred while loading the map."}
        </p>
        <button
          onClick={() =>
            resetErrorBoundary ? resetErrorBoundary() : window.location.reload()
          }
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Retry Map
        </button>
      </div>
    </div>
  );
};

export default MapErrorFallback;

