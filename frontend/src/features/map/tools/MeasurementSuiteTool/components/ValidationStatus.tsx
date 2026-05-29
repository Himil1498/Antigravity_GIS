import React from "react";

interface ValidationStatusProps {
  isValidating: boolean;
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({
  isValidating,
}) => {
  if (!isValidating) return null;

  return (
    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
      <div className="flex items-center">
        <svg
          className="animate-spin h-4 w-4 text-yellow-600 mr-2"
          xmlns="http://www.w3.org/2000/svg"
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
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Validating location access...
        </p>
      </div>
    </div>
  );
};

export default ValidationStatus;

