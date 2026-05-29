import React from "react";
import { ElevationDataPoint } from "../types/distanceTypes";
import { formatElevation } from "../utils/distanceUtils";

interface ElevationStatsProps {
  highPoint: ElevationDataPoint | null;
  lowPoint: ElevationDataPoint | null;
  elevationGain: number;
  elevationLoss: number;
  setShowElevationDrawer: (show: boolean) => void;
  setShowFullGraph: (show: boolean) => void;
}

const ElevationStats: React.FC<ElevationStatsProps> = ({
  highPoint,
  lowPoint,
  elevationGain,
  elevationLoss,
  setShowElevationDrawer,
  setShowFullGraph
}) => {
  return (
    <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md border border-blue-200 dark:border-blue-800">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        <svg
          className="w-4 h-4 mr-1 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        Elevation Stats
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {highPoint && (
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-green-600 dark:text-green-400 font-medium">
              ⛰️ Highest
            </div>
            <div className="text-green-700 dark:text-green-300 font-bold">
              {formatElevation(highPoint.elevation)}
            </div>
          </div>
        )}
        {lowPoint && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded">
            <div className="text-cyan-600 dark:text-cyan-400 font-medium">
              🏞️ Lowest
            </div>
            <div className="text-cyan-700 dark:text-cyan-300 font-bold">
              {formatElevation(lowPoint.elevation)}
            </div>
          </div>
        )}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
          <div className="text-purple-600 dark:text-purple-400 font-medium">
            ↑ Gain
          </div>
          <div className="text-purple-700 dark:text-purple-300 font-bold">
            {formatElevation(elevationGain)}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
          <div className="text-orange-600 dark:text-orange-400 font-medium">
            ↓ Loss
          </div>
          <div className="text-orange-700 dark:text-orange-300 font-bold">
            {formatElevation(elevationLoss)}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 mt-2">
        <button
          onClick={() => setShowElevationDrawer(true)}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded hover:from-green-700 hover:to-green-800 flex items-center justify-center"
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          Show Graph
        </button>
        <button
          onClick={() => setShowFullGraph(true)}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded hover:from-blue-700 hover:to-blue-800 flex items-center justify-center"
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
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
          Fullscreen
        </button>
      </div>
    </div>
  );
};

export default ElevationStats;

