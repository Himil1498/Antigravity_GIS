/**
 * Zoom Level Slider Component
 * Allows users to set their default zoom level for the map
 */

import React from 'react';
import { getZoomLevelLabel } from '../../utils';

interface ZoomLevelSliderProps {
  defaultZoom: number;
  setDefaultZoom: (zoom: number) => void;
}

const ZoomLevelSlider: React.FC<ZoomLevelSliderProps> = ({
  defaultZoom,
  setDefaultZoom
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          Default Zoom Level
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {defaultZoom}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
            {getZoomLevelLabel(defaultZoom)}
          </span>
        </div>
      </div>
      <input
        type="range"
        min="4"
        max="18"
        value={defaultZoom}
        onChange={(e) => setDefaultZoom(parseInt(e.target.value))}
        aria-label="Default zoom level"
        className="w-full h-3 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #93C5FD ${
            ((defaultZoom - 4) / 14) * 100
          }%, #E5E7EB ${((defaultZoom - 4) / 14) * 100}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
        <span className="flex flex-col items-center">
          <span className="font-medium">4</span>
          <span className="text-[10px]">Country</span>
        </span>
        <span className="flex flex-col items-center">
          <span className="font-medium">8</span>
          <span className="text-[10px]">State</span>
        </span>
        <span className="flex flex-col items-center">
          <span className="font-medium">12</span>
          <span className="text-[10px]">City</span>
        </span>
        <span className="flex flex-col items-center">
          <span className="font-medium">18</span>
          <span className="text-[10px]">Street</span>
        </span>
      </div>
    </div>
  );
};

export default ZoomLevelSlider;

