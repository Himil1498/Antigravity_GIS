import React from "react";
import { getClearanceStatus, formatClearance, formatDistance } from "../../../../../utils/losAnalysis/index";
import AntennaControls from "./AntennaControls";

interface BuildingData {
  estimatedHeight?: boolean;
  [key: string]: any;
}

interface Obstruction {
  type: string;
  name?: string;
  distance: number;
  penetration: number;
}

interface AlternativePath {
  id: string;
  reason: string;
  improvement: string;
  estimatedImprovement: number;
}

interface LOSAnalysisData {
  isClear: boolean;
  clearancePercentage: number;
  worstClearance: number;
  obstructions: Obstruction[];
  alternativePaths?: AlternativePath[];
  statistics: {
    buildingsDetected: number;
    averageClearance: number;
  };
}

interface LOSAnalysisPanelProps {
  losAnalysis: LOSAnalysisData;
  showLOSAnalysis: boolean;
  setShowLOSAnalysis: (show: boolean) => void;
  antennaHeight1: number;
  setAntennaHeight1: (height: number) => void;
  antennaHeight2: number;
  setAntennaHeight2: (height: number) => void;
  rfFrequency: number;
  setRfFrequency: (freq: number) => void;
  buildingData: BuildingData[];
  loadingBuildings: boolean;
}

const LOSAnalysisPanel: React.FC<LOSAnalysisPanelProps> = ({
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
  loadingBuildings
}) => {
  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Line-of-Sight Analysis
        </h4>
        <button
          onClick={() => setShowLOSAnalysis(!showLOSAnalysis)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            showLOSAnalysis
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {showLOSAnalysis ? "Hide" : "Show"} on Chart
        </button>
      </div>

      {/* Status Banner */}
      <div
        className={`p-3 rounded mb-3 ${
          losAnalysis.isClear
            ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
            : "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
        }`}
      >
        <div
          className={`font-bold text-lg ${
            losAnalysis.isClear
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }`}
        >
          {losAnalysis.isClear ? "✓ CLEAR LINE OF SIGHT" : "✗ OBSTRUCTED PATH"}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {losAnalysis.clearancePercentage.toFixed(1)}% Fresnel zone clearance • Status: {getClearanceStatus(losAnalysis.clearancePercentage)}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Worst Clearance</div>
          <div className={`font-bold text-lg ${losAnalysis.worstClearance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {formatClearance(losAnalysis.worstClearance)}
          </div>
        </div>
        <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Obstructions</div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{losAnalysis.obstructions.length}</div>
        </div>
        <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Buildings Detected</div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{losAnalysis.statistics.buildingsDetected}</div>
        </div>
        <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Clearance</div>
          <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatClearance(losAnalysis.statistics.averageClearance)}</div>
        </div>
      </div>

      {/* Antenna Controls */}
      <AntennaControls
        antennaHeight1={antennaHeight1}
        setAntennaHeight1={setAntennaHeight1}
        antennaHeight2={antennaHeight2}
        setAntennaHeight2={setAntennaHeight2}
        rfFrequency={rfFrequency}
        setRfFrequency={setRfFrequency}
      />

      {/* Obstructions List */}
      {losAnalysis.obstructions.length > 0 && (
        <div className="mb-3">
          <h5 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Identified Obstructions:</h5>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {losAnalysis.obstructions.map((obs: Obstruction, index: number) => (
              <div key={index} className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  {obs.type} {obs.name ? `- ${obs.name}` : ""}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  @ {formatDistance(obs.distance)} | {obs.penetration.toFixed(1)}m penetration
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Paths */}
      {losAnalysis.alternativePaths && losAnalysis.alternativePaths.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Suggested Solutions:</h5>
          <div className="space-y-2">
            {losAnalysis.alternativePaths.slice(0, 3).map((alt: AlternativePath) => (
              <div key={alt.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300 dark:border-yellow-700">
                <div className="font-medium text-sm text-gray-900 dark:text-white">{alt.reason}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alt.improvement}</div>
                <div className="text-right mt-1 font-bold text-yellow-600 dark:text-yellow-400">{alt.estimatedImprovement}% improvement</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Quality */}
      <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
        Data Quality:{" "}
        {buildingData.length > 0
          ? `${((buildingData.filter((b) => !b.estimatedHeight).length / buildingData.length) * 100).toFixed(0)}% actual heights`
          : "No data"}{" "}
        • Source: OpenStreetMap {loadingBuildings ? "(Loading...)" : "(Cached)"}
      </div>
    </div>
  );
};

export default LOSAnalysisPanel;

