/**
 * Fullscreen Button Component
 * Button to toggle fullscreen mode
 */

import React from 'react';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFullscreen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 z-10 text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
      aria-label={isFullscreen ? 'Exit full screen mode' : 'Enter full screen mode'}
    >
      {isFullscreen ? (
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:scale-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      )}
    </button>
  );
};

export default FullscreenButton;

