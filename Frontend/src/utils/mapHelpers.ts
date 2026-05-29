/**
 * Map Helper Utilities
 *
 * Pure utility functions for Google Maps operations without React dependencies.
 * Extracted from MapPage.tsx (Lines 1257-1306)
 */

/**
 * Fits the map bounds to include all given overlays
 * @param overlays - Array of Google Maps overlays (Polyline, Polygon, Circle, Marker)
 * @param map - Google Maps instance
 */
export const fitBoundsToOverlays = (
  overlays: any[],
  map: google.maps.Map
): void => {
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  overlays.forEach((overlay) => {
    if (overlay instanceof google.maps.Polyline) {
      overlay.getPath().forEach((latLng: google.maps.LatLng) => {
        bounds.extend(latLng);
        hasPoints = true;
      });
    } else if (overlay instanceof google.maps.Polygon) {
      overlay.getPath().forEach((latLng: google.maps.LatLng) => {
        bounds.extend(latLng);
        hasPoints = true;
      });
    } else if (overlay instanceof google.maps.Circle) {
      bounds.union(overlay.getBounds()!);
      hasPoints = true;
    } else if (overlay instanceof google.maps.Marker) {
      const position = overlay.getPosition();
      if (position) {
        bounds.extend(position);
        hasPoints = true;
      }
    }
  });

  if (hasPoints) {
    map.fitBounds(bounds);
  }
};

/**
 * Formats distance value in meters to human-readable string
 * @param meters - Distance in meters (number or string)
 * @returns Formatted distance string (e.g., "1.5 km", "150.00 m")
 */
export const formatDistance = (meters: number | string): string => {
  const metersNum = typeof meters === "string" ? parseFloat(meters) : meters;
  if (isNaN(metersNum)) return "N/A";
  if (metersNum < 1000) {
    return `${metersNum.toFixed(2)} m`;
  }
  return `${(metersNum / 1000).toFixed(2)} km`;
};

/**
 * Formats area value in square meters to human-readable string
 * @param sqMeters - Area in square meters (number or string)
 * @returns Formatted area string (e.g., "2.5 km²", "500.00 m²")
 */
export const formatArea = (sqMeters: number | string): string => {
  const sqMetersNum =
    typeof sqMeters === "string" ? parseFloat(sqMeters) : sqMeters;
  if (isNaN(sqMetersNum)) return "N/A";
  if (sqMetersNum < 1000000) {
    return `${sqMetersNum.toFixed(2)} m²`;
  }
  return `${(sqMetersNum / 1000000).toFixed(2)} km²`;
};

