import React from "react";
import { Line } from "react-chartjs-2";
import { ElevationDataPoint } from "../types/distanceTypes";
import { formatDistance, formatElevation } from "../utils/distanceUtils";

interface ElevationDrawerProps {
  elevationData: ElevationDataPoint[];
  totalDistance: number;
  highPoint: ElevationDataPoint | null;
  lowPoint: ElevationDataPoint | null;
  isDrawerMinimized: boolean;
  setIsDrawerMinimized: (minimized: boolean) => void;
  setShowElevationDrawer: (show: boolean) => void;
  isHoverEnabled: boolean;
  setIsHoverEnabled: (enabled: boolean) => void;
  chartData: any;
  chartOptions: any;
  chartRef: React.RefObject<any>;
  exportKML: () => void;
  exportGPX: () => void;
  exportCSV: () => void;
}

const ElevationDrawer: React.FC<ElevationDrawerProps> = ({
  elevationData,
  totalDistance,
  highPoint,
  lowPoint,
  isDrawerMinimized,
  setIsDrawerMinimized,
  setShowElevationDrawer,
  isHoverEnabled,
  setIsHoverEnabled,
  chartData,
  chartOptions,
  chartRef,
  exportKML,
  exportGPX,
  exportCSV
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl border-t-2 border-gray-300 dark:border-gray-600 z-50 transition-all duration-300 ${
        isDrawerMinimized ? "h-16" : "h-80"
      }`}
    >
      <div className="h-full flex flex-col p-3">
        {/* Drawer Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
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
              Elevation Profile
            </h3>

            {/* Stats inline when minimized */}
            {isDrawerMinimized && (
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {formatDistance(totalDistance)}
                </span>
                {highPoint && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    ⛰️ {formatElevation(highPoint.elevation)}
                  </span>
                )}
                {lowPoint && (
                  <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                    🏞️ {formatElevation(lowPoint.elevation)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Export Dropdown */}
            {!isDrawerMinimized && (
              <div className="relative group">
                <button
                  className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold shadow-sm transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  title="Export elevation data"
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Export</span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
                  <button
                    onClick={exportKML}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center space-x-2"
                  >
                    <span>📍</span>
                    <span>KML</span>
                  </button>
                  <button
                    onClick={exportGPX}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center space-x-2"
                  >
                    <span>🗺️</span>
                    <span>GPX</span>
                  </button>
                  <button
                    onClick={exportCSV}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hover Toggle */}
            {!isDrawerMinimized && (
              <button
                onClick={() => {
                  const newState = !isHoverEnabled;
                  setIsHoverEnabled(newState);
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold shadow-sm transition-all ${
                  isHoverEnabled
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white ring-2 ring-amber-300"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300"
                }`}
                title={
                  isHoverEnabled ? "Live preview ON" : "Live preview OFF"
                }
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{isHoverEnabled ? "LIVE" : "OFF"}</span>
              </button>
            )}

            {/* Minimize/Maximize Button */}
            <button
              onClick={() => setIsDrawerMinimized(!isDrawerMinimized)}
              className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded text-xs font-bold shadow-sm"
              title={isDrawerMinimized ? "Maximize" : "Minimize"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isDrawerMinimized ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                )}
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowElevationDrawer(false)}
              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold shadow-sm"
              title="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Graph Section */}
        {!isDrawerMinimized && (
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
            <Line
              data={chartData}
              options={chartOptions}
              ref={chartRef}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ElevationDrawer;

