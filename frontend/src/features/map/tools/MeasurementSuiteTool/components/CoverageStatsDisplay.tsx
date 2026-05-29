/**
 * Coverage Stats Display
 * Shows calculated area and arc length of the sector
 */

import React from 'react';
import { formatArea, formatDistance } from '../utils/sectorUtils';

interface CoverageStatsDisplayProps {
  area: number;
  arcLength: number;
}

const CoverageStatsDisplay: React.FC<CoverageStatsDisplayProps> = ({ area, arcLength }) => {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Coverage Area
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Area:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {formatArea(area)}
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Arc:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {formatDistance(arcLength)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoverageStatsDisplay;

