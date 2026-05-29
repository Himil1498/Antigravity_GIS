/**
 * Unified Map Toolbar (Refactored)
 * Main orchestrator component for GIS tools, layers, search, and map controls
 * Horizontal layout with all controls in a single toolbar
 */

import React from "react";
import type { MapToolbarProps } from "./types";
import { useToolSelection } from "./hooks/useToolSelection";
import GISToolsBar from "./components/GISToolsBar";
import ToolRenderer from "./components/ToolRenderer";
import GlobalSearch from "../GlobalSearch";
import MapControlsPanel from "../MapControls/index";
import Map3DControls from "../Map3DControls/Map3DControls";
import { useAppDispatch, useAppSelector } from "../../../../store/index";
import { useSearchParams } from "react-router-dom";
import { hasPermission } from "../../../../utils/permissionUtils/checks";
import { toast } from "react-toastify";
import {
  Map as MapIcon,
  Palette,
  Contrast,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  X,
  Lightbulb,
  Box,
  Cpu,
} from "lucide-react";

const MapToolbar: React.FC<MapToolbarProps> = ({
  map,
  layersState,
  onLayerToggle,
  onColorModeToggle,
  onOpenSettings,
  onDataSaved,
  userFilter = "me",
  selectedUserId,
  onUserFilterChange,
  onSelectedUserIdChange,
  onOpenNetworkCatalog,
  networkCatalogOpen,
  networkCatalogMinimized,
  showLabels = false,
  onToggleLabels,
  isZoomedIn = false,
  onToggleFeasibility,
  isFeasibilityActive = false,
  onToggleAutoFeasibility,
  isAutoFeasibilityActive = false,
  hideNetworkCatalog = false,
  hideStaffSurveys = false,
  hideGeometrySuite = false,
  hideTip = false,
  hideBoundaries = false,
  hideSearch = false,
  hideLocation = false,
  hideSettings = false,
  hideResetView = false,
  extraTools,
  leftAccessory,
}) => {
  // Custom hooks
  const {
    activeTool,
    toolInitialData,
    handleToolSelect,
    closeTool,
    closeToolWithData,
  } = useToolSelection();

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isToolbarCollapsed, setIsToolbarCollapsed] = React.useState(false);
  const [feasibilityPanels, setFeasibilityPanels] = React.useState({
    isSidebarOpen: false,
    isDetailsOpen: false,
  });
  const [isTipVisible, setIsTipVisible] = React.useState(true);
  const [is3D, setIs3D] = React.useState(false);
  const [isGeometrySuiteCollapsed, setIsGeometrySuiteCollapsed] = React.useState(false);

  const toggle3D = () => {
    if (!map) return;
    if (is3D) {
      map.setTilt(0);
      map.setHeading(0);
      setIs3D(false);
    } else {
      map.setTilt(67.5);
      map.setHeading(45);
      setIs3D(true);
    }
  };

  // Listen to external request to collapse/expand MapToolbar and handle Feasibility Panels state
  React.useEffect(() => {
    const handleRequestCollapse = (e: any) => {
      if (e.detail && typeof e.detail.collapse === "boolean") {
        setIsToolbarCollapsed(e.detail.collapse);
      }
    };
    const handlePanelsState = (e: any) => {
      if (e.detail) {
        setFeasibilityPanels(e.detail);
      }
    };
    const handleGeometryCollapsed = (e: any) => {
      if (e.detail && typeof e.detail.isCollapsed === "boolean") {
        setIsGeometrySuiteCollapsed(e.detail.isCollapsed);
      }
    };
    window.addEventListener("setMapToolbarCollapse" as any, handleRequestCollapse);
    window.addEventListener("feasibilityPanelsState" as any, handlePanelsState);
    window.addEventListener("geometrySuiteCollapsed" as any, handleGeometryCollapsed);
    return () => {
      window.removeEventListener("setMapToolbarCollapse" as any, handleRequestCollapse);
      window.removeEventListener("feasibilityPanelsState" as any, handlePanelsState);
      window.removeEventListener("geometrySuiteCollapsed" as any, handleGeometryCollapsed);
    };
  }, []);

  // Show welcome toast once per session
  React.useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("hasSeenAddressHint");
    if (!hasSeenWelcome) {
      setTimeout(() => {
        toast.info(
          "💡 Navigation Tip: Hold Shift+Click or Alt+Click anywhere on the map to pull up Address Details.",
          {
            position: "bottom-center",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          },
        );
        sessionStorage.setItem("hasSeenAddressHint", "true");
      }, 1500);
    }
  }, []);

  const isGeometrySuiteActive = activeTool === "measurementSuite";
  const hasLeftPanel =
    feasibilityPanels.isSidebarOpen || 
    (!!activeTool && !(isGeometrySuiteActive && isGeometrySuiteCollapsed)) || 
    networkCatalogOpen;
  const shouldShiftLeft = feasibilityPanels.isDetailsOpen && !hasLeftPanel;

  // Permission Checks using centralized utility
  const hasNetworkPermission = React.useMemo(() => {
    if (!user) return false;
    // Check specific permissions or wildcards handled by hasPermission
    return (
      hasPermission(user, "network:view") ||
      hasPermission(user, "network:infra:items")
    );
  }, [user]);

  const hasFeasibilityPermission = React.useMemo(() => {
    if (!user) return false;
    return hasPermission(user, "network:feasibility:view");
  }, [user]);

  const [searchParams] = useSearchParams();
  const isSearchOpen = searchParams.get("search") === "open";

  const [leftPanelWidthDOM, setLeftPanelWidthDOM] = React.useState(0);
  const [rightPanelWidthDOM, setRightPanelWidthDOM] = React.useState(0);

  React.useEffect(() => {
    const checkDOMWidths = () => {
      const leftPanel = document.getElementById("feasibility-surveys-sidebar");
      const rightPanel = document.getElementById("feasibility-study-panel");
      
      let leftW = 0;
      if (leftPanel) {
        const leftRect = leftPanel.getBoundingClientRect();
        if (leftRect.width > 0 && leftRect.left >= 0) {
          leftW = leftRect.width;
        }
      }
      setLeftPanelWidthDOM(leftW);

      let rightW = 0;
      if (rightPanel) {
        const rightRect = rightPanel.getBoundingClientRect();
        if (rightRect.width > 0 && rightRect.left < window.innerWidth && rightRect.right > 0) {
          rightW = rightRect.width;
        }
      }
      
      const afPanel = document.getElementById("auto-feasibility-results-panel");
      if (afPanel) {
        const afRect = afPanel.getBoundingClientRect();
        // ONLY trigger toolbar shifting if the Auto Feasibility Panel is in EXPAND mode (width > 400)
        if (afRect.width > 400 && afRect.left < window.innerWidth && afRect.right > 0) {
          rightW = Math.max(rightW, afRect.width);
        }
      }
      
      setRightPanelWidthDOM(rightW);
    };

    checkDOMWidths();
    const interval = setInterval(checkDOMWidths, 150);
    return () => clearInterval(interval);
  }, []);

  const isGeometrySuiteOpen = isGeometrySuiteActive && !isGeometrySuiteCollapsed;

  // Resolve actual widths including geometry suite
  let actualLeftWidth = leftPanelWidthDOM;
  if (isGeometrySuiteOpen && actualLeftWidth === 0) actualLeftWidth = 300;
  if (networkCatalogOpen && actualLeftWidth === 0) actualLeftWidth = 384;

  let actualRightWidth = rightPanelWidthDOM;

  let shiftOffset = 0;
  let shouldCompactToolbar = false;

  // Exact logic mapped to visual constraints
  if (actualLeftWidth > 0 && actualRightWidth > 0) {
    // Both panels are open. Stay perfectly centered between them.
    shiftOffset = (actualLeftWidth - actualRightWidth) / 2;
    // Hide labels ONLY if there isn't enough space (e.g. right panel is expanded to 520px)
    if (actualLeftWidth > 400 || actualRightWidth > 400) {
      shouldCompactToolbar = true;
    }
  } else if (actualLeftWidth > 0 && actualRightWidth === 0) {
    // Only Left Panel is open.
    // If it's a standard 300px panel, don't shift (keep perfectly centered).
    // If it's heavily expanded, shift right.
    if (actualLeftWidth > 400) {
      shiftOffset = actualLeftWidth / 2;
    } else {
      shiftOffset = 0;
    }
  } else if (actualLeftWidth === 0 && actualRightWidth > 0) {
    // Only Right Panel is open.
    // Shift left to avoid overlapping it.
    if (actualRightWidth > 400) {
      shiftOffset = -240; // Hardcoded optimal offset for 520px
    } else {
      shiftOffset = -actualRightWidth / 2;
    }
  }

  const shouldHideLabels = isSearchOpen || shouldCompactToolbar;

  return (
    <>
      {/* Unified Toolbar - Responsive */}
      {/* Unified Toolbar - Glassmorphic Redesign */}
      <div
        style={{
          transform: isToolbarCollapsed
            ? `translate(calc(-50% + ${shiftOffset}px), -100%)`
            : `translate(calc(-50% + ${shiftOffset}px), 0)`,
        }}
        className="absolute top-0 left-1/2 z-[45] flex pointer-events-none w-max max-w-[98%] transition-all duration-300"
      >
        {/* Main Glass Panel */}
        <div className="flex items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-xl border-x border-b border-t-0 border-white/40 dark:border-white/20 rounded-b-3xl p-1 pointer-events-auto divide-x divide-slate-300/50 dark:divide-slate-700/50">
          
          {/* Left Accessory (e.g. badges, custom panels) */}
          {leftAccessory && (
            <div className="flex items-center gap-1.5 px-2">
              {leftAccessory}
            </div>
          )}

          {/* Segment 1: GIS & Layers */}
          <div className="flex items-center gap-0.5 px-0.5">
            {/* GIS Tools Bar */}
            <GISToolsBar
              activeTool={activeTool}
              onToolSelect={handleToolSelect}
              hideLabels={shouldHideLabels}
              hideGeometrySuite={hideGeometrySuite}
            />

            {/* Network Data Button (Moved beside Geometry Suite) */}
            {onOpenNetworkCatalog &&
              hasNetworkPermission &&
              !hideNetworkCatalog && (
                <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                  <button
                    onClick={onOpenNetworkCatalog}
                    className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${
                      networkCatalogOpen
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                    }`}
                    title="Network Data Catalog"
                  >
                    <span
                      className={`text-sm transition-transform duration-300 ${networkCatalogOpen ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"} inline-block`}
                    >
                      🌐
                    </span>
                    {!shouldHideLabels && (
                      <span className="whitespace-nowrap text-xs font-semibold">
                        Network Catalog
                      </span>
                    )}
                  </button>
                </div>
              )}

            {/* Feasibility Mode Button */}
            {onToggleFeasibility &&
              hasFeasibilityPermission &&
              !hideStaffSurveys && (
                <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                  <button
                    onClick={onToggleFeasibility}
                    className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${
                      isFeasibilityActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                    }`}
                    title={
                      isFeasibilityActive
                        ? "Exit Staff Surveys Mode"
                        : "Staff Surveys Hub"
                    }
                  >
                    <ClipboardCheck
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isFeasibilityActive
                          ? "scale-110"
                          : "text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:-translate-y-0.5"
                      }`}
                    />
                    {!shouldHideLabels && (
                      <span className="whitespace-nowrap text-xs font-semibold">
                        Staff Surveys
                      </span>
                    )}
                  </button>
                </div>
              )}

            {/* Auto Feasibility Button */}
            {onToggleAutoFeasibility &&
              hasNetworkPermission && (
                <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                  <button
                    onClick={onToggleAutoFeasibility}
                    className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${
                      isAutoFeasibilityActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                    }`}
                    title="Auto Feasibility Checker"
                  >
                    <Cpu
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isAutoFeasibilityActive
                          ? "scale-110"
                          : "text-emerald-500 dark:text-emerald-400 group-hover:scale-110 group-hover:-translate-y-0.5"
                      }`}
                    />
                    {!shouldHideLabels && (
                      <span className="whitespace-nowrap text-xs font-semibold">
                        Auto Feasibility
                      </span>
                    )}
                  </button>
                </div>
              )}

            {/* Boundaries Toggle & Color Mode Split Button */}
            {!hideBoundaries && (
            <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <button
                onClick={() => onLayerToggle("RegionBoundaries")}
                className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${
                  layersState.RegionBoundaries?.visible
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                }`}
                title={
                  layersState.RegionBoundaries?.visible
                    ? "Hide Boundaries"
                    : "Show Boundaries"
                }
              >
                <span
                  className={`transition-transform duration-300 ${layersState.RegionBoundaries?.visible ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"} inline-block`}
                >
                  <MapIcon
                    size={16}
                    strokeWidth={
                      layersState.RegionBoundaries?.visible ? 2.5 : 2
                    }
                  />
                </span>
                {!shouldHideLabels && (
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Boundaries
                  </span>
                )}
              </button>

              {layersState.RegionBoundaries?.visible && (
                <button
                  onClick={() => onColorModeToggle?.("RegionBoundaries")}
                  className={`group relative h-8 w-8 ml-1 rounded-lg flex justify-center items-center transition-all duration-300 z-10 ${
                    layersState.RegionBoundaries?.monochrome
                      ? "bg-slate-700 text-white shadow-md shadow-slate-700/30"
                      : "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  }`}
                  title={
                    layersState.RegionBoundaries?.monochrome
                      ? "Switch to Colorful Boundaries"
                      : "Switch to Monochrome Boundaries"
                  }
                >
                  <span className="text-xs transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                    {layersState.RegionBoundaries?.monochrome ? "🔳" : "🌈"}
                  </span>
                </button>
              )}
            </div>
            )}

            {/* 3D Tilt Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <button
                onClick={toggle3D}
                className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${
                  is3D
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                }`}
                title={is3D ? "Disable 3D View" : "Enable 3D View"}
              >
                <span
                  className={`transition-transform duration-300 ${is3D ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"} inline-block`}
                >
                  <Box size={16} strokeWidth={is3D ? 2.5 : 2} />
                </span>
                {!shouldHideLabels && (
                  <span className="whitespace-nowrap text-xs font-semibold">
                    3D
                  </span>
                )}
              </button>
            </div>

            {/* Hint Button (Only visible if tip is closed manually) */}
            {!isTipVisible && !hideTip && (
              <div className="flex items-center p-0.5 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
                <button
                  onClick={() => setIsTipVisible(true)}
                  className="group relative h-8 w-8 rounded-lg flex justify-center items-center transition-all duration-300 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800/40"
                  title="Show Map Shortcuts Hint"
                >
                  <Lightbulb
                    size={18}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </button>
              </div>
            )}

            {/* Extra Tools (e.g. injected from Dark Fiber) */}
            {extraTools && (
              <div className="flex items-center gap-1.5 ml-1">
                {extraTools}
              </div>
            )}
          </div>

          {/* Segment 3: Search */}
          {!hideSearch && (
          <div className="flex items-center px-1">
            <div className="flex-shrink-0 max-w-lg">
              <GlobalSearch map={map} />
            </div>
          </div>
          )}

          {/* Segment 4: Map Controls */}
          <div className="flex items-center px-1">
            <MapControlsPanel map={map} onOpenSettings={hideSettings ? undefined : onOpenSettings} hideLocation={hideLocation} hideResetView={hideResetView} />
          </div>
        </div>

        {/* Collapse/Expand Handle Tab */}
        <button
          onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
          className={`
            absolute
            left-1/2
            -translate-x-1/2
            z-[10]
            
            flex
            items-center
            justify-center
            gap-1
            
            backdrop-blur-xl
            shadow-[0_4px_16px_rgba(30,41,59,0.4)]
            border-x
            border-b
            border-slate-500/30
            dark:border-white/20
            rounded-b-lg
            
            bg-slate-800/90
            dark:bg-slate-950/90
            
            text-white
            
            pointer-events-auto
            transition-all
            duration-300
            
            hover:bg-slate-700
            dark:hover:bg-slate-900
            hover:scale-105
            
            ${isToolbarCollapsed ? "bottom-[-20px] w-20 h-5 px-1.5" : "bottom-[-14px] w-14 h-[14px]"}
          `}
          title={isToolbarCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
          aria-label={
            isToolbarCollapsed ? "Expand Toolbar" : "Collapse Toolbar"
          }
        >
          {isToolbarCollapsed ? (
            <>
              <ChevronDown
                size={11}
                strokeWidth={3}
                className="text-white animate-bounce"
              />
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none select-none text-white">
                Tools
              </span>
            </>
          ) : (
            <ChevronUp size={12} strokeWidth={3} className="text-white" />
          )}
        </button>
      </div>

      {/* Render 3D Controls when is3D is active */}
      {is3D && map && (
        <div
          style={{
            transform: shouldShiftLeft
              ? "translate(calc(-50% - 240px), 0)"
              : "translate(-50%, 0)",
          }}
          className={`absolute left-1/2 z-40 flex pointer-events-none w-max transition-all duration-300 ${isToolbarCollapsed ? "top-8" : "top-[4.5rem]"}`}
        >
          <Map3DControls
            map={map}
            controls={{
              reset: () => {
                map.setTilt(0);
                map.setHeading(0);
                setIs3D(false);
              },
              adjustTilt: (tilt: number) => {
                map.setTilt(tilt);
              },
              rotate: (degrees: number) => {
                map.setHeading((map.getHeading() || 0) + degrees);
              },
            }}
            onClose={() => setIs3D(false)}
          />
        </div>
      )}

      {/* Tool Renderer - Conditionally renders active tool */}
      <ToolRenderer
        activeTool={hideGeometrySuite ? null : activeTool}
        toolInitialData={toolInitialData}
        map={map}
        onDataSaved={onDataSaved}
        onCloseTool={closeTool}
        onCloseToolWithData={closeToolWithData}
        networkCatalogOpen={networkCatalogOpen}
        networkCatalogMinimized={networkCatalogMinimized}
      />

      {/* Global Address Inspector Hint Pill */}
      {!hideTip && isTipVisible && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[45] pointer-events-none transition-opacity duration-500 opacity-80">
          <div className="bg-slate-900/70 dark:bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl text-white/90 text-[11px] font-medium tracking-wide flex items-center gap-2 pointer-events-auto">
            <span className="text-[13px]">💡</span>
            <span>
              Tip: Hold <strong className="text-blue-300">Shift</strong> or{" "}
              <strong className="text-blue-300">Alt</strong> + Click on map for
              Address. To open infowindow use{" "}
              <strong className="text-blue-300">Ctrl</strong> + Click.
            </span>
            <div className="w-px h-3 bg-white/20 mx-1"></div>
            <button
              onClick={() => setIsTipVisible(false)}
              className="text-slate-400 hover:text-white transition-colors"
              title="Close Tip"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapToolbar;
