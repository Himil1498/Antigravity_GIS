import React from "react";
import { formatElevation } from "../../../../../utils/elevation/index";
import { formatDistance } from "../utils/index";

interface ElevationPoint {
  elevation: number;
  distance?: number;
}

interface StatisticsGridProps {
  totalDistance: number;
  highPoint: ElevationPoint | null;
  lowPoint: ElevationPoint | null;
  elevationGain: number;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  totalDistance,
  highPoint,
  lowPoint,
  elevationGain
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Distance
        </div>
        <div className="text-base font-bold text-blue-700 dark:text-blue-300">
          {formatDistance(totalDistance)}
        </div>
      </div>
      {highPoint && (
        <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            ⛰️ Highest
          </div>
          <div className="text-base font-bold text-green-700 dark:text-green-300">
            {formatElevation(highPoint.elevation)}
          </div>
        </div>
      )}
      {lowPoint && (
        <div className="p-2 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-lg border border-cyan-200 dark:border-cyan-700">
          <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
            🏞️ Lowest
          </div>
          <div className="text-base font-bold text-cyan-700 dark:text-cyan-300">
            {formatElevation(lowPoint.elevation)}
          </div>
        </div>
      )}
      <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
          ↑ Gain
        </div>
        <div className="text-base font-bold text-purple-700 dark:text-purple-300">
          {formatElevation(elevationGain)}
        </div>
      </div>
    </div>
  );
};

export default StatisticsGrid;

