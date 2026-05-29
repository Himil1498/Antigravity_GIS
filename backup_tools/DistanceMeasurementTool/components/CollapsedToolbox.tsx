import React from "react";
import { formatDistance } from "../utils/distanceUtils";
import { Point, ElevationDataPoint } from "../types/distanceTypes";

interface CollapsedToolboxProps {
  points: Point[];
  totalDistance: number;
  elevationData: ElevationDataPoint[];
  showElevationDrawer: boolean;
  setShowElevationDrawer: (show: boolean) => void;
  undoLastPoint: () => void;
  clearAll: () => void;
  setIsToolboxCollapsed: (collapsed: boolean) => void;
  containerStyle?: React.CSSProperties;
}

const CollapsedToolbox: React.FC<CollapsedToolboxProps> = ({
  points,
  totalDistance,
  elevationData,
  showElevationDrawer,
  setShowElevationDrawer,
  undoLastPoint,
  clearAll,
  setIsToolboxCollapsed,
  containerStyle
}) => {
  return (
    <div 
       className="fixed top-16 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-2xl border-2 border-blue-400 dark:border-blue-500 p-3 z-40 transition-all duration-300 ease-in-out"
       style={containerStyle}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-white font-bold text-sm">
            Distance Tool
          </span>
        </div>

        {points.length > 0 && (
          <>
            <div className="flex items-center space-x-2 px-2 py-1 bg-white/20 rounded text-white text-xs font-bold">
              <span>{points.length} pts</span>
              {totalDistance > 0 && (
                <>
                  <span>•</span>
                  <span>{formatDistance(totalDistance)}</span>
                </>
              )}
              {elevationData.length > 0 && (
                <>
                  <span>•</span>
                  <span
                    className="flex items-center gap-1"
                    title="Elevation data available"
                  >
                    📊
                    <span className="text-green-300">Elevation</span>
                  </span>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1">
              {/* Toggle Elevation Chart Quick Button */}
              {elevationData.length > 0 && (
                <button
                  onClick={() =>
                    setShowElevationDrawer(!showElevationDrawer)
                  }
                  className={`p-1.5 ${
                    showElevationDrawer
                      ? "bg-green-500/80 hover:bg-green-500"
                      : "bg-white/20 hover:bg-white/30"
                  } rounded transition-all`}
                  title={
                    showElevationDrawer
                      ? "Hide elevation chart"
                      : "Show elevation chart"
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 text-white"
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
                </button>
              )}
              <button
                onClick={undoLastPoint}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
                title="Undo last point"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                onClick={clearAll}
                className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded transition-all"
                title="Clear all"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setIsToolboxCollapsed(false)}
          className="ml-2 p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
          title="Expand toolbox"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CollapsedToolbox;

