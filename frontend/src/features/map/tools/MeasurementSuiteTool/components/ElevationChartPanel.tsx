import React from "react";
import { Line, Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { SegmentAnalysisTable } from "./index";
import type { GraphType } from "../hooks/useChartConfig";

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ElevationChartPanelProps {
  loading: boolean;
  isExpanded: boolean;
  shouldShowGraph: boolean;
  chartData: any;
  chartOptions: any;
  chartRef: React.RefObject<any>;
  graphType: GraphType;
  // Statistics
  totalDistance: number;
  highPoint: any;
  lowPoint: any;
  elevationGain: number;
  bearing: number | null;
  // Multi-point
  multiPointMode: boolean;
  segmentElevationStats: any[];
}

const ElevationChartPanel: React.FC<ElevationChartPanelProps> = ({
  loading,
  isExpanded,
  shouldShowGraph,
  chartData,
  chartOptions,
  chartRef,
  graphType,
  totalDistance,
  highPoint,
  lowPoint,
  elevationGain,
  bearing,
  multiPointMode,
  segmentElevationStats
}) => {
  const renderChart = () => {
    switch (graphType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} ref={chartRef} />;
      case 'scatter':
      case 'area':
      case 'line':
      case 'spline':
      case 'gradient':
      default:
        return <Line data={chartData} options={chartOptions} ref={chartRef} />;
    }
  };

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="mb-2 p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
            Calculating elevation profile...
          </p>
        </div>
      )}

      {/* Graph Section - Only show when data is available */}
      {shouldShowGraph && (
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <div
            className={`flex-1 min-h-[160px] w-full shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner ${
              isExpanded ? "p-3" : "p-2"
            }`}
          >
            {renderChart()}
          </div>

          {/* Segment Analysis Table - Multi-Point Mode */}
          {isExpanded && multiPointMode && segmentElevationStats.length > 0 && (
            <SegmentAnalysisTable segmentElevationStats={segmentElevationStats} />
          )}
        </div>
      )}
    </>
  );
};

export default ElevationChartPanel;

