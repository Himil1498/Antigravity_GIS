
import type { SegmentElevation, ElevationPoint } from './types';

/**
 * Calculate Haversine distance between two geographic points
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
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

/**
 * Map measurement points (A, B, C, D) to their nearest elevation data indices
 * @param measurementPoints Array of measurement points with lat, lng, and label
 * @param elevationSamples Array of elevation results from Google API
 * @returns Map of point label to elevation data index
 */
export const mapMeasurementPointsToElevationData = (
  measurementPoints: Array<{ lat: number; lng: number; label: string }>,
  elevationSamples: ElevationPoint[]
): Map<string, number> => {
  const pointToIndexMap = new Map<string, number>();

  measurementPoints.forEach((point) => {
    let nearestIndex = 0;
    let minDistance = Infinity;

    elevationSamples.forEach((sample, index) => {
      const distance = calculateHaversineDistance(
        point.lat,
        point.lng,
        sample.location.lat,
        sample.location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    pointToIndexMap.set(point.label, nearestIndex);
  });

  return pointToIndexMap;
};

/**
 * Calculate segment-wise elevation statistics between consecutive measurement points
 * @param measurementPoints Array of measurement points
 * @param elevationData Processed elevation data
 * @param pointToIndexMap Mapping of point labels to elevation data indices
 * @param segments Distance segments between points
 * @returns Array of segment elevation statistics
 */
export const calculateSegmentElevationStats = (
  measurementPoints: Array<{ lat: number; lng: number; label: string }>,
  elevationData: ElevationPoint[],
  pointToIndexMap: Map<string, number>,
  segments: Array<{ distance: number; from: string; to: string }>
): SegmentElevation[] => {
  const segmentStats: SegmentElevation[] = [];

  for (let i = 0; i < measurementPoints.length - 1; i++) {
    const fromLabel = measurementPoints[i].label;
    const toLabel = measurementPoints[i + 1].label;

    const fromIndex = pointToIndexMap.get(fromLabel);
    const toIndex = pointToIndexMap.get(toLabel);

    if (fromIndex !== undefined && toIndex !== undefined) {
      const fromElevation = elevationData[fromIndex].elevation;
      const toElevation = elevationData[toIndex].elevation;
      const elevationChange = toElevation - fromElevation;
      const distance = segments[i].distance;

      segmentStats.push({
        from: fromLabel,
        to: toLabel,
        fromElevation,
        toElevation,
        elevationChange,
        gain: elevationChange > 0 ? elevationChange : 0,
        loss: elevationChange < 0 ? Math.abs(elevationChange) : 0,
        grade: distance > 0 ? (elevationChange / distance) * 100 : 0,
        distance
      });
    }
  }

  return segmentStats;
};

/**
 * Calculate grade percentage from elevation change and distance
 * @param elevationChange Elevation change in meters
 * @param distance Horizontal distance in meters
 * @returns Grade as percentage
 */
export const calculateGrade = (
  elevationChange: number,
  distance: number
): number => {
  if (distance === 0) return 0;
  return (elevationChange / distance) * 100;
};

/**
 * Calculate smoothed elevation data using moving average
 * @param elevationData Original elevation data
 * @param windowSize Number of points for smoothing (default: 5)
 * @returns Smoothed elevation data
 */
export const smoothElevationData = (
  elevationData: ElevationPoint[],
  windowSize: number = 5
): ElevationPoint[] => {
  if (elevationData.length < windowSize) return elevationData;

  const halfWindow = Math.floor(windowSize / 2);
  const smoothed = elevationData.map((point, index) => {
    const start = Math.max(0, index - halfWindow);
    const end = Math.min(elevationData.length, index + halfWindow + 1);
    const windowData = elevationData.slice(start, end);
    const avgElevation =
      windowData.reduce((sum, d) => sum + d.elevation, 0) / windowData.length;

    return {
      ...point,
      elevation: avgElevation
    };
  });

  return smoothed;
};

