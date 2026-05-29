/**
 * useDistanceMeasurement Hook
 * Main orchestrator hook that combines all measurement functionality
 */

import { useEffect } from "react";
import { DistanceMeasurement } from "../../../../../types/gisToolTypes/index";
import { Point, Segment } from "../types/distanceTypes";
import { useMeasurementPoints } from "./useMeasurementPoints";
import { useStreetView } from "./useStreetView";
import { useElevation } from "./useElevation";
import { useMeasurementSave } from "./useMeasurementSave";

export const useDistanceMeasurement = (
  map: google.maps.Map | null,
  initialData?: {
    points: Array<Point>;
    segments?: Array<Segment>;
    totalDistance?: number;
    name?: string;
    description?: string;
  },
  onSave?: (measurement: DistanceMeasurement) => void,
  onClose?: () => void,
  isActive: boolean = true
) => {
  // ===========================================================================
  // MEASUREMENT POINTS HOOK
  // ===========================================================================
  const measurementPoints = useMeasurementPoints({
    map,
    initialData,
    isActive
  });

  // ===========================================================================
  // STREET VIEW HOOK
  // ===========================================================================
  const streetView = useStreetView({
    map,
    points: measurementPoints.points,
    markers: measurementPoints.markers,
    polyline: measurementPoints.polyline,
    distanceLabels: measurementPoints.distanceLabels,
    setPolyline: measurementPoints.setPolyline
  });

  // ===========================================================================
  // ELEVATION HOOK
  // ===========================================================================
  const elevation = useElevation({
    map,
    points: measurementPoints.points,
    segments: measurementPoints.segments,
    totalDistance: measurementPoints.totalDistance,
    name: initialData?.name || ""
  });

  // ===========================================================================
  // COMBINED CLEAR ALL FUNCTION
  // ===========================================================================
  const clearAll = () => {
    measurementPoints.clearMeasurementData();
    elevation.clearElevationData();
  };

  // ===========================================================================
  // SAVE HOOK
  // ===========================================================================
  const save = useMeasurementSave({
    points: measurementPoints.points,
    segments: measurementPoints.segments,
    totalDistance: measurementPoints.totalDistance,
    streetViewEnabled: streetView.streetViewEnabled,
    elevationData: elevation.elevationData,
    highPoint: elevation.highPoint,
    lowPoint: elevation.lowPoint,
    elevationGain: elevation.elevationGain,
    elevationLoss: elevation.elevationLoss,
    startTime: measurementPoints.startTime,
    clearAll,
    onSave,
    onClose
  });

  // ===========================================================================
  // EFFECT: Sync form fields with state ref
  // ===========================================================================
  useEffect(() => {
    measurementPoints.updateStateRef(save.name, save.description);
  }, [save.name, save.description]);

  // ===========================================================================
  // EFFECT: Show elevation prompt when points change
  // ===========================================================================
  useEffect(() => {
    if (
      measurementPoints.points.length >= 2 &&
      elevation.elevationData.length === 0 &&
      !elevation.loadingElevation &&
      !elevation.showElevationPrompt
    ) {
      setTimeout(() => {
        elevation.setShowElevationPrompt(true);
      }, 500);
    } else if (measurementPoints.points.length < 2) {
      elevation.setShowElevationPrompt(false);
    }
  }, [measurementPoints.points]);

  // ===========================================================================
  // RETURN PUBLIC API (same shape as before)
  // ===========================================================================
  return {
    // State from measurementPoints
    points: measurementPoints.points,
    markers: measurementPoints.markers,
    polyline: measurementPoints.polyline,
    distanceLabels: measurementPoints.distanceLabels,
    totalDistance: measurementPoints.totalDistance,
    segments: measurementPoints.segments,
    notification: measurementPoints.notification,
    setNotification: measurementPoints.setNotification,
    isToolboxCollapsed: measurementPoints.isToolboxCollapsed,
    setIsToolboxCollapsed: measurementPoints.setIsToolboxCollapsed,

    // State from save
    name: save.name,
    setName: save.setName,
    description: save.description,
    setDescription: save.setDescription,
    storageType: save.storageType,
    setStorageType: save.setStorageType,
    showSaveDialog: save.showSaveDialog,
    setShowSaveDialog: save.setShowSaveDialog,
    saving: save.saving,
    showCloseWarning: save.showCloseWarning,
    setShowCloseWarning: save.setShowCloseWarning,

    // State from streetView
    streetViewEnabled: streetView.streetViewEnabled,
    setStreetViewEnabled: streetView.setStreetViewEnabled,
    currentStreetViewPoint: streetView.currentStreetViewPoint,
    streetViewAvailability: streetView.streetViewAvailability,
    showStreetViewCoverage: streetView.showStreetViewCoverage,
    setShowStreetViewCoverage: streetView.setShowStreetViewCoverage,
    coverageLayer: streetView.coverageLayer,

    // State from elevation
    elevationData: elevation.elevationData,
    highPoint: elevation.highPoint,
    lowPoint: elevation.lowPoint,
    elevationGain: elevation.elevationGain,
    elevationLoss: elevation.elevationLoss,
    loadingElevation: elevation.loadingElevation,
    showElevationGraph: elevation.showElevationGraph,
    showElevationDrawer: elevation.showElevationDrawer,
    setShowElevationDrawer: elevation.setShowElevationDrawer,
    isDrawerMinimized: elevation.isDrawerMinimized,
    setIsDrawerMinimized: elevation.setIsDrawerMinimized,
    showFullGraph: elevation.showFullGraph,
    setShowFullGraph: elevation.setShowFullGraph,
    hoveredDataIndex: elevation.hoveredDataIndex,
    setHoveredDataIndex: elevation.setHoveredDataIndex,
    isHoverEnabled: elevation.isHoverEnabled,
    setIsHoverEnabled: elevation.setIsHoverEnabled,
    pointToElevationIndexMap: elevation.pointToElevationIndexMap,
    segmentElevationStats: elevation.segmentElevationStats,
    showElevationPrompt: elevation.showElevationPrompt,
    setShowElevationPrompt: elevation.setShowElevationPrompt,
    chartRef: elevation.chartRef,
    highPointMarker: elevation.highPointMarker,
    lowPointMarker: elevation.lowPointMarker,
    hoverMarker: elevation.hoverMarker,
    hoverInfoWindow: elevation.hoverInfoWindow,
    pinnedMarker: elevation.pinnedMarker,
    pinnedInfoWindow: elevation.pinnedInfoWindow,

    // Actions from measurementPoints
    addPoint: measurementPoints.addPoint,
    undoLastPoint: measurementPoints.undoLastPoint,

    // Actions from save
    handleSave: save.handleSave,
    handleCloseStart: save.handleCloseStart,
    handleCloseWithoutSaving: save.handleCloseWithoutSaving,
    handleCloseSaveData: save.handleCloseSaveData,

    // Actions from streetView
    openStreetView: streetView.openStreetView,
    navigateToNextPoint: streetView.navigateToNextPoint,
    navigateToPreviousPoint: streetView.navigateToPreviousPoint,
    exitStreetView: streetView.exitStreetView,

    // Actions from elevation
    fetchElevationForPoints: elevation.fetchElevationForPoints,
    processElevationData: elevation.processElevationData,
    handleGraphHover: elevation.handleGraphHover,
    handleGraphClick: elevation.handleGraphClick,
    exportKML: elevation.exportKML,
    exportGPX: elevation.exportGPX,
    exportCSV: elevation.exportCSV,

    // Combined action
    clearAll
  };
};

