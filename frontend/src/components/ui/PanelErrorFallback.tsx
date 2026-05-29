import React from "react";

interface PanelErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
}

const PanelErrorFallback: React.FC<PanelErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Component Error",
}) => {
  return (
    <div className="h-full min-h-[150px] w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-3">
        <svg
          className="h-5 w-5 text-orange-600 dark:text-orange-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 line-clamp-2 px-4">
        {error?.message || "Failed to load component"}
      </p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default PanelErrorFallback;

