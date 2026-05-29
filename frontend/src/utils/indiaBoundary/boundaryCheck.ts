
import { INDIA_BOUNDS } from "./constants";
import { getIndiaBoundaryPolygons } from "./boundaryLoader";

/**
 * Bounding box check (faster but less accurate - used as fallback or pre-check)
 */
export const isPointInIndiaBoundingBox = (lat: number, lng: number): boolean => {
  return (
    lat >= INDIA_BOUNDS.south &&
    lat <= INDIA_BOUNDS.north &&
    lng >= INDIA_BOUNDS.west &&
    lng <= INDIA_BOUNDS.east
  );
};

/**
 * Check if a point (lat, lng) is inside India's boundaries
 * @param lat Latitude
 * @param lng Longitude
 * @returns true if point is inside India, false otherwise
 */
export const isPointInsideIndia = (lat: number, lng: number): boolean => {
  const indiaBoundaryPolygons = getIndiaBoundaryPolygons();
  
  if (!indiaBoundaryPolygons || indiaBoundaryPolygons.length === 0) {
    console.warn('India boundary not loaded yet. Allowing operation.');
    return true; // Allow operation if boundary not loaded yet
  }

  // Pre-check with bounding box for performance
  if (!isPointInIndiaBoundingBox(lat, lng)) {
    return false;
  }

  const point = new google.maps.LatLng(lat, lng);

  // Check if point is inside any of the India polygons
  for (const polygon of indiaBoundaryPolygons) {
    if (google.maps.geometry.poly.containsLocation(point, polygon)) {
      return true;
    }
  }

  return false;
};

