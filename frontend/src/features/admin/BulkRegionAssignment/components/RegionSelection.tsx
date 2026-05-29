import React from 'react';
import { INDIAN_STATES } from '../../../../utils/regionMapping/constants';

interface RegionSelectionProps {
  selectedRegions: string[];
  handleRegionToggle: (region: string) => void;
  handleSelectAllRegions: () => void;
}

const RegionSelection: React.FC<RegionSelectionProps> = ({
  selectedRegions,
  handleRegionToggle,
  handleSelectAllRegions
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg border-2 border-amber-100 dark:border-amber-900/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
            Select Regions ({selectedRegions.length}/{INDIAN_STATES.length})
          </h3>
        </div>
        <button
          onClick={handleSelectAllRegions}
          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          {selectedRegions.length === INDIAN_STATES.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {INDIAN_STATES.map(region => (
          <label
            key={region}
            className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedRegions.includes(region)}
              onChange={() => handleRegionToggle(region)}
              className="mr-3"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              {region}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RegionSelection;

