import {
  setup3DView,
  createElevationPathPolyline,
  createAntennaMarker,
  createAntennaInfoWindow,
  cleanup3DOverlays,
} from "../../../../../utils/maps3D/index";
import { showToast } from "../../../../../utils/toastUtils";

export const use3DVisualization = (map: google.maps.Map | null, state: any) => {
  const {
    points,
    totalDistance,
    showLOSAnalysis,
    losAnalysis,
    elevationData,
    antennaHeight1,
    antennaHeight2,
    loading,
    saving,
    setView3DControls,
    setView3DOverlays,
    setShow3DView,
    show3DView,
    view3DControls,
    view3DOverlays,
  } = state;

  const handleView3D = () => {
    if (!map) {
      showToast.error("Map not available. Please try again.");
      return;
    }

    if (points.length < 2) {
      showToast.error("Need at least 2 points for 3D view");
      return;
    }

    try {
      // Setup 3D view
      const controls = setup3DView(map, points, totalDistance, {
        tilt: 45,
        mapTypeId: "satellite",
        viewFromSide: true,
      });
      setView3DControls(controls);

      const overlays: Array<
        google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow
      > = [];

      // Create elevation path polyline
      const isBlocked =
        losAnalysis &&
        losAnalysis.statistics &&
        losAnalysis.obstructions.length > 0;
      const pathPolyline = createElevationPathPolyline(map, points, {
        strokeColor: isBlocked ? "#ef4444" : "#3b82f6",
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
        map,
        points[0],
        "A",
        antennaHeight1,
        "#10b981",
      );
      overlays.push(startMarker);

      // Create start antenna info window
      const startInfo = createAntennaInfoWindow(
        startMarker,
        "A",
        antennaHeight1,
        points[0],
        startElevation,
      );
      overlays.push(startInfo);

      // Create end antenna marker (Point B)
      const endMarker = createAntennaMarker(
        map,
        points[points.length - 1],
        "B",
        antennaHeight2,
        "#ef4444",
      );
      overlays.push(endMarker);

      // Create end antenna info window
      const endInfo = createAntennaInfoWindow(
        endMarker,
        "B",
        antennaHeight2,
        points[points.length - 1],
        endElevation,
      );
      overlays.push(endInfo);

      setView3DOverlays(overlays);
      setShow3DView(true);
      showToast.success(
        "3D view activated! Drag to pan, scroll to zoom, right-drag to rotate.",
      );
    } catch (error) {
      console.error("Error activating 3D view:", error);
      showToast.error("Failed to activate 3D view");
    }
  };

  const close3DView = () => {
    setShow3DView(false);
    cleanup3DOverlays(view3DOverlays);
    setView3DOverlays([]);
    if (view3DControls) {
      view3DControls.reset();
    }
    setView3DControls(null);
  };

  return { handleView3D, close3DView };
};
