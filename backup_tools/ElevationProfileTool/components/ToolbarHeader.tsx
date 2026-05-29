import React from "react";
import ToolbarActions from "./ToolbarActions";

interface ToolbarHeaderProps {
  shouldShowGraph: boolean;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  isHoverEnabled: boolean;
  setIsHoverEnabled: (v: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  isEditMode: boolean;
  multiPointMode: boolean;
  setMultiPointMode: (v: boolean) => void;
  points: any[];
  totalDistance: number;
  highPoint: any;
  lowPoint: any;
  bearing: number | null;
  loading: boolean;
  saving: boolean;
  elevationData: any[];
  showLOSAnalysis: boolean;
  showClearButton?: boolean;
  // Handlers
  clearAll: () => void;
  toggleEditMode: () => void;
  setShowSaveDialog: (v: boolean) => void;
  setShowFullGraph: (v: boolean) => void;
  handleView3D: () => void;
  handleClose: () => void;
  // Hover cleanup
  hoverMarker: google.maps.Marker | null;
  hoverInfoWindow: google.maps.InfoWindow | null;
  setHoveredDataIndex: (v: number | null) => void;
  onClose?: () => void;
}

const ToolbarHeader: React.FC<ToolbarHeaderProps> = (props) => {
  const {
    shouldShowGraph,
    isExpanded,
    multiPointMode,
    setMultiPointMode,
    points
  } = props;

  return (
    <div
      className={`flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 w-full ${
        shouldShowGraph ? (isExpanded ? "mb-1" : "mb-2") : "mb-0"
      }`}
    >
      {/* Left Section - Title and Instructions */}
      <div className="flex items-center space-x-3 mr-4 shrink-0">
        <h3
          className={`${
            shouldShowGraph && isExpanded ? "text-lg" : "text-sm"
          } font-bold text-orange-600 dark:text-orange-400 flex items-center whitespace-nowrap`}
        >
          <span className={`${
            shouldShowGraph && isExpanded ? "text-xl" : "text-base"
          } mr-2`}>⛰️</span>
          Elevation Profile
        </h3>

        {/* Instructions - Compact */}
        {!shouldShowGraph && (
          <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
              {points.length === 0
                ? "🅰️ Click map to place start point"
                : multiPointMode
                ? points.length === 1
                  ? "🅱️ Click to add more points (multi-point mode)"
                  : `Point ${String.fromCharCode(65 + points.length)} - Click to add`
                : points.length === 1
                ? "🅱️ Click map to place end point"
                : "✓ Profile ready!"}
            </p>
          </div>
        )}

        {/* Multi-Point Mode Toggle */}
        {points.length === 0 && (
          <label className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <input
              type="checkbox"
              checked={multiPointMode}
              onChange={(e) => setMultiPointMode(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-white dark:bg-gray-700 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Multi-Point Mode
            </span>
          </label>
        )}

        {shouldShowGraph && !isExpanded && (
          <div className="px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-200 font-medium">
              ✓ Profile generated!
            </p>
          </div>
        )}
      </div>

      {/* Right Section - All Action Buttons */}
      <ToolbarActions {...props} />
    </div>
  );
};

export default ToolbarHeader;

