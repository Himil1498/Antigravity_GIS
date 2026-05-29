/**
 * Utility functions for Polygon Drawing Tool
 */

/**
 * Format area for display
 */
export const formatArea = (sqMeters: number): string => {
  if (sqMeters < 10000) {
    return `${sqMeters.toFixed(2)} m²`;
  } else if (sqMeters < 1000000) {
    return `${(sqMeters / 10000).toFixed(2)} hectares`;
  } else {
    return `${(sqMeters / 1000000).toFixed(2)} km²`;
  }
};

/**
 * Format perimeter for display
 */
export const formatPerimeter = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
};

