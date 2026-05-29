import React from "react";

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ElevationLegend Component
 * Displays legend for measurement points and elevation markers
 */
const ElevationLegend: React.FC = () => (
  <div className="px-6 pb-4">
    <div className="flex flex-wrap gap-3 justify-center text-xs">
      <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200">
        <div
          className="w-4 h-4 bg-purple-600 border-2 border-white"
          style={{ transform: "rotate(45deg)" }}
        ></div>
        <span className="text-purple-700 dark:text-purple-300 font-semibold">
          Measurement Points
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200">
        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
        <span className="text-green-700 dark:text-green-300 font-semibold">
          Highest
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200">
        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
        <span className="text-blue-700 dark:text-blue-300 font-semibold">
          Lowest
        </span>
      </div>
    </div>
  </div>
);

export default ElevationLegend;

