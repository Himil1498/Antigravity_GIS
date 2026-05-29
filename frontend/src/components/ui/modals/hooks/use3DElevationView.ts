/**
 * Custom hook for managing 3D elevation view
 * Handles 3D map setup, controls, and cleanup
 */

import { useState, useCallback } from "react";
import { showToast } from "../../../../utils/toastUtils";
import {
  setup3DView,
  createElevationPathPolyline,
  createAntennaMarker,
  createAntennaInfoWindow,
  cleanup3DOverlays,
} from "../../../../utils/maps3D/index";

interface Use3DElevationViewParams {
  mapInstance: google.maps.Map | null;
  points: Array<{ lat: number; lng: number; label?: string }>;
  totalDistance: number;
  elevationData: Array<{
    elevation: number;
    location: { lat: number; lng: number };
    distance: number;
    resolution: number;
  }>;
  hasLOSData: boolean;
  losAnalysis: any;
  antennaHeight1?: number;
  antennaHeight2?: number;
}

export function use3DElevationView({
  mapInstance,
  points,
  totalDistance,
  elevationData,
  hasLOSData,
  losAnalysis,
  antennaHeight1,
  antennaHeight2,
}: Use3DElevationViewParams) {
  const [view3DOverlays, setView3DOverlays] = useState<
    Array<google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow>
  >([]);
  const [view3DControls, setView3DControls] = useState<{
    reset: () => void;
    adjustTilt: (tilt: number) => void;
    rotate: (degrees: number) => void;
  } | null>(null);
  const [show3DControls, setShow3DControls] = useState<boolean>(false);

  const handleView3D = useCallback(() => {
    if (!mapInstance) {
      showToast.error("Map not available. Please try again.");
      return;
    }

    if (points.length < 2) {
      showToast.error("Need at least 2 points for 3D view");
      return;
    }

    try {
      // Setup 3D view and get control functions
      const controls = setup3DView(mapInstance, points, totalDistance, {
        tilt: 45,
        mapTypeId: "satellite",
        viewFromSide: true,
      });
      setView3DControls(controls);

      const overlays: Array<
        google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow
      > = [];

      // Create elevation path polyline
      const pathPolyline = createElevationPathPolyline(mapInstance, points, {
        strokeColor:
          hasLOSData && losAnalysis && !losAnalysis.hasLineOfSight
            ? "#ef4444"
            : "#3b82f6",
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
      overlays.push(pathPolyline);

      // Get elevation data for info windows
      const startElevation =
        elevationData.length > 0 ? elevationData[0].elevation : undefined;
      const endElevation =
        elevationData.length > 0
          ? elevationData[elevationData.length - 1].elevation
          : undefined;

      // Create start antenna marker (Point A)
      const startMarker = createAntennaMarker(
        mapInstance,
        points[0],
        "A",
        antennaHeight1 || 30,
        "#10b981",
      );
      overlays.push(startMarker);

      // Create start antenna info window
      const startInfo = createAntennaInfoWindow(
        startMarker,
        "A",
        antennaHeight1 || 30,
        points[0],
        startElevation,
      );
      overlays.push(startInfo);

      // Create end antenna marker (Point B)
      const endMarker = createAntennaMarker(
        mapInstance,
        points[points.length - 1],
        "B",
        antennaHeight2 || 30,
        "#ef4444",
      );
      overlays.push(endMarker);

      // Create end antenna info window
      const endInfo = createAntennaInfoWindow(
        endMarker,
        "B",
        antennaHeight2 || 30,
        points[points.length - 1],
        endElevation,
      );
      overlays.push(endInfo);

      setView3DOverlays(overlays);
      setShow3DControls(true);
      showToast.success(
        "3D view activated! Drag to pan, scroll to zoom, right-drag to rotate.",
      );
    } catch (error) {
      console.error("Error activating 3D view:", error);
      showToast.error("Failed to activate 3D view");
    }
  }, [
    mapInstance,
    points,
    totalDistance,
    hasLOSData,
    losAnalysis,
    elevationData,
    antennaHeight1,
    antennaHeight2,
  ]);

  const handle3DControlsClose = useCallback(() => {
    setShow3DControls(false);
    cleanup3DOverlays(view3DOverlays);
    setView3DOverlays([]);
    if (view3DControls) {
      view3DControls.reset();
    }
    setView3DControls(null);
  }, [view3DOverlays, view3DControls]);

  return {
    view3DOverlays,
    view3DControls,
    show3DControls,
    handleView3D,
    handle3DControlsClose,
  };
}
