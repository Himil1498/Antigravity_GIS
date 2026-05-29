
/**
 * Calculate bearing (heading) between two geographic points
 * @param start Starting point with lat/lng
 * @param end Ending point with lat/lng
 * @returns Bearing in degrees (0-360)
 */
export const calculateBearing = (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): number => {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360
};

/**
 * Calculate midpoint between two geographic points
 * @param start Starting point with lat/lng
 * @param end Ending point with lat/lng
 * @returns Midpoint coordinates
 */
export const calculateMidpoint = (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): { lat: number; lng: number } => {
  return {
    lat: (start.lat + end.lat) / 2,
    lng: (start.lng + end.lng) / 2
  };
};

/**
 * Calculate distance between two points using Google Maps Geometry
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  if (window.google && window.google.maps && window.google.maps.geometry) {
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(point1.lat, point1.lng),
      new google.maps.LatLng(point2.lat, point2.lng)
    );
  }

  // Fallback to Haversine formula
  const R = 6371000; // Earth's radius in meters
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

