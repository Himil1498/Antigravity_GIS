import React from "react";
import { formatDistance, formatElevation } from "../../../../utils/elevation/index";

// ============================================================================
// TYPES
// ============================================================================

interface StatsSummaryProps {
  totalDistance: number;
  maxElevation: number;
  minElevation: number;
  elevationGain: number;
  elevationLoss: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatsSummary Component
 * Displays key elevation statistics in a grid
 */
const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalDistance,
  maxElevation,
  minElevation,
  elevationGain,
  elevationLoss
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Distance
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">
        {formatDistance(totalDistance)}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
      <div className="text-xs text-green-600 dark:text-green-400 mb-1">
        ⛰️ Highest
      </div>
      <div className="text-lg font-bold text-green-700 dark:text-green-300">
        {formatElevation(maxElevation)}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
        🏞️ Lowest
      </div>
      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
        {formatElevation(minElevation)}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
        ↗️ Gain / ↘️ Loss
      </div>
      <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
        {formatElevation(elevationGain)} / {formatElevation(elevationLoss)}
      </div>
    </div>
  </div>
);

export default StatsSummary;

