/**
 * Marker Factory Functions
 * Functions to create Google Maps markers with specific configurations
 */

import { MARKER_ICON_PATH } from "../constants/distanceConstants";

/**
 * Creates a measurement point marker (A, B, C, etc.)
 */
export const createPointMarker = (
  map: google.maps.Map,
  lat: number,
  lng: number,
  label: string
): google.maps.Marker => {
  return new google.maps.Marker({
    position: { lat, lng },
    map: map,
    label: { text: label, color: "white", fontWeight: "bold" },
    title: `Point ${label}`,
    draggable: false,
    zIndex: 1000000,
    optimized: false
  });
};

/**
 * Creates a distance label marker (placed between two points)
 */
export const createDistanceLabelMarker = (
  map: google.maps.Map,
  lat: number,
  lng: number,
  distanceText: string
): google.maps.Marker => {
  return new google.maps.Marker({
    position: { lat, lng },
    map: map,
    label: {
      text: distanceText,
      color: "#1e3a5f",
      fontSize: "12px",
      fontWeight: "bold",
      className: "gis-distance-label"
    },
    icon: {
      url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'),
      anchor: new google.maps.Point(0, 0)
    },
    zIndex: 1000001,
    clickable: false,
    optimized: false
  });
};

/**
 * Creates the high point marker
 */
export const createHighPointMarker = (
  map: google.maps.Map,
  lat: number,
  lng: number,
  elevation: number
): google.maps.Marker => {
  return new google.maps.Marker({
    position: { lat, lng },
    map: map,
    label: {
      text: "H",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px"
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#10b981",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3
    },
    title: `High Point: ${elevation.toFixed(2)}m`,
    zIndex: 999,
    animation: google.maps.Animation.BOUNCE
  });
};

/**
 * Creates the low point marker
 */
export const createLowPointMarker = (
  map: google.maps.Map,
  lat: number,
  lng: number,
  elevation: number
): google.maps.Marker => {
  return new google.maps.Marker({
    position: { lat, lng },
    map: map,
    label: {
      text: "L",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px"
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#3b82f6",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3
    },
    title: `Low Point: ${elevation.toFixed(2)}m`,
    zIndex: 999,
    animation: google.maps.Animation.BOUNCE
  });
};

/**
 * Creates the hover marker for elevation graph interaction
 */
export const createHoverMarker = (): google.maps.Marker => {
  return new google.maps.Marker({
    map: null,
    icon: {
      path: MARKER_ICON_PATH,
      fillColor: "#f59e0b",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 1.8,
      anchor: new google.maps.Point(12, 22)
    },
    zIndex: 1000
  });
};

/**
 * Creates the pinned marker for elevation graph clicks
 */
export const createPinnedMarker = (): google.maps.Marker => {
  return new google.maps.Marker({
    map: null,
    icon: {
      path: MARKER_ICON_PATH,
      fillColor: "#ef4444",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 2.2,
      anchor: new google.maps.Point(12, 22)
    },
    zIndex: 1001,
    animation: google.maps.Animation.DROP
  });
};

/**
 * Creates a measurement polyline
 */
export const createMeasurementPolyline = (
  map: google.maps.Map,
  path: Array<{ lat: number; lng: number }>
): google.maps.Polyline => {
  return new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: "#3B82F6",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map,
    zIndex: 999999,
    clickable: true,
    visible: true
  });
};

