import React from "react";
import { Line } from "react-chartjs-2";
import { StatisticsGrid, BearingDisplay, LOSAnalysisPanel, SegmentAnalysisTable } from "./index";

interface ElevationChartPanelProps {
  loading: boolean;
  isExpanded: boolean;
  shouldShowGraph: boolean;
  chartData: any;
  chartOptions: any;
  chartRef: React.RefObject<any>;
  // Statistics
  totalDistance: number;
  highPoint: any;
  lowPoint: any;
  elevationGain: number;
  bearing: number | null;
  // LOS
  losAnalysis: any;
  showLOSAnalysis: boolean;
  setShowLOSAnalysis: (v: boolean) => void;
  antennaHeight1: number;
  setAntennaHeight1: (v: number) => void;
  antennaHeight2: number;
  setAntennaHeight2: (v: number) => void;
  rfFrequency: number;
  setRfFrequency: (v: number) => void;
  buildingData: any;
  loadingBuildings: boolean;
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
  totalDistance,
  highPoint,
  lowPoint,
  elevationGain,
  bearing,
  losAnalysis,
  showLOSAnalysis,
  setShowLOSAnalysis,
  antennaHeight1,
  setAntennaHeight1,
  antennaHeight2,
  setAntennaHeight2,
  rfFrequency,
  setRfFrequency,
  buildingData,
  loadingBuildings,
  multiPointMode,
  segmentElevationStats
}) => {
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
        <div className="flex-1">
          {/* Expanded View - Show Statistics Grid */}
          {isExpanded && (
            <div className="mb-2">
              <StatisticsGrid
                totalDistance={totalDistance}
                highPoint={highPoint}
                lowPoint={lowPoint}
                elevationGain={elevationGain}
              />
              {/* Bearing Display for two-point mode */}
              {bearing !== null && <BearingDisplay bearing={bearing} />}
            </div>
          )}

          <div
            className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner ${
              isExpanded ? "p-3 h-[calc(70vh-8rem)]" : "p-2 h-64"
            }`}
          >
            <Line data={chartData} options={chartOptions} ref={chartRef} />
          </div>

          {/* LOS Analysis Panel */}
          {losAnalysis && !multiPointMode && (
            <LOSAnalysisPanel
              losAnalysis={losAnalysis}
              showLOSAnalysis={showLOSAnalysis}
              setShowLOSAnalysis={setShowLOSAnalysis}
              antennaHeight1={antennaHeight1}
              setAntennaHeight1={setAntennaHeight1}
              antennaHeight2={antennaHeight2}
              setAntennaHeight2={setAntennaHeight2}
              rfFrequency={rfFrequency}
              setRfFrequency={setRfFrequency}
              buildingData={buildingData}
              loadingBuildings={loadingBuildings}
            />
          )}

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

