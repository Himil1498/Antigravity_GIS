/**
 * Log Details Modal Header Component
 * Displays modal title, entry ID, and close button
 */

import React from 'react';

interface LogDetailsModalHeaderProps {
  logId: string;
  onClose: () => void;
}

const LogDetailsModalHeader: React.FC<LogDetailsModalHeaderProps> = ({
  logId,
  onClose,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-t-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Audit Log Details
          </h3>
          <p className="text-blue-100 text-sm">Entry #{logId}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="p-1.5 text-white/80 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
      >
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default LogDetailsModalHeader;

