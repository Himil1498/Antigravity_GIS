/**
 * Center Position Display Component
 * Shows the default center position coordinates
 */

import React from 'react';

interface CenterPositionDisplayProps {
  defaultCenter: { lat: number; lng: number } | null;
  useCurrentView: boolean;
}

const CenterPositionDisplay: React.FC<CenterPositionDisplayProps> = ({
  defaultCenter,
  useCurrentView
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Default Center Position
      </label>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {defaultCenter ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Latitude:
              </span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md">
                {defaultCenter.lat.toFixed(6)}°
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Longitude:
              </span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md">
                {defaultCenter.lng.toFixed(6)}°
              </span>
            </div>
            {useCurrentView && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Using current map view
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Using system default (All India view)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterPositionDisplay;

