import React, { useEffect, useMemo } from "react";
import { useElevationState } from "../hooks/useElevationState";
import { useElevationLogic } from "../hooks/useElevationLogic";
import { useChartConfig } from "../hooks/useChartConfig";
import { useChartInteractions } from "../hooks/useChartInteractions";
import type { GraphType } from "../hooks/useChartConfig";
import { ElevationChartPanel, FullscreenGraphModal, ToolbarHeader } from "../components";
import { createBearingVisualization, cleanupBearingVisuals } from "../utils/bearingVisualization";

interface AdvancedElevationDrawerProps {
  map: google.maps.Map | null;
  points: { lat: number; lng: number }[];
  markers: google.maps.Marker[];
  onClose: () => void;
  networkCatalogOpen?: boolean;
  measurementLabel?: string;
  onFocusMap?: () => void;
  isFocusActive?: boolean;
  defaultEditMode?: boolean;
}

const AdvancedElevationDrawer: React.FC<AdvancedElevationDrawerProps> = ({
  map,
  points,
  markers,
  onClose,
  networkCatalogOpen,
  measurementLabel,
  onFocusMap,
  isFocusActive,
  defaultEditMode = false
}) => {
  const elevationState = useElevationState(defaultEditMode);
  const { fetchElevationProfile, recalculateLOS } = useElevationLogic(elevationState, map);
  const { handleGraphHover } = useChartInteractions(map, elevationState);
  const [graphType, setGraphType] = React.useState<GraphType>('gradient');
  const { chartData, chartOptions } = useChartConfig(elevationState, { handleGraphHover }, graphType);

  // Initialize Elevation Service
  useEffect(() => {
    if (map && !elevationState.elevatorRef.current) {
      elevationState.elevatorRef.current = new google.maps.ElevationService();
    }
  }, [map, elevationState.elevatorRef]);

  // Refs for reliable cleanup on unmount (to avoid stale closures in useEffect)
  const hoverMarkerRef = React.useRef<google.maps.Marker | null>(null);
  const hoverInfoWindowRef = React.useRef<google.maps.InfoWindow | null>(null);

  // Sync refs with state
  useEffect(() => {
    hoverMarkerRef.current = elevationState.hoverMarker;
    hoverInfoWindowRef.current = elevationState.hoverInfoWindow;
  }, [elevationState.hoverMarker, elevationState.hoverInfoWindow]);

  // Initialize hover marker and info window for map interaction
  useEffect(() => {
    if (map && !elevationState.hoverMarker) {
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
        draggable: false,
        zIndex: 1000000,
      });
      const infoWindow = new google.maps.InfoWindow();
      elevationState.setHoverMarker(marker);
      elevationState.setHoverInfoWindow(infoWindow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Comprehensive cleanup when points are cleared
  useEffect(() => {
    if (points.length === 0) {
      if (elevationState.highPointMarker) elevationState.highPointMarker.setMap(null);
      if (elevationState.lowPointMarker) elevationState.lowPointMarker.setMap(null);
      
      elevationState.setHighPointMarker(null);
      elevationState.setLowPointMarker(null);
      elevationState.setElevationData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);

  // Final unmount cleanup using Refs (prevents stale closure issues)
  useEffect(() => {
    return () => {
      if (hoverMarkerRef.current) hoverMarkerRef.current.setMap(null);
      if (hoverInfoWindowRef.current) hoverInfoWindowRef.current.close();
      
      if (elevationState.highPointMarker) elevationState.highPointMarker.setMap(null);
      if (elevationState.lowPointMarker) elevationState.lowPointMarker.setMap(null);
      cleanupBearingVisuals();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom to fit listener
  useEffect(() => {
    const handleZoomToFit = () => {
      if (!map || points.length < 2) return;
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(new google.maps.LatLng(p.lat, p.lng)));
      map.fitBounds(bounds, { top: 50, bottom: 350, left: 50, right: 50 });
    };

    window.addEventListener("zoomToElevationPath", handleZoomToFit);
    return () => {
      window.removeEventListener("zoomToElevationPath", handleZoomToFit);
    };
  }, [map, points]);

  // Sync points from the parent Path tool
  useEffect(() => {
    elevationState.setPoints(points);

    // Calculate total distance for the elevation graph X-axis
    if (points.length >= 2) {
      let totalDist = 0;
      for (let i = 0; i < points.length - 1; i++) {
        totalDist += google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(points[i].lat, points[i].lng),
          new google.maps.LatLng(points[i + 1].lat, points[i + 1].lng)
        );
      }
      elevationState.setTotalDistance(totalDist);
    } else {
      elevationState.setTotalDistance(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Fetch elevation when state points are updated
  useEffect(() => {
    if (elevationState.points.length >= 2 && elevationState.elevatorRef.current) {
      fetchElevationProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elevationState.points, elevationState.elevatorRef.current]);

  // Handle bearing calculation and visualization
  useEffect(() => {
    if (map && points.length === 2) {
      const heading = google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(points[0].lat, points[0].lng),
        new google.maps.LatLng(points[1].lat, points[1].lng)
      );
      const normalizedBearing = heading < 0 ? heading + 360 : heading;
      elevationState.setBearing(normalizedBearing);

      createBearingVisualization(
        map,
        points,
        markers,
        normalizedBearing,
        elevationState.totalDistance
      );
    } else {
      elevationState.setBearing(null);
      cleanupBearingVisuals();
    }

    return () => cleanupBearingVisuals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, map, markers, elevationState.totalDistance]);

  // Sync marker draggability with edit mode
  useEffect(() => {
    markers.forEach((marker) => {
      marker.setDraggable(elevationState.isEditMode);
    });
  }, [elevationState.isEditMode, markers]);

  const shouldShowGraph = elevationState.elevationData.length > 0;
  const heightClass = shouldShowGraph
    ? elevationState.isExpanded
      ? "h-[65vh]"
      : "h-64"
    : "h-16";

  // Sync --elevation-drawer-height CSS variable so NetworkDataCatalog can adjust its bottom
  const drawerHeightValue = useMemo(() => {
    if (elevationState.isMinimized) return "56px";
    if (!shouldShowGraph) return "64px";
    return elevationState.isExpanded ? "65vh" : "256px";
  }, [elevationState.isMinimized, shouldShowGraph, elevationState.isExpanded]);

  useEffect(() => {
    document.documentElement.style.setProperty("--elevation-drawer-height", drawerHeightValue);
    return () => {
      document.documentElement.style.removeProperty("--elevation-drawer-height");
    };
  }, [drawerHeightValue]);

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl shadow-2xl border-t border-gray-200/50 dark:border-gray-700/50 z-40 transition-all duration-300 rounded-t-3xl ${
          elevationState.isMinimized ? "h-14 overflow-hidden" : `flex flex-col ${heightClass}`
        } right-0`}
      >
        <div className={`flex-1 flex flex-col overflow-y-auto w-full ${elevationState.isMinimized ? "px-3 py-2" : shouldShowGraph ? elevationState.isExpanded ? "p-3" : "p-2" : "p-2"}`}>
          <ToolbarHeader
            graphType={graphType}
            setGraphType={setGraphType}
            shouldShowGraph={shouldShowGraph}
            isExpanded={elevationState.isExpanded}
            setIsExpanded={elevationState.setIsExpanded}
            isHoverEnabled={elevationState.isHoverEnabled}
            setIsHoverEnabled={elevationState.setIsHoverEnabled}
            isMinimized={elevationState.isMinimized}
            setIsMinimized={elevationState.setIsMinimized}
            isEditMode={elevationState.isEditMode}
            multiPointMode={elevationState.multiPointMode}
            setMultiPointMode={elevationState.setMultiPointMode}
            points={points}
            totalDistance={elevationState.totalDistance}
            highPoint={elevationState.highPoint}
            lowPoint={elevationState.lowPoint}
            elevationGain={elevationState.elevationGain}
            bearing={elevationState.bearing}
            loading={elevationState.loading}
            saving={elevationState.saving}
            elevationData={elevationState.elevationData}
            showClearButton={false}
            clearAll={() => {}}
            toggleEditMode={() => elevationState.setIsEditMode(!elevationState.isEditMode)}
            setShowSaveDialog={elevationState.setShowSaveDialog}
            setShowFullGraph={elevationState.setShowFullGraph}
            handleView3D={() => {}} // 3D view skipped for simple panel
            handleClose={onClose}
            hoverMarker={elevationState.hoverMarker}
            hoverInfoWindow={elevationState.hoverInfoWindow}
            setHoveredDataIndex={elevationState.setHoveredDataIndex}
            onClose={onClose}
            measurementLabel={measurementLabel}
            onFocusMap={onFocusMap}
            isFocusActive={isFocusActive}
          />

          {!elevationState.isMinimized && (
            <ElevationChartPanel
              loading={elevationState.loading}
              isExpanded={elevationState.isExpanded}
              shouldShowGraph={shouldShowGraph}
              chartData={chartData}
              chartOptions={chartOptions}
              graphType={graphType}
              chartRef={elevationState.chartRef}
              totalDistance={elevationState.totalDistance}
              highPoint={elevationState.highPoint}
              lowPoint={elevationState.lowPoint}
              elevationGain={elevationState.elevationGain}
              bearing={elevationState.bearing}
              multiPointMode={elevationState.multiPointMode}
              segmentElevationStats={elevationState.segmentElevationStats}
            />
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
          handleGraphHover={handleGraphHover}
        />
      )}
    </>
  );
};

export default AdvancedElevationDrawer;
