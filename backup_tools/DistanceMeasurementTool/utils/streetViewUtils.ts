/**
 * Street View Utilities
 * Helper functions for Street View operations
 */

import { Point } from "../types/distanceTypes";
import { calculateHaversineDistance } from "./distanceUtils";

/**
 * Update markers for Street View visibility
 */
export const updateMarkersForStreetView = (
  markers: google.maps.Marker[],
  currentStreetViewPoint: number | null,
  visible: boolean
) => {
  markers.forEach((marker, index) => {
    const isCurrentPoint = currentStreetViewPoint === index;
    if (visible) {
      marker.setOptions({
        zIndex: isCurrentPoint ? 1000002 : 1000000,
        optimized: false,
        visible: true,
        animation: isCurrentPoint ? google.maps.Animation.BOUNCE : null
      });
    } else {
      marker.setAnimation(null);
    }
  });
};

/**
 * Update distance labels for Street View visibility
 */
export const updateDistanceLabelsForStreetView = (
  distanceLabels: google.maps.Marker[],
  visible: boolean
) => {
  distanceLabels.forEach((label) => {
    label.setOptions({
      zIndex: 1000001,
      optimized: false,
      visible: visible
    });
  });
};

/**
 * Recreate polyline for Street View with higher z-index
 */
export const recreatePolylineForStreetView = (
  polyline: google.maps.Polyline,
  map: google.maps.Map
): google.maps.Polyline => {
  const path = polyline.getPath();
  const pathArray: { lat: number; lng: number }[] = [];
  
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    pathArray.push({ lat: point.lat(), lng: point.lng() });
  }
  
  polyline.setMap(null);
  
  return new google.maps.Polyline({
    path: pathArray,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
    zIndex: 999999,
    clickable: true,
    visible: true
  });
};

/**
 * Find nearest point to a position
 */
export const findNearestPoint = (
  position: google.maps.LatLng,
  points: Point[]
): { index: number; distance: number } => {
  let nearestIndex = -1;
  let minDistance = Infinity;

  points.forEach((point, index) => {
    const distance = calculateHaversineDistance(
      position.lat(),
      position.lng(),
      point.lat,
      point.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return { index: nearestIndex, distance: minDistance };
};

/**
 * Default Street View panorama options
 */
export const getStreetViewOptions = (
  panoLatLng: google.maps.LatLng,
  targetLat: number,
  targetLng: number
): google.maps.StreetViewPanoramaOptions => {
  const heading = google.maps.geometry.spherical.computeHeading(
    panoLatLng,
    new google.maps.LatLng(targetLat, targetLng)
  );

  return {
    position: panoLatLng,
    pov: { heading, pitch: 0 },
    zoom: 1,
    visible: true,
    enableCloseButton: true,
    addressControl: true,
    linksControl: true,
    panControl: true,
    zoomControl: true,
    fullscreenControl: true,
    motionTracking: true,
    motionTrackingControl: true
  };
};

/**
 * Handle keyboard shortcuts for Street View navigation
 */
export const createKeyboardHandler = (
  streetViewEnabled: boolean,
  currentStreetViewPoint: number | null,
  panorama: google.maps.StreetViewPanorama | null,
  navigateNext: () => void,
  navigatePrev: () => void,
  exit: () => void
) => {
  return (e: KeyboardEvent) => {
    if (!streetViewEnabled || currentStreetViewPoint === null) return;
    if (!panorama?.getVisible()) return;

    switch (e.key) {
      case "ArrowRight":
      case "n":
      case "N":
        e.preventDefault();
        navigateNext();
        break;
      case "ArrowLeft":
      case "p":
      case "P":
        e.preventDefault();
        navigatePrev();
        break;
      case "Escape":
        e.preventDefault();
        exit();
        break;
    }
  };
};

