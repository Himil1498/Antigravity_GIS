import React from "react";

// ============================================================================
// TYPES
// ============================================================================

interface LOSAnalysisSectionProps {
  losAnalysis: any;
  antennaHeight1?: number;
  antennaHeight2?: number;
  rfFrequency?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LOSAnalysisSection Component
 * Displays Line of Sight analysis statistics and obstructions
 */
const LOSAnalysisSection: React.FC<LOSAnalysisSectionProps> = ({
  losAnalysis,
  antennaHeight1,
  antennaHeight2,
  rfFrequency
}) => {
  if (!losAnalysis) return null;

  return (
    <div className="px-6 pb-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Line of Sight Analysis
        </h4>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">LOS Status</div>
            <div className={`font-bold text-lg ${losAnalysis.hasLineOfSight ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {losAnalysis.hasLineOfSight ? '✅ Clear' : '❌ Blocked'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">Obstructions</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {losAnalysis.obstructions?.length || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">Buildings</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {losAnalysis.statistics?.buildingsDetected || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Clearance</div>
            <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {losAnalysis.statistics?.averageClearance !== undefined && !isNaN(Number(losAnalysis.statistics.averageClearance)) ? `${Number(losAnalysis.statistics.averageClearance).toFixed(1)}m` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Antenna Settings */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Antenna</div>
            <div className="font-bold text-gray-900 dark:text-white">{antennaHeight1 || 30}m</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Antenna</div>
            <div className="font-bold text-gray-900 dark:text-white">{antennaHeight2 || 30}m</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</div>
            <div className="font-bold text-gray-900 dark:text-white">{rfFrequency || 2400} MHz</div>
          </div>
        </div>

        {/* Obstructions List */}
        {losAnalysis.obstructions && losAnalysis.obstructions.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Identified Obstructions:</h5>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {losAnalysis.obstructions.map((obs: any, index: number) => (
                <div key={index} className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {obs.type} {obs.name ? `- ${obs.name}` : ''}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    @ {Number(obs.distance) < 1000 ? `${Number(obs.distance).toFixed(0)}m` : `${(Number(obs.distance) / 1000).toFixed(2)}km`} | {Number(obs.penetration).toFixed(1)}m penetration
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LOSAnalysisSection;

