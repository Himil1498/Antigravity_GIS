/**
 * Reset Button Component
 * Button to reset map to user preferences or India bounds
 */

import React from 'react';

interface ResetButtonProps {
  onClick: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 z-10 text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
      title="Reset to Preferences"
      aria-label="Reset map to user preferences or India bounds"
    >
      <svg
        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    </button>
  );
};

export default ResetButton;

