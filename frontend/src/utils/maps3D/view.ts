
import { calculateMidpoint, calculateBearing } from './calculations';

/**
 * Calculate appropriate zoom level based on distance between points
 * @param distanceInMeters Distance between points in meters
 * @returns Appropriate zoom level (1-21)
 */
export const calculateZoomLevel = (distanceInMeters: number): number => {
  // Zoom level calculation based on distance
  // Shorter distances need higher zoom
  if (distanceInMeters < 500) return 17;
  if (distanceInMeters < 1000) return 16;
  if (distanceInMeters < 2000) return 15;
  if (distanceInMeters < 5000) return 14;
  if (distanceInMeters < 10000) return 13;
  if (distanceInMeters < 20000) return 12;
  if (distanceInMeters < 50000) return 11;
  return 10;
};

export interface Setup3DViewOptions {
  tilt?: number;
  zoom?: number;
  heading?: number;
  mapTypeId?: 'satellite' | 'hybrid' | 'terrain';
  viewFromSide?: boolean; // If true, camera looks perpendicular to path
}

/**
 * Setup 3D view for optimal elevation profile visualization
 * Positions camera, sets tilt, and configures view angle
 * @param map Google Maps instance
 * @param points Array of points forming the elevation path
 * @param options Configuration options for 3D view
 * @returns Object containing map overlays for cleanup
 */
export const setup3DView = (
  map: google.maps.Map,
  points: Array<{ lat: number; lng: number }>,
  totalDistance?: number,
  options?: Setup3DViewOptions
): {
  reset: () => void;
  adjustTilt: (tilt: number) => void;
  rotate: (degrees: number) => void;
} => {
  if (!map || points.length < 2) {
    console.warn('Invalid map or insufficient points for 3D view');
    return {
      reset: () => {},
      adjustTilt: () => {},
      rotate: () => {}
    };
  }

  const start = points[0];
  const end = points[points.length - 1];

  // Calculate optimal camera position
  const midpoint = calculateMidpoint(start, end);
  const bearing = calculateBearing(start, end);

  // Perpendicular heading for side view (90 degrees from path direction)
  const perpendicularHeading = options?.viewFromSide !== false
    ? (bearing + 90) % 360
    : bearing;

  // Calculate zoom based on distance
  const zoom = options?.zoom || (
    totalDistance ? calculateZoomLevel(totalDistance) : 15
  );

  // Apply 3D view settings
  map.setCenter(midpoint);
  map.setZoom(zoom);
  map.setMapTypeId(options?.mapTypeId || 'satellite');
  map.setTilt(options?.tilt || 45);
  map.setHeading(options?.heading ?? perpendicularHeading);

  // Store original view for reset
  const originalCenter = map.getCenter();
  const originalZoom = map.getZoom();
  const originalMapTypeId = map.getMapTypeId();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const originalTilt = map.getTilt();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const originalHeading = map.getHeading();

  // Return control functions
  return {
    reset: () => {
      map.setTilt(0);
      map.setHeading(0);
      map.setMapTypeId(originalMapTypeId || 'hybrid');
      if (originalCenter) {
        map.setCenter(originalCenter);
      }
      if (originalZoom) {
        map.setZoom(originalZoom);
      }
    },
    adjustTilt: (tilt: number) => {
      map.setTilt(Math.max(0, Math.min(45, tilt)));
    },
    rotate: (degrees: number) => {
      const currentHeading = map.getHeading() || 0;
      map.setHeading((currentHeading + degrees) % 360);
    }
  };
};

