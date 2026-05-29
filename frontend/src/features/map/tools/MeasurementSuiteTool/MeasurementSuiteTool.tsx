import React, { useState } from "react";
import { Ruler, Hexagon, Circle as CircleIcon, Radio, Save, Trash2, Undo, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import { useDistanceMeasurement } from "./hooks/useDistanceMeasurement";
import { usePolygonDrawing } from "./hooks/usePolygonDrawing";
import { useCircleDrawing } from "./hooks/useCircleDrawing";
import { useSectorCenter } from "./hooks/useSectorCenter";
import { useSectorDrawing } from "./hooks/useSectorDrawing";
import { useSectorGeometry } from "./hooks/useSectorGeometry";
import { useAppSelector, useAppDispatch, RootState } from "../../../../store/index";
import { setNetworkCatalogMinimized } from "../../../../store/slices/mapSlice";
import AdvancedElevationDrawer from "./components/AdvancedElevationDrawer";
import { DistanceUnit, DISTANCE_UNITS, formatDistanceWithUnit } from "./utils/distanceUtils";
import { AreaUnit, AREA_UNITS, formatArea } from "./utils/areaUtils";
import { DEFAULT_RADIUS, DEFAULT_AZIMUTH, DEFAULT_BEAMWIDTH, DEFAULT_COLOR, DEFAULT_FILL_OPACITY } from "./constants/sectorConstants";

// Enhanced Tab Content
import PathTabContent from "./components/PathTabContent";
import AreaTabContent from "./components/AreaTabContent";
import CircleTabContent from "./components/CircleTabContent";
import SectorTabContent from "./components/SectorTabContent";

interface MeasurementSuiteToolProps {
  map: google.maps.Map | null;
  onSave?: (data?: any) => void;
  onClose: () => void;
  containerStyle?: React.CSSProperties;
  networkCatalogOpen?: boolean;
}

const MeasurementSuiteTool: React.FC<MeasurementSuiteToolProps> = ({
  map,
  onSave,
  onClose,
  containerStyle,
  networkCatalogOpen,
}) => {
  const [activeTab, setActiveTab] = useState<"path" | "area" | "circle" | "sector">("path");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqkm");
  const [isFocused, setIsFocused] = useState(() => !!(window as any).isGisFocusActive);

  // Broadcast collapsed state so MapToolbar knows when Geometry Suite is minimized
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("geometrySuiteCollapsed", { detail: { isCollapsed } })
    );
  }, [isCollapsed]);

  React.useEffect(() => {
    const handleFocusToggle = (e: any) => {
      if (e.detail && typeof e.detail.collapse === "boolean") {
        setIsFocused(e.detail.collapse);
      }
    };
    window.addEventListener("setMapToolbarCollapse" as any, handleFocusToggle);
    return () => window.removeEventListener("setMapToolbarCollapse" as any, handleFocusToggle);
  }, []);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { networkCatalogMinimized } = useAppSelector((state: RootState) => state.map);

  const handleFocusMap = () => {
    const nextState = !isCollapsed || !networkCatalogMinimized;
    setIsCollapsed(nextState);
    dispatch(setNetworkCatalogMinimized(nextState));
    (window as any).isGisFocusActive = nextState;

    // Dispatch event to also collapse/restore the MapToolbar
    window.dispatchEvent(
      new CustomEvent("setMapToolbarCollapse", { detail: { collapse: nextState } })
    );
  };

  const isFocusActive = isCollapsed && networkCatalogMinimized;

  // Sector States
  const [sectorRadius, setSectorRadius] = useState<number>(DEFAULT_RADIUS);
  const [azimuth, setAzimuth] = useState<number>(DEFAULT_AZIMUTH);
  const [beamwidth, setBeamwidth] = useState<number>(DEFAULT_BEAMWIDTH);
  const [sectorColor, setSectorColor] = useState<string>(DEFAULT_COLOR);
  const [sectorFillOpacity, setSectorFillOpacity] = useState<number>(DEFAULT_FILL_OPACITY);


  // ----------------------------------------------------
  // HOOKS INTEGRATION
  // ----------------------------------------------------
  // Distance Measurement Hook
  const pathData = useDistanceMeasurement(map, undefined, onSave, onClose, activeTab === "path", distanceUnit);

  // Polygon Area Hook
  const areaData = usePolygonDrawing({ map, onSave, isActive: activeTab === "area", areaUnit });

  // Circle Hook
  const circleData = useCircleDrawing({ map, onSave, onClose, isActive: activeTab === "circle" });

  // Sector RF Hooks
  const sectorCenter = useSectorCenter({ map, user, isActive: activeTab === "sector" });
  const sectorDrawing = useSectorDrawing({ map, center: sectorCenter.center, radius: sectorRadius, azimuth, beamwidth, color: sectorColor, fillOpacity: sectorFillOpacity, isActive: activeTab === "sector" });
  const sectorGeometry = useSectorGeometry({ radius: sectorRadius, beamwidth, center: sectorCenter.center });

  // ----------------------------------------------------
  // UI HELPERS
  // ----------------------------------------------------
  const handleUndo = () => {
    if (activeTab === "path") pathData.undoLastPoint();
    if (activeTab === "area") areaData.undoLastVertex();
    if (activeTab === "circle" && !circleData.state.center) circleData.actions.clearCircle();
  };

  const handleClearAll = React.useCallback(() => {
    pathData.clearAll();
    areaData.clearAll();
    circleData.actions.clearCircle();
    sectorDrawing.clearShapes();
    sectorCenter.clearCenter();
    sectorGeometry.clearGeometry();
  }, [
    pathData.clearAll, 
    areaData.clearAll, 
    circleData.actions.clearCircle, 
    sectorDrawing.clearShapes, 
    sectorCenter.clearCenter, 
    sectorGeometry.clearGeometry
  ]);

  const hasOpenedElevation = React.useRef(false);

  // Restore panels when showElevationDrawer is toggled off
  React.useEffect(() => {
    if (pathData.showElevationDrawer) {
      hasOpenedElevation.current = true;
    } else if (hasOpenedElevation.current) {
      setIsCollapsed(false);
      dispatch(setNetworkCatalogMinimized(false));
      (window as any).isGisFocusActive = false;
      window.dispatchEvent(
        new CustomEvent("setMapToolbarCollapse", { detail: { collapse: false } })
      );
      hasOpenedElevation.current = false;
    }
  }, [pathData.showElevationDrawer, dispatch]);

  const isFocusedRef = React.useRef(isFocused);
  React.useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  // Clean up and restore focus states on unmount
  React.useEffect(() => {
    return () => {
      dispatch(setNetworkCatalogMinimized(false));
      // Only restore global panels if Geometry Suite was actively focusing the map
      if (isFocusedRef.current) {
        (window as any).isGisFocusActive = false;
        window.dispatchEvent(
          new CustomEvent("setMapToolbarCollapse", { detail: { collapse: false } })
        );
      }
    };
  }, [dispatch]);

  // Intercept global close requests (e.g. from dropdown toggle)
  React.useEffect(() => {
    const handleRequestClose = (e: any) => {
      if (e.detail?.toolId === 'measurementSuite') {
        handleClearAll();
        onClose();
      }
    };
    window.addEventListener('requestGISToolClose', handleRequestClose);
    return () => window.removeEventListener('requestGISToolClose', handleRequestClose);
  }, [handleClearAll, onClose]);

  // Safe distance format
  const formattedDistance = pathData.totalDistance 
    ? formatDistanceWithUnit(pathData.totalDistance, distanceUnit)
    : `0.00 ${distanceUnit}`;

  // Safe area format
  const formattedArea = areaData.area 
    ? formatArea(areaData.area, areaUnit)
    : `0.00 ${areaUnit === 'sqkm' ? 'sq km' : areaUnit}`;

  return (
    <>
      {/* Primary Floating Sidebar */}
      <div
        className={`absolute top-0 left-0 w-[300px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-br-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200/50 dark:border-white/10 z-40 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden ${
          isCollapsed ? "h-[56px]" : ""
        }`}
        style={{
          ...containerStyle,
          transform: isFocused ? "translateX(-110%)" : (containerStyle?.transform || "none"),
          maxHeight: isCollapsed 
            ? "56px" 
            : "calc(100vh - 64px - var(--elevation-drawer-height, 0px))"
        }}
      >
        {/* Header - Standardized to match Catalog */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between h-[56px] px-5 border-b border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shadow-lg border border-white/20 transition-all duration-500 ${
                activeTab === "path" ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-blue-500/30" :
                activeTab === "area" ? "bg-gradient-to-b from-purple-500 to-purple-600 shadow-purple-500/30" :
                activeTab === "circle" ? "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-emerald-500/30" :
                "bg-gradient-to-b from-rose-500 to-rose-600 shadow-rose-500/30"
              }`}>
                {activeTab === "path" && <Ruler size={16} className="text-white" />}
                {activeTab === "area" && <Hexagon size={16} className="text-white" />}
                {activeTab === "circle" && <CircleIcon size={16} className="text-white" />}
                {activeTab === "sector" && <Radio size={16} className="text-white" />}
              </div>
              {activeTab === "path" ? "Path Measurement" : 
               activeTab === "area" ? "Area Calculation" : 
               activeTab === "circle" ? "Radius Analysis" : 
               "Sector RF Coverage"}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={
                  activeTab === "path" ? pathData.points.length === 0 : 
                  activeTab === "area" ? areaData.vertices.length === 0 :
                  activeTab === "circle" ? !circleData.state.center :
                  !sectorCenter.center
                }
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo Last Point"
              >
                <Undo size={15} />
              </button>
              <button
                onClick={handleClearAll}
                disabled={
                  pathData.points.length === 0 && 
                  areaData.vertices.length === 0 && 
                  !circleData.state.center &&
                  !sectorCenter.center
                }
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear All"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false);
                    setIsFocused(false);
                  } else {
                    setIsCollapsed(true);
                    setIsFocused(true);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                onClick={() => {
                  handleClearAll();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group"
                title="Close Tool"
              >
                <X size={16} className="transition-transform group-hover:rotate-90 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3 custom-scrollbar flex flex-col gap-3">
            {/* Mode Switcher */}
            <div className="flex bg-slate-200/50 dark:bg-slate-900/50 rounded-lg p-1 shrink-0">
              <button
                onClick={() => setActiveTab("path")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md flex justify-center items-center gap-1.5 transition-all ${
                  activeTab === "path"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Ruler size={13} /> Path
              </button>
              <button
                onClick={() => setActiveTab("area")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md flex justify-center items-center gap-1.5 transition-all ${
                  activeTab === "area"
                    ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Hexagon size={13} /> Area
              </button>
              <button
                onClick={() => setActiveTab("circle")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md flex justify-center items-center gap-1.5 transition-all ${
                  activeTab === "circle"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <CircleIcon size={13} /> Radius
              </button>
              <button
                onClick={() => setActiveTab("sector")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md flex justify-center items-center gap-1.5 transition-all ${
                  activeTab === "sector"
                    ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Radio size={13} /> Sector
              </button>
              </div>
              
              {/* Content Body */}
              <div className="pt-0 flex flex-col gap-3">

              {/* Path Tab - Enhanced */}
              {activeTab === "path" && (
                <PathTabContent
                  points={pathData.points}
                  segments={pathData.segments}
                  totalDistance={pathData.totalDistance}
                  distanceUnit={distanceUnit}
                  setDistanceUnit={setDistanceUnit}
                  formattedDistance={formattedDistance}
                  streetViewEnabled={pathData.streetViewEnabled}
                  setStreetViewEnabled={pathData.setStreetViewEnabled}
                  setShowStreetViewCoverage={pathData.setShowStreetViewCoverage}
                  exitStreetView={pathData.exitStreetView}
                  currentStreetViewPoint={pathData.currentStreetViewPoint}
                  streetViewAvailability={pathData.streetViewAvailability}
                  openStreetView={pathData.openStreetView}
                  showElevationDrawer={pathData.showElevationDrawer}
                  setShowElevationDrawer={pathData.setShowElevationDrawer}
                />
              )}

              {/* Area Tab - Enhanced */}
              {activeTab === "area" && (
                <AreaTabContent
                  vertices={areaData.vertices}
                  area={areaData.area}
                  perimeter={areaData.perimeter}
                  isDrawing={areaData.isDrawing}
                  color={areaData.color}
                  fillOpacity={areaData.fillOpacity}
                  setColor={areaData.setColor}
                  setFillOpacity={areaData.setFillOpacity}
                  completeDrawing={areaData.completeDrawing}
                  formattedArea={formattedArea}
                  areaUnit={areaUnit}
                  setAreaUnit={setAreaUnit}
                  distanceUnit={distanceUnit}
                />
              )}

              {/* Circle UI - Enhanced */}
              {activeTab === "circle" && (
                <CircleTabContent
                  isPlacingCenter={circleData.state.isPlacingCenter}
                  setIsPlacingCenter={circleData.state.setIsPlacingCenter}
                  center={circleData.state.center}
                  circles={circleData.state.circles}
                  activeCircleIndex={circleData.state.activeCircleIndex}
                  setActiveCircleIndex={circleData.state.setActiveCircleIndex}
                  radius={circleData.state.radius}
                  onRadiusChange={(r) => {
                    if (circleData.state.activeCircleIndex !== null) {
                      circleData.state.setCircles(prev => {
                        const updated = [...prev];
                        if (updated[circleData.state.activeCircleIndex!]) {
                          updated[circleData.state.activeCircleIndex!] = { 
                            ...updated[circleData.state.activeCircleIndex!], 
                            radius: r 
                          };
                        }
                        return updated;
                      });
                    }
                    circleData.actions.setRadius(r);
                  }}
                  formatDistance={circleData.formatters.formatDistance}
                  area={circleData.state.area}
                  perimeter={circleData.state.perimeter}
                  formatArea={circleData.formatters.formatArea}
                  color={circleData.state.color}
                  onColorChange={(c) => {
                    if (circleData.state.activeCircleIndex !== null) {
                      circleData.state.setCircles(prev => {
                        const updated = [...prev];
                        if (updated[circleData.state.activeCircleIndex!]) {
                          updated[circleData.state.activeCircleIndex!] = { 
                            ...updated[circleData.state.activeCircleIndex!], 
                            color: c 
                          };
                        }
                        return updated;
                      });
                    }
                    circleData.actions.setColor(c);
                  }}
                  fillOpacity={circleData.state.fillOpacity}
                  onFillOpacityChange={(o) => {
                    if (circleData.state.activeCircleIndex !== null) {
                      circleData.state.setCircles(prev => {
                        const updated = [...prev];
                        if (updated[circleData.state.activeCircleIndex!]) {
                          updated[circleData.state.activeCircleIndex!] = { 
                            ...updated[circleData.state.activeCircleIndex!], 
                            fillOpacity: o 
                          };
                        }
                        return updated;
                      });
                    }
                    circleData.actions.setFillOpacity(o);
                  }}
                  onDeleteCircle={circleData.actions.deleteCircle}
                />
              )}

              {/* Sector UI - Enhanced */}
              {activeTab === "sector" && (
                <SectorTabContent
                  isPlacingCenter={sectorCenter.isPlacingCenter}
                  center={sectorCenter.center}
                  radius={sectorRadius}
                  azimuth={azimuth}
                  beamwidth={beamwidth}
                  onRadiusChange={setSectorRadius}
                  onAzimuthChange={setAzimuth}
                  onBeamwidthChange={setBeamwidth}
                  area={sectorGeometry.area}
                  arcLength={sectorGeometry.arcLength}
                  color={sectorColor}
                  fillOpacity={sectorFillOpacity}
                  onColorChange={setSectorColor}
                  onOpacityChange={setSectorFillOpacity}
                />
              )}
            </div>
          </div>
        )}
      </div>      {/* Full Feature Elevation Drawer */}
      {pathData.showElevationDrawer && (
         <AdvancedElevationDrawer
          points={pathData.points}
          markers={pathData.markers}
          map={map}
          onClose={() => pathData.setShowElevationDrawer(false)}
          onFocusMap={handleFocusMap}
          isFocusActive={isFocusActive}
          networkCatalogOpen={networkCatalogOpen}
          measurementLabel={formattedDistance}
          defaultEditMode={true}
         />
      )}

      {/* Street View Controls (Visible only when Street View is active) */}
      {pathData.streetViewEnabled && pathData.currentStreetViewPoint !== null && (
        <div className="fixed top-16 sm:top-[4.75rem] left-1/2 -translate-x-1/2 z-[1000000] bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl p-2 flex items-center gap-3 border border-slate-700/50">
          <span className="text-white text-sm font-bold px-3">
            Point {pathData.points[pathData.currentStreetViewPoint]?.label}
          </span>
          <div className="h-4 w-px bg-slate-700"></div>
          <button
            onClick={() => pathData.navigateToPreviousPoint()}
            disabled={pathData.currentStreetViewPoint === 0}
            className="px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700/50 rounded-full transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => pathData.navigateToNextPoint()}
            disabled={pathData.currentStreetViewPoint === pathData.points.length - 1}
            className="px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700/50 rounded-full transition-colors disabled:opacity-50"
          >
            Next
          </button>
          <div className="h-4 w-px bg-slate-700"></div>
          <button
            onClick={pathData.exitStreetView}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full transition-colors"
          >
            Exit Street View
          </button>
        </div>
      )}
      {/* Geometry Suite Restore Pull-Tab Button when Focus Mode is Active */}
      {isFocused && (
        <>
          <style>{`
            @keyframes bounceHorizontalRight {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(4px); }
            }
            .animate-bounce-right {
              animation: bounceHorizontalRight 1s infinite;
            }
          `}</style>
          <button
            onClick={() => {
              setIsCollapsed(false);
              setIsFocused(false);
            }}
            className="fixed top-24 left-0 z-40 w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-r-lg border-y border-r border-blue-400/30 bg-blue-600/85 dark:bg-blue-700/85 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] backdrop-blur-xl hover:bg-blue-500/95 dark:hover:bg-blue-600/95 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
            title="Restore Geometry Suite"
          >
            <ChevronRight size={11} strokeWidth={3} className="text-white animate-bounce-right" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] rotate-180 mb-1">
              Geometry
            </span>
          </button>
        </>
      )}
    </>
  );
};

export default MeasurementSuiteTool;
