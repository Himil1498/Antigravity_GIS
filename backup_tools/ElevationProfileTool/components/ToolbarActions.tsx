import React from "react";
import { showToast } from "../../../../../utils/toastUtils";
import { formatElevation } from "../../../../../utils/elevation/index";
import { formatDistance } from "../utils/index";

interface ToolbarActionsProps {
  shouldShowGraph: boolean;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  isHoverEnabled: boolean;
  setIsHoverEnabled: (v: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
  isEditMode: boolean;
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

const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  shouldShowGraph,
  isExpanded,
  setIsExpanded,
  isHoverEnabled,
  setIsHoverEnabled,
  isMinimized,
  setIsMinimized,
  isEditMode,
  points,
  totalDistance,
  highPoint,
  lowPoint,
  bearing,
  loading,
  saving,
  elevationData,
  showLOSAnalysis,
  clearAll,
  toggleEditMode,
  setShowSaveDialog,
  setShowFullGraph,
  handleView3D,
  handleClose,
  hoverMarker,
  hoverInfoWindow,
  setHoveredDataIndex,
  onClose,
  showClearButton = true,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Statistics - Inline when collapsed */}
      {!isExpanded && shouldShowGraph && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold shrink-0">
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
          {bearing !== null && (
            <>
              <span
                className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded"
                title="Bearing from Point A to Point B"
              >
                📐 A→B: {bearing.toFixed(1)}°
              </span>
              <span
                className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded"
                title="Bearing from Point B to Point A"
              >
                📐 B→A: {((bearing + 180) % 360).toFixed(1)}°
              </span>
            </>
          )}
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      {shouldShowGraph && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all text-xs font-bold shadow-sm"
          title={isExpanded ? "Minimize" : "Maximize"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isExpanded ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            )}
          </svg>
          <span>{isExpanded ? "Mini" : "Max"}</span>
        </button>
      )}

      {/* Live Preview Toggle */}
      {shouldShowGraph && (
        <button
          onClick={() => {
            const newState = !isHoverEnabled;
            setIsHoverEnabled(newState);
            if (!newState) {
              if (hoverMarker) hoverMarker.setMap(null);
              if (hoverInfoWindow) hoverInfoWindow.close();
              setHoveredDataIndex(null);
              showToast.info("Live preview disabled");
            } else {
              showToast.success("Live preview enabled");
            }
          }}
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all text-xs font-bold shadow-sm ${
            isHoverEnabled
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white ring-2 ring-amber-300"
              : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300"
          }`}
          title={isHoverEnabled ? "Live preview ON" : "Live preview OFF"}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{isHoverEnabled ? "LIVE" : "OFF"}</span>
        </button>
      )}

      {/* Fullscreen Expand Button */}
      {shouldShowGraph && (
        <button
          onClick={() => setShowFullGraph(true)}
          className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all text-xs font-bold shadow-sm"
          title="Open Fullscreen"
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          <span>Full</span>
        </button>
      )}

      {/* Action Buttons */}
      {showClearButton && (
        <button
          onClick={clearAll}
          disabled={points.length === 0}
          className="px-2 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200 dark:border-red-800"
          title="Clear All"
        >
          Clear
        </button>
      )}

      <button
        onClick={toggleEditMode}
        disabled={points.length < 2}
        className={`px-2 py-1.5 text-xs font-bold rounded-lg transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
          isEditMode
            ? "text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400 shadow-md"
            : "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800"
        }`}
        title="Edit Points"
      >
        {isEditMode ? "✓" : "Edit"}
      </button>

      <button
        onClick={() => setShowSaveDialog(true)}
        disabled={points.length < 2 || elevationData.length === 0 || saving}
        className="px-2 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md border border-blue-500"
        title="Save Profile"
      >
        {saving ? "..." : "Save"}
      </button>

      {/* View in 3D Button */}
      {points.length >= 2 && elevationData.length > 0 && showLOSAnalysis && (
        <button
          onClick={handleView3D}
          disabled={loading || saving}
          className="px-2 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md border border-indigo-500"
          title="View in 3D Map"
        >
          🌐 3D
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsMinimized(!isMinimized)}
        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all"
        title={isMinimized ? "Maximize" : "Minimize"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMinimized ? (
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

      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded transition-all duration-300 group cursor-pointer"
          title="Close Tool"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:rotate-90 group-hover:scale-110"
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
      )}
    </div>
  );
};

export default ToolbarActions;
