/**
 * Quick Region Selector Component
 * Allows users to quickly jump to their assigned regions
 */

import React from 'react';

interface QuickRegionSelectorProps {
  assignedRegions: string[];
  onCenterOnRegion: (region: string) => void;
}

const QuickRegionSelector: React.FC<QuickRegionSelectorProps> = ({
  assignedRegions,
  onCenterOnRegion
}) => {
  if (assignedRegions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Quick Jump to Assigned Region
      </label>
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {assignedRegions.map((region) => (
          <button
            key={region}
            onClick={() => onCenterOnRegion(region)}
            className="group px-3 py-2.5 text-left text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 text-gray-900 dark:text-white rounded-lg transition-all border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-3 h-3 text-gray-400 group-hover:text-blue-600"
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
              <span className="font-medium">{region}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Click a region to center the map there
      </p>
    </div>
  );
};

export default QuickRegionSelector;

