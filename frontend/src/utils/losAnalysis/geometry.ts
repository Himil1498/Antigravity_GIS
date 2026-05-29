
/**
 * Calculate Haversine distance between two points
 * @returns Distance in meters
 */
export const haversineDistance = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(p2.lat - p1.lat);
  const dLng = toRadians(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(p1.lat)) *
      Math.cos(toRadians(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

/**
 * Check if point is inside polygon using ray-casting algorithm
 */
export const isPointInPolygon = (
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean => {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Calculate midpoint between two coordinates
 */
export const calculateMidpoint = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): { lat: number; lng: number } => {
  return {
    lat: (p1.lat + p2.lat) / 2,
    lng: (p1.lng + p2.lng) / 2
  };
};

/**
 * Calculate destination point given start, distance, and bearing
 * Simplified version for approximate calculations
 */
export const calculateDestinationPoint = (
  start: { lat: number; lng: number },
  distance: number,
  bearing: number
): { lat: number; lng: number } => {
  const R = 6371000; // Earth radius in meters
  const lat1 = toRadians(start.lat);
  const lng1 = toRadians(start.lng);
  const brng = toRadians(bearing);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
  );

  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: lat2 * (180 / Math.PI),
    lng: lng2 * (180 / Math.PI)
  };
};

