import React from "react";
import { Line, Bar, Scatter } from "react-chartjs-2";
import { formatElevation } from "../../../../../utils/elevation/index";
import { formatDistance } from "../utils/elevationUtils";
import type { GraphType } from "../hooks/useChartConfig";

interface ElevationPoint {
  elevation: number;
  distance?: number;
}

interface FullscreenGraphModalProps {
  totalDistance: number;
  highPoint: ElevationPoint | null;
  lowPoint: ElevationPoint | null;
  setShowFullGraph: (show: boolean) => void;
  chartData: any;
  chartOptions: any;
  graphType: GraphType;
  handleGraphHover: (event: any, elements: any[]) => void;
}

const FullscreenGraphModal: React.FC<FullscreenGraphModalProps> = ({
  totalDistance,
  highPoint,
  lowPoint,
  setShowFullGraph,
  chartData,
  chartOptions,
  graphType,
  handleGraphHover
}) => {
  const mergedOptions = {
    ...chartOptions,
    onHover: (event: any, elements: any[]) => {
      handleGraphHover(event, elements);
    },
  };

  const renderChart = () => {
    switch (graphType) {
      case 'bar':
        return <Bar data={chartData} options={mergedOptions} />;
      case 'scatter':
      case 'area':
      case 'line':
      case 'spline':
      case 'gradient':
      default:
        return <Line data={chartData} options={mergedOptions} />;
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-black bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full h-full p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg
                className="w-8 h-8 mr-3 text-blue-600"
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
              Elevation Profile - Fullscreen
            </h3>
            <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <strong className="mr-1">Distance:</strong>{" "}
                {formatDistance(totalDistance)}
              </span>
              <span className="flex items-center">
                <strong className="mr-1 text-green-600">⛰️ High:</strong>{" "}
                {highPoint ? formatElevation(highPoint.elevation) : "N/A"}
              </span>
              <span className="flex items-center">
                <strong className="mr-1 text-blue-600">🏞️ Low:</strong>{" "}
                {lowPoint ? formatElevation(lowPoint.elevation) : "N/A"}
              </span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 flex items-center font-semibold">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
              Hover over graph to see location on map • Click any point to
              pin it
            </p>
          </div>
          <button
            onClick={() => setShowFullGraph(false)}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 font-bold shadow-lg"
          >
            <svg
              className="w-5 h-5"
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
            <span>Close</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
          {renderChart()}
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center items-center space-x-8 text-sm flex-wrap gap-3">
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            <span className="text-green-700 dark:text-green-300 font-semibold">
              Highest Point
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
            <span className="text-blue-700 dark:text-blue-300 font-semibold">
              Lowest Point
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">
              Hover Point
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-800">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-purple-700 dark:text-purple-300 font-semibold">
              Pinned Location
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenGraphModal;

