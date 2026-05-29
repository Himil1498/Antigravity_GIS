import React, { useEffect } from 'react';
import { useElevationState } from '../../tools/MeasurementSuiteTool/hooks/useElevationState';
import { useElevationLogic } from '../../tools/MeasurementSuiteTool/hooks/useElevationLogic';
import { useChartConfig } from '../../tools/MeasurementSuiteTool/hooks/useChartConfig';
import { useChartInteractions } from '../../tools/MeasurementSuiteTool/hooks/useChartInteractions';
import type { GraphType } from '../../tools/MeasurementSuiteTool/hooks/useChartConfig';
import { ElevationChartPanel, FullscreenGraphModal, GraphTypeSelector } from '../../tools/MeasurementSuiteTool/components/index';
import { MapPin } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js components so they are available when accessed directly via FeasibilityHub
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FeasibilityElevationPanelProps {
  customerCoords: { lat: number; lng: number };
  btsCoords: { lat: number; lng: number };
  customerName: string;
  btsName: string;
  onClose: () => void;
  map: google.maps.Map | null;
  onFocusMap?: () => void;
  isFocusActive?: boolean;
}

const FeasibilityElevationPanel: React.FC<FeasibilityElevationPanelProps> = ({
  customerCoords,
  btsCoords,
  customerName,
  btsName,
  onClose,
  map,
  onFocusMap,
  isFocusActive = false,
}) => {
  // Use exact same state structure as main tool
  const elevationState = useElevationState();
  const { fetchElevationProfile } = useElevationLogic(elevationState, map);
  
  // Use exact same interactions (hover marker on map, full graph modal)
  const chartInteractions = useChartInteractions(map, elevationState);
  
  const [graphType, setGraphType] = React.useState<GraphType>('gradient');

  // Create exact same chart data and options
  const { chartData, chartOptions } = useChartConfig(elevationState, chartInteractions, graphType);

  // Initialize data on mount
  useEffect(() => {
    // Clear previous chart data to prevent stale chart flash
    elevationState.setElevationData([]);
    
    // Auto-enable LIVE mode on mount
    elevationState.setIsHoverEnabled(true);

    // Only init elevatorRef if null
    if (!elevationState.elevatorRef.current) {
      elevationState.elevatorRef.current = new google.maps.ElevationService();
    }
    
    // Set points directly from FeasibilityHub data
    const dist = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(customerCoords.lat, customerCoords.lng),
      new google.maps.LatLng(btsCoords.lat, btsCoords.lng)
    );
    elevationState.setTotalDistance(dist);
    elevationState.setPoints([customerCoords, btsCoords]);

    // Calculate heading / bearing
    const heading = google.maps.geometry.spherical.computeHeading(
      new google.maps.LatLng(customerCoords.lat, customerCoords.lng),
      new google.maps.LatLng(btsCoords.lat, btsCoords.lng)
    );
    const normalizedBearing = heading < 0 ? heading + 360 : heading;
    elevationState.setBearing(normalizedBearing);
    
    // Initialize required state that useMapInteractions normally does
    if (!elevationState.hoverMarker && map) {
      const marker = new google.maps.Marker({
        map: null,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#f59e0b",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 1.8,
          anchor: new google.maps.Point(12, 22),
        },
        zIndex: 1000,
      });
      elevationState.setHoverMarker(marker);
      elevationState.setHoverInfoWindow(new google.maps.InfoWindow());
    }

  }, [customerCoords, btsCoords, map]);

  // Sync --elevation-drawer-height CSS variable so other side panels adjust their bottom
  const drawerHeightValue = React.useMemo(() => {
    if (elevationState.showFullGraph) return "0px";
    if (elevationState.isMinimized) return "56px";
    if (elevationState.elevationData.length === 0) return "0px";
    return elevationState.isExpanded ? "70vh" : "310px";
  }, [elevationState.showFullGraph, elevationState.isMinimized, elevationState.elevationData.length, elevationState.isExpanded]);

  useEffect(() => {
    document.documentElement.style.setProperty("--elevation-drawer-height", drawerHeightValue);
    return () => {
      document.documentElement.style.removeProperty("--elevation-drawer-height");
    };
  }, [drawerHeightValue]);

  // Zoom to fit listener
  useEffect(() => {
    const handleZoomToFit = () => {
      if (!map || elevationState.points.length < 2) return;
      const bounds = new google.maps.LatLngBounds();
      elevationState.points.forEach(p => bounds.extend(new google.maps.LatLng(p.lat, p.lng)));
      
      const bottomPadding = elevationState.isExpanded 
        ? window.innerHeight * 0.7 + 20 
        : (elevationState.isMinimized ? 80 : 350);
      const rightPadding = isFocusActive ? 80 : 520;
      
      // Capture current state
      const oldCenter = map.getCenter();
      const oldZoom = map.getZoom();
      const oldTilt = map.getTilt();
      const oldHeading = map.getHeading();
      
      // Instantly calculate target state
      map.fitBounds(bounds, { top: 140, bottom: bottomPadding, left: 80, right: rightPadding });
      const targetCenter = map.getCenter();
      const targetZoom = map.getZoom();
      
      // If we have valid states, perform smooth transition
      if (oldCenter && oldZoom !== undefined && targetCenter && targetZoom !== undefined) {
        // Revert to original instantly (no flicker because this is synchronous)
        map.setCenter(oldCenter);
        map.setZoom(oldZoom);
        if (oldTilt !== undefined) map.setTilt(oldTilt);
        if (oldHeading !== undefined) map.setHeading(oldHeading);
        
        if (targetZoom === oldZoom) {
          // Just pan smoothly if zoom is unchanged
          map.panTo(targetCenter);
        } else if (targetZoom < oldZoom) {
          // Zooming out: zoom out instantly so path isn't cut off, then pan smoothly
          map.setZoom(targetZoom);
          map.panTo(targetCenter);
        } else {
          // Zooming in: pan smoothly first, then zoom in after pan completes
          map.panTo(targetCenter);
          setTimeout(() => {
            map.setZoom(targetZoom);
            map.setCenter(targetCenter);
          }, 400);
        }
      }
    };

    // Delay slightly to let the CSS drawer animation start smoothly before the map pans
    const timer = setTimeout(handleZoomToFit, 50);

    window.addEventListener("zoomToElevationPath", handleZoomToFit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("zoomToElevationPath", handleZoomToFit);
    };
  }, [map, elevationState.points, elevationState.isExpanded, elevationState.isMinimized, isFocusActive]);

  // When points update, fetch from API
  useEffect(() => {
    if (elevationState.points.length === 2 && elevationState.elevatorRef.current) {
      fetchElevationProfile();
    }
  }, [elevationState.points]);
  
  // Refs for reliable cleanup on unmount
  const chartRefCurrent = React.useRef(elevationState.chartRef.current);
  const hoverMarkerRef = React.useRef(elevationState.hoverMarker);
  const hoverInfoWindowRef = React.useRef(elevationState.hoverInfoWindow);

  // Sync refs with state
  useEffect(() => {
    chartRefCurrent.current = elevationState.chartRef.current;
    hoverMarkerRef.current = elevationState.hoverMarker;
    hoverInfoWindowRef.current = elevationState.hoverInfoWindow;
  }, [elevationState.chartRef.current, elevationState.hoverMarker, elevationState.hoverInfoWindow]);
  
  // Clean up on unmount to remove hover markers from the map and destroy chart instance
  useEffect(() => {
    return () => {
      if (chartRefCurrent.current) chartRefCurrent.current.destroy();
      if (hoverMarkerRef.current) hoverMarkerRef.current.setMap(null);
      if (hoverInfoWindowRef.current) hoverInfoWindowRef.current.close();
    };
  }, []);

  const heightClass = elevationState.showFullGraph
    ? "h-0 overflow-hidden pointer-events-none opacity-0"
    : elevationState.isMinimized 
      ? "h-14 overflow-hidden" 
      : elevationState.isExpanded ? "h-[70vh]" : "h-[310px]";

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl shadow-2xl border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 rounded-t-3xl flex flex-col ${heightClass}`}
      >
        <div className={`flex-1 flex flex-col min-h-0 w-full ${elevationState.isMinimized ? "px-3 py-2" : "p-3 pb-2"}`}>
          {/* Header */}
          <div
            className={`flex items-center justify-between gap-2 w-full shrink-0 ${
              elevationState.isMinimized 
                ? "pb-0 mb-0 border-none" 
                : `pb-1 border-b border-gray-100 dark:border-gray-700 ${elevationState.elevationData.length > 0 ? "mb-1" : "mb-0"}`
            }`}
          >
            {/* Left Section - Title and Context */}
            <div className="flex items-center space-x-3 mr-4 shrink-0">
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center whitespace-nowrap">
                <span className="text-base mr-2">⛰️</span>
                Elevation Profile
              </h3>

              {/* Context Divider & Description */}
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{customerName}</span>
                {" → "}
                <span className="text-blue-600 dark:text-blue-400 font-bold">{btsName}</span>
              </span>

              {elevationState.elevationData.length > 0 && !elevationState.isMinimized && (
                <div className="px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                    ✓ Profile generated!
                  </p>
                </div>
              )}
            </div>

            {/* Right Section - Statistics and Actions */}
            <div className="flex items-center gap-2">
              {/* Statistics Capsule - Matching Geometry Suite */}
              {elevationState.elevationData.length > 0 && !elevationState.isMinimized && (
                <div className="hidden md:flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] gap-1 mr-1">
                  <span
                    className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-blue-500 whitespace-nowrap"
                    title="Total Path Distance"
                  >
                    📍 {elevationState.totalDistance >= 1000 ? `${(elevationState.totalDistance / 1000).toFixed(2)} km` : `${elevationState.totalDistance.toFixed(1)} m`}
                  </span>
                  {elevationState.highPoint && (
                    <span
                      className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-green-700 dark:text-green-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-green-500 whitespace-nowrap"
                      title="Highest Elevation Point along the path"
                    >
                      ⛰️ {elevationState.highPoint.elevation.toFixed(1)} m
                    </span>
                  )}
                  {elevationState.lowPoint && (
                    <span
                      className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-cyan-500 whitespace-nowrap"
                      title="Lowest Elevation Point along the path"
                    >
                      🏞️ {elevationState.lowPoint.elevation.toFixed(1)} m
                    </span>
                  )}
                  {elevationState.elevationGain > 0 && (
                    <span
                      className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-purple-500 whitespace-nowrap"
                      title="Cumulative Elevation Gain (Ascent)"
                    >
                      📈 {elevationState.elevationGain.toFixed(1)} m
                    </span>
                  )}
                  {elevationState.bearing !== null && (
                    <>
                      <span
                        className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-orange-500 whitespace-nowrap"
                        title="Forward Azimuth / Bearing (from customer to BTS)"
                      >
                        📐 A→B: {elevationState.bearing.toFixed(1)}°
                      </span>
                      <span
                        className="h-8 px-2.5 rounded-lg flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-white/60 dark:bg-slate-700/60 border-l-2 border-orange-500 whitespace-nowrap"
                        title="Reverse Azimuth / Bearing (from BTS to customer)"
                      >
                        📐 B→A: {((elevationState.bearing + 180) % 360).toFixed(1)}°
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Control Actions Capsule */}
              <div className="flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] gap-1">
                {/* Graph Type Selector */}
                {elevationState.elevationData.length > 0 && !elevationState.isMinimized && (
                  <GraphTypeSelector graphType={graphType} setGraphType={setGraphType} />
                )}

                {/* Target / Zoom to Fit Button */}
                {elevationState.elevationData.length > 0 && (
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
                {elevationState.elevationData.length > 0 && !elevationState.isMinimized && (
                  <button
                    onClick={() => elevationState.setIsExpanded(!elevationState.isExpanded)}
                    className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                    title={elevationState.isExpanded ? "Minimize" : "Maximize"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {elevationState.isExpanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h16M4 10h16M8 5l4 4 4-4M8 19l4-4 4 4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4M4 12h16" />
                      )}
                    </svg>
                  </button>
                )}

                {/* Live Preview Toggle */}
                {elevationState.elevationData.length > 0 && (
                  <button
                    onClick={() => {
                      const newState = !elevationState.isHoverEnabled;
                      elevationState.setIsHoverEnabled(newState);
                      if (!newState) {
                        if (elevationState.hoverMarker) elevationState.hoverMarker.setMap(null);
                        if (elevationState.hoverInfoWindow) elevationState.hoverInfoWindow.close();
                        elevationState.setHoveredDataIndex(null);
                      }
                    }}
                    className={`group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${
                      elevationState.isHoverEnabled
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                    }`}
                    title={elevationState.isHoverEnabled ? "Live preview ON" : "Live preview OFF"}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Fullscreen Expand Button */}
                {elevationState.elevationData.length > 0 && (
                  <button
                    onClick={() => elevationState.setShowFullGraph(true)}
                    className="group relative h-9 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                    title="Open Fullscreen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                )}

                {/* Focus Map Button */}
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

                {/* Minimize Toggle (horizontal line) */}
                <button
                  type="button"
                  onClick={() => elevationState.setIsMinimized(!elevationState.isMinimized)}
                  className="group relative h-9 w-9 rounded-lg flex justify-center items-center transition-all duration-300 z-10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60"
                  title="Minimize"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (elevationState.hoverMarker) elevationState.hoverMarker.setMap(null);
                    if (elevationState.hoverInfoWindow) elevationState.hoverInfoWindow.close();
                    onClose();
                  }}
                  className="group relative h-9 w-9 rounded-lg flex justify-center items-center transition-all duration-300 z-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                  title="Close Tool"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-90 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {!elevationState.isMinimized && (
            <div className="flex-1 min-h-0 w-full flex flex-col pt-1">
              <ElevationChartPanel
                loading={elevationState.loading}
                isExpanded={elevationState.isExpanded}
                shouldShowGraph={elevationState.elevationData.length > 0}
                chartData={chartData}
                chartOptions={chartOptions}
                graphType={graphType}
                chartRef={elevationState.chartRef}
                totalDistance={elevationState.totalDistance}
                highPoint={elevationState.highPoint}
                lowPoint={elevationState.lowPoint}
                elevationGain={elevationState.elevationGain}
                bearing={elevationState.bearing}
                multiPointMode={false}
                segmentElevationStats={[]}
              />
            </div>
          )}
        </div>
      </div>

      {elevationState.showFullGraph && (
        <FullscreenGraphModal
          totalDistance={elevationState.totalDistance}
          highPoint={elevationState.highPoint}
          lowPoint={elevationState.lowPoint}
          setShowFullGraph={elevationState.setShowFullGraph}
          chartData={chartData}
          chartOptions={chartOptions}
          graphType={graphType}
          handleGraphHover={chartInteractions.handleGraphHover}
        />
      )}
    </>
  );
};

export default FeasibilityElevationPanel;
