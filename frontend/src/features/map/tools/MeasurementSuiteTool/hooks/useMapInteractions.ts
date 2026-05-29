import { useEffect } from "react";
import { showToast } from "../../../../../utils/toastUtils";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import {
  createBearingVisualization,
  cleanupBearingVisuals,
} from "../utils/bearingVisualization";

export const useMapInteractions = (
  map: google.maps.Map | null,
  state: any,
  user: any,
  fetchElevationProfile: () => void,
  recalculateLOS: () => void,
  onClose?: () => void,
) => {
  const {
    points,
    setPoints,
    markers,
    setMarkers,
    polyline,
    setPolyline,
    bearing,
    setBearing,
    multiPointMode,
    elevatorRef,
    hoverMarker,
    setHoverMarker,
    hoverInfoWindow,
    setHoverInfoWindow,
    clickMarker,
    setClickMarker,
    isEditMode,
    setIsEditMode,
    setTotalDistance,
    setElevationData,
    setHighPoint,
    setLowPoint,
    highPointMarker,
    setHighPointMarker,
    lowPointMarker,
    setLowPointMarker,
    setHoveredDataIndex,
    setElevationGain,
    setElevationLoss,
    antennaHeight1,
    antennaHeight2,
    rfFrequency,
    losAnalysis,
    elevationData,
    showLOSAnalysis,
    setShowCloseWarning,
    setShowSaveDialog,
    setName,
    setDescription,
  } = state;

  // Initialize Elevation Service
  useEffect(() => {
    if (map && !elevatorRef.current) {
      elevatorRef.current = new google.maps.ElevationService();
    }
  }, [map]);

  // Initialize hover marker and info window
  useEffect(() => {
    if (map && !hoverMarker) {
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
      setHoverMarker(marker);
      setHoverInfoWindow(new google.maps.InfoWindow());
    }
  }, [map, hoverMarker]);

  // Initialize click listener
  useEffect(() => {
    const maxPoints = multiPointMode ? Infinity : 2;
    if (!map || points.length >= maxPoints) return;

    const clickListener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        // IGNORE if modifier is held (Ctrl/Cmd) to allow InfoWindow to open without marking map
        const domEv = e.domEvent as MouseEvent;
        if (domEv && (domEv.ctrlKey || domEv.metaKey || domEv.altKey || domEv.shiftKey)) return;

        if (e.latLng && points.length < maxPoints) {
          addPoint(e.latLng.lat(), e.latLng.lng());
        }
      },
    );

    return () => google.maps.event.removeListener(clickListener);
  }, [map, points, multiPointMode]);

  // Update polyline and fetch elevation when points change
  useEffect(() => {
    if (!map || points.length < 2) return;

    if (polyline) polyline.setMap(null);

    const newPolyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: map,
    });

    newPolyline.addListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("reopenGISTool", { detail: { toolType: "elevation" } }),
      );
    });

    setPolyline(newPolyline);

    // Calculate total distance and bounds for auto-zooming
    let totalDist = 0;
    const bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < points.length; i++) {
      bounds.extend(new google.maps.LatLng(points[i].lat, points[i].lng));
      if (i < points.length - 1) {
        totalDist += google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(points[i].lat, points[i].lng),
          new google.maps.LatLng(points[i + 1].lat, points[i + 1].lng),
        );
      }
    }
    setTotalDistance(totalDist);

    const handleZoomToFit = () => {
      if (!map || points.length < 2) return;
      map.fitBounds(bounds, { top: 50, bottom: 350, left: 50, right: 50 });
    };

    // Auto-zoom to fit path, with padding at bottom for the drawer
    if (points.length > 1) {
      handleZoomToFit();
    }
    
    window.addEventListener("zoomToElevationPath", handleZoomToFit);

    // Handle bearing visualization for two-point mode
    if (points.length === 2) {
      const heading = google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(points[0].lat, points[0].lng),
        new google.maps.LatLng(points[1].lat, points[1].lng),
      );
      const normalizedBearing = heading < 0 ? heading + 360 : heading;
      setBearing(normalizedBearing);

      cleanupBearingVisuals();
      createBearingVisualization(
        map,
        points,
        markers,
        normalizedBearing,
        totalDist,
      );
    } else {
      setBearing(null);
      cleanupBearingVisuals();
    }

    fetchElevationProfile();
    // Cleanup polyline listener logic
    return () => {
      window.removeEventListener("zoomToElevationPath", handleZoomToFit);
    };
  }, [points, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverMarker) hoverMarker.setMap(null);
      if (clickMarker) clickMarker.setMap(null);
      if (hoverInfoWindow) hoverInfoWindow.close();
    };
  }, []);

  // Recalculate LOS when antenna heights or frequency change
  useEffect(() => {
    if (losAnalysis && points.length === 2 && elevationData.length > 0) {
      recalculateLOS();
    }
  }, [antennaHeight1, antennaHeight2, rfFrequency]);

  const addPoint = async (lat: number, lng: number) => {
    const maxPoints = multiPointMode ? Infinity : 2;
    if (points.length >= maxPoints) return;

    if (!isPointInsideIndia(lat, lng)) {
      showOutsideIndiaWarning();
      return;
    }

    const regionCheck = await isPointInAssignedRegion(lat, lng, user);
    if (!regionCheck.allowed) {
      showToast.error(
        regionCheck.message ||
          "You don't have access to this region. Contact your administrator.",
      );
      return;
    }

    const newPoint = { lat, lng };
    setPoints((prev: any) => [...prev, newPoint]);

    if (map) {
      const labelChar = String.fromCharCode(65 + points.length);
      const colors = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
      ];
      const fillColor = multiPointMode
        ? colors[points.length % colors.length]
        : points.length === 0
          ? "#10b981"
          : "#ef4444";

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        label: {
          text: labelChar,
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: fillColor,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: `Point ${labelChar}`,
      });

      const markerIndex = points.length;
      marker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng)
          updatePoint(markerIndex, event.latLng.lat(), event.latLng.lng());
      });

      setMarkers((prev: any) => [...prev, marker]);
      showToast.success(`Point ${labelChar} placed`);
    }
  };

  const updatePoint = (index: number, lat: number, lng: number) => {
    setPoints((prev: any) => {
      const newPoints = [...prev];
      newPoints[index] = { lat, lng };
      return newPoints;
    });
    showToast.info(`Point ${index === 0 ? "A" : "B"} moved`);
  };

  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    markers.forEach((marker: google.maps.Marker) =>
      marker.setDraggable(newEditMode),
    );

    if (clickMarker) {
      clickMarker.setMap(null);
      setClickMarker(null);
      if (newEditMode) showToast.info("Pin removed - Edit mode enabled");
    }

    showToast[newEditMode ? "success" : "info"](
      newEditMode
        ? "Edit mode: Drag points A and B to adjust"
        : "Edit mode disabled",
    );
  };

  const clearAll = () => {
    markers.forEach((marker: google.maps.Marker) => marker.setMap(null));
    if (polyline) polyline.setMap(null);
    if (highPointMarker) highPointMarker.setMap(null);
    if (lowPointMarker) lowPointMarker.setMap(null);
    if (hoverMarker) hoverMarker.setMap(null);
    cleanupBearingVisuals();
    if (clickMarker) clickMarker.setMap(null);
    if (hoverInfoWindow) hoverInfoWindow.close();

    setPoints([]);
    setMarkers([]);
    setPolyline(null);
    setElevationData([]);
    setTotalDistance(0);
    setHighPoint(null);
    setLowPoint(null);
    setHighPointMarker(null);
    setLowPointMarker(null);
    setClickMarker(null);
    setHoveredDataIndex(null);
    setElevationGain(0);
    setElevationLoss(0);
    setIsEditMode(false);

    showToast.success("All cleared - Ready for new profile");
  };

  const handleClose = () => {
    clearAll();
    if (onClose) onClose();
  };

  const handleCloseWithoutSaving = () => {
    clearAll();
    if (onClose) onClose();
  };

  const handleCloseSaveData = () => {
    // No-op: saving feature removed
  };

  return {
    addPoint,
    updatePoint,
    toggleEditMode,
    clearAll,
    handleClose,
    handleCloseWithoutSaving,
    handleCloseSaveData,
  };
};
