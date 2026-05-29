/**
 * useStreetView Hook
 * Manages Street View related state and functionality
 */

import { useState, useEffect } from "react";
import { showToast } from "../../../../../utils/toastUtils";
import { Point } from "../types/distanceTypes";
import {
  updateMarkersForStreetView,
  updateDistanceLabelsForStreetView,
  recreatePolylineForStreetView,
  findNearestPoint,
  getStreetViewOptions,
  createKeyboardHandler,
} from "../utils/streetViewUtils";

interface UseStreetViewProps {
  map: google.maps.Map | null;
  points: Point[];
  markers: google.maps.Marker[];
  polyline: google.maps.Polyline | null;
  distanceLabels: google.maps.Marker[];
  setPolyline: (polyline: google.maps.Polyline | null) => void;
}

export const useStreetView = ({
  map,
  points,
  markers,
  polyline,
  distanceLabels,
  setPolyline,
}: UseStreetViewProps) => {
  // State
  const [streetViewEnabled, setStreetViewEnabled] = useState<boolean>(false);
  const [currentStreetViewPoint, setCurrentStreetViewPoint] = useState<
    number | null
  >(null);
  const [streetViewAvailability, setStreetViewAvailability] = useState<
    Map<number, boolean>
  >(new Map());
  const [showStreetViewCoverage, setShowStreetViewCoverage] =
    useState<boolean>(false);
  const [coverageLayer, setCoverageLayer] =
    useState<google.maps.StreetViewCoverageLayer | null>(null);

  // Coverage layer effect
  useEffect(() => {
    if (!map) return;
    if (showStreetViewCoverage && streetViewEnabled) {
      const layer = new google.maps.StreetViewCoverageLayer();
      layer.setMap(map);
      setCoverageLayer(layer);
    } else if (coverageLayer) {
      coverageLayer.setMap(null);
      setCoverageLayer(null);
    }
    return () => {
      if (coverageLayer) coverageLayer.setMap(null);
    };
  }, [showStreetViewCoverage, streetViewEnabled, map, coverageLayer]);

  // Check availability for each point
  useEffect(() => {
    if (!map || !streetViewEnabled || points.length === 0) return;
    const streetViewService = new google.maps.StreetViewService();
    const availability = new Map<number, boolean>();

    points.forEach((point, index) => {
      streetViewService.getPanorama(
        {
          location: { lat: point.lat, lng: point.lng },
          radius: 50,
          source: google.maps.StreetViewSource.OUTDOOR,
        },
        (data, status) => {
          availability.set(index, status === google.maps.StreetViewStatus.OK);
          setStreetViewAvailability(new Map(availability));
        },
      );
    });
  }, [points, streetViewEnabled, map]);

  // Navigation functions
  const openStreetView = (lat: number, lng: number, pointIndex?: number) => {
    if (!map || !streetViewEnabled) return;
    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama(
      {
        location: { lat, lng },
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => {
        if (
          status === google.maps.StreetViewStatus.OK &&
          data?.location?.latLng
        ) {
          const panorama = map.getStreetView();
          panorama.setOptions(
            getStreetViewOptions(data.location.latLng, lat, lng),
          );
          if (pointIndex !== undefined) setCurrentStreetViewPoint(pointIndex);
        } else {
          showToast.warning(
            "Street View not available here. Enable coverage layer to see available areas.",
          );
        }
      },
    );
  };

  const navigateToNextPoint = () => {
    if (currentStreetViewPoint === null || points.length === 0) return;
    const nextIndex = (currentStreetViewPoint + 1) % points.length;
    openStreetView(points[nextIndex].lat, points[nextIndex].lng, nextIndex);
  };

  const navigateToPreviousPoint = () => {
    if (currentStreetViewPoint === null || points.length === 0) return;
    const prevIndex =
      currentStreetViewPoint === 0
        ? points.length - 1
        : currentStreetViewPoint - 1;
    openStreetView(points[prevIndex].lat, points[prevIndex].lng, prevIndex);
  };

  const exitStreetView = () => {
    if (!map) return;
    map.getStreetView().setVisible(false);
    setCurrentStreetViewPoint(null);
  };

  const drawDottedLineInStreetView = () => {
    if (!map || points.length < 2) return;
    const panorama = map.getStreetView();
    if (!panorama.getVisible()) return;

    if (polyline) {
      polyline.setOptions({
        strokeColor: "#00FF00",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        zIndex: 999999,
        visible: true,
      });
    }
    updateMarkersForStreetView(markers, currentStreetViewPoint, true);
    updateDistanceLabelsForStreetView(distanceLabels, true);
  };

  // Visibility and position listeners
  useEffect(() => {
    if (!map) return;
    const panorama = map.getStreetView();

    const visibilityListener = panorama.addListener("visible_changed", () => {
      const isVisible = panorama.getVisible();
      if (isVisible) {
        setTimeout(() => {
          if (polyline) {
            const newPolyline = recreatePolylineForStreetView(polyline, map);
            setPolyline(newPolyline);
          }
          updateMarkersForStreetView(markers, currentStreetViewPoint, true);
          updateDistanceLabelsForStreetView(distanceLabels, true);
        }, 100);
      } else {
        setCurrentStreetViewPoint(null);
        markers.forEach((marker) => marker.setAnimation(null));
      }
    });

    const positionListener = panorama.addListener("position_changed", () => {
      if (panorama.getVisible()) {
        const position = panorama.getPosition();
        if (position) {
          const { index, distance } = findNearestPoint(position, points);
          if (index !== -1 && distance < 100) {
            setCurrentStreetViewPoint(index);
          }
        }
        drawDottedLineInStreetView();
      }
    });

    const povListener = panorama.addListener("pov_changed", () => {
      if (panorama.getVisible()) drawDottedLineInStreetView();
    });

    return () => {
      google.maps.event.removeListener(visibilityListener);
      google.maps.event.removeListener(positionListener);
      google.maps.event.removeListener(povListener);
      const canvas = document.getElementById(
        "street-view-canvas-overlay",
      ) as HTMLCanvasElement;
      if (canvas) canvas.remove();
    };
  }, [map, polyline, markers, distanceLabels, points, currentStreetViewPoint]);

  // Keyboard shortcuts
  useEffect(() => {
    const panorama = map?.getStreetView() || null;
    const handleKeyPress = createKeyboardHandler(
      streetViewEnabled,
      currentStreetViewPoint,
      panorama,
      navigateToNextPoint,
      navigateToPreviousPoint,
      exitStreetView,
    );
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [streetViewEnabled, currentStreetViewPoint, points, map]);

  return {
    streetViewEnabled,
    setStreetViewEnabled,
    currentStreetViewPoint,
    streetViewAvailability,
    showStreetViewCoverage,
    setShowStreetViewCoverage,
    coverageLayer,
    openStreetView,
    navigateToNextPoint,
    navigateToPreviousPoint,
    exitStreetView,
  };
};
