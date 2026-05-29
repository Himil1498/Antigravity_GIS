/**
 * Zoom Controls Component
 * Provides zoom in and zoom out buttons
 */

import React from 'react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onZoomIn}
        className="group relative h-8 w-8 rounded-lg flex justify-center items-center text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 z-10"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="group relative h-8 w-8 rounded-lg flex justify-center items-center text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 z-10"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:scale-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default ZoomControls;

