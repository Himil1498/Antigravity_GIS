import React from "react";
import { Point } from "../types/distanceTypes";

interface StreetViewControlsProps {
  streetViewEnabled: boolean;
  setStreetViewEnabled: (enabled: boolean) => void;
  showStreetViewCoverage: boolean;
  setShowStreetViewCoverage: (show: boolean) => void;
  currentStreetViewPoint: number | null;
  points: Point[];
  navigateToPreviousPoint: () => void;
  navigateToNextPoint: () => void;
  exitStreetView: () => void;
}

const StreetViewControls: React.FC<StreetViewControlsProps> = ({
  streetViewEnabled,
  setStreetViewEnabled,
  showStreetViewCoverage,
  setShowStreetViewCoverage,
  currentStreetViewPoint,
  points,
  navigateToPreviousPoint,
  navigateToNextPoint,
  exitStreetView
}) => {
  return (
    <div className="mb-2 space-y-2">
      <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={streetViewEnabled}
          onChange={(e) => setStreetViewEnabled(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        <span>Enable Street View</span>
      </label>

      {streetViewEnabled && (
        <>
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showStreetViewCoverage}
              onChange={(e) =>
                setShowStreetViewCoverage(e.target.checked)
              }
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>Show Coverage Layer</span>
          </label>

          {currentStreetViewPoint !== null && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Viewing Point {points[currentStreetViewPoint]?.label}
                </span>
                <button
                  onClick={exitStreetView}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  title="Exit Street View"
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
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={navigateToPreviousPoint}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  title="Previous Point (← or P)"
                >
                  ← Previous
                </button>
                <button
                  onClick={navigateToNextPoint}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  title="Next Point (→ or N)"
                >
                  Next →
                </button>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Keyboard: arrow keys or N/P to navigate, ESC to exit
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StreetViewControls;

