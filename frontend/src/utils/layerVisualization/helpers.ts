import type { LayerOverlay } from "./types";

/**
 * Show/hide overlays on map
 */
export const setOverlaysVisibility = (
  overlays: LayerOverlay[],
  visible: boolean,
  map: google.maps.Map | null,
): void => {
  overlays.forEach((item) => {
    if ("setMap" in item.overlay) {
      (item.overlay as any).setMap(visible ? map : null);
    }
  });
};

/**
 * Helper: Calculate polygon center
 */
export const getPolygonCenter = (
  path: google.maps.LatLngLiteral[],
): google.maps.LatLngLiteral => {
  const bounds = new google.maps.LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  const center = bounds.getCenter();
  return { lat: center.lat(), lng: center.lng() };
};

/**
 * Helper: Format distance
 */
export const formatDistance = (meters: number | string): string => {
  const metersNum = typeof meters === "string" ? parseFloat(meters) : meters;
  if (isNaN(metersNum)) return "N/A";
  if (metersNum < 1000) {
    return `${Math.round(metersNum)} m`;
  }
  return `${(metersNum / 1000).toFixed(2)} km`;
};

/**
 * Helper: Format area
 */
export const formatArea = (sqMeters: number | string): string => {
  const sqMetersNum =
    typeof sqMeters === "string" ? parseFloat(sqMeters) : sqMeters;
  if (isNaN(sqMetersNum)) return "N/A";
  if (sqMetersNum < 10000) {
    return `${Math.round(sqMetersNum)} m²`;
  }
  return `${(sqMetersNum / 1000000).toFixed(2)} km²`;
};

/**
 * Helper: Calculate Haversine distance between two points
 */
export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

