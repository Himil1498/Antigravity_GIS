import React from "react";
import { showToast } from "../../../../../utils/toastUtils";
import { formatElevation } from "../../../../../utils/elevation/index";
import { formatDistance } from "../utils/elevationUtils";
import type { GraphType } from "../hooks/useChartConfig";
import { GraphTypeSelector } from "../components";

interface ToolbarActionsProps {
  graphType: GraphType;
  setGraphType: (v: GraphType) => void;
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
  elevationGain: number;
  loading: boolean;
  saving: boolean;
  elevationData: any[];
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
  measurementLabel?: string;
  onFocusMap?: () => void;
  isFocusActive?: boolean;
}

const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  graphType,
  setGraphType,
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
  elevationGain,
  bearing,
  loading,
  saving,
  elevationData,
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
  measurementLabel,
  onFocusMap,
  isFocusActive,
  showClearButton = true,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Statistics - Glass Capsule matching MapToolbar */}
      {shouldShowGraph && (
        <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] gap-1 mr-1">
          <span
            className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-blue-500 whitespace-nowrap"
            title="Total Path Distance"
          >
            📍 {measurementLabel ? `${measurementLabel} (${formatDistance(totalDistance)})` : formatDistance(totalDistance)}
          </span>
          {highPoint && (
            <span
              className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-green-700 dark:text-green-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-green-500 whitespace-nowrap"
              title="Highest Elevation Point along the path"
            >
              ⛰️ {formatElevation(highPoint.elevation)}
            </span>
          )}
          {lowPoint && (
            <span
              className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-cyan-500 whitespace-nowrap"
              title="Lowest Elevation Point along the path"
            >
              🏞️ {formatElevation(lowPoint.elevation)}
            </span>
          )}
          {elevationGain > 0 && (
            <span
              className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-purple-500 whitespace-nowrap"
              title="Cumulative Elevation Gain (Ascent)"
            >
              📈 {formatElevation(elevationGain)}
            </span>
          )}
          {bearing !== null && (
            <>
              <span
                className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-orange-500 whitespace-nowrap"
                title="Forward Azimuth / Bearing (from Point A to Point B)"
              >
                📐 A→B: {bearing.toFixed(1)}°
              </span>
              <span
                className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-orange-500 whitespace-nowrap"
                title="Reverse Azimuth / Bearing (from Point B to Point A)"
              >
                📐 B→A: {((bearing + 180) % 360).toFixed(1)}°
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] gap-1">

      {/* Graph Type Selector */}
      {shouldShowGraph && (
        <GraphTypeSelector graphType={graphType} setGraphType={setGraphType} />
      )}

      {/* Target/Zoom to Fit Button */}
      {shouldShowGraph && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("zoomToElevationPath"))}
          className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
          title="Zoom to Path"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8V5h3m8 0h3v3m0 8v3h-3m-8 0H5v-3" />
          </svg>
        </button>
      )}

      {/* Expand/Collapse Toggle */}
      {shouldShowGraph && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
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
                d="M4 14h16M4 10h16M8 5l4 4 4-4M8 19l4-4 4 4"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4M4 12h16"
              />
            )}
          </svg>
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
          className={`group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${
            isHoverEnabled
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
              : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
          }`}
          title={isHoverEnabled ? "Live preview ON" : "Live preview OFF"}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </button>
      )}

      {/* Fullscreen Expand Button */}
      {shouldShowGraph && (
        <button
          onClick={() => setShowFullGraph(true)}
          className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
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
        </button>
      )}

      {/* Action Buttons */}
      {showClearButton && (
        <button
          onClick={clearAll}
          disabled={points.length === 0}
          className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear All"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      )}

      {measurementLabel !== "Feasibility Path" && (
        <button
          onClick={toggleEditMode}
          disabled={points.length < 2}
          className={`group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditMode
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
          }`}
          title="Edit Points"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
      )}

      {onFocusMap && (
        <button
          onClick={onFocusMap}
          className={`group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${
            isFocusActive 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
              : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          }`}
          title={isFocusActive ? "Restore Side Panels" : "Map Focus Mode (Collapse Side Panels)"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">
            {isFocusActive ? "Restore Panels" : "Focus Map"}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsMinimized(!isMinimized)}
        className="group relative h-9 w-9 rounded-lg flex justify-center items-center transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            )}
        </svg>
      </button>

      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="group relative h-9 w-9 rounded-lg flex justify-center items-center transition-all duration-300 z-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
          title="Close Tool"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:rotate-90 group-hover:scale-110"
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
    </div>
  );
};

export default ToolbarActions;
