import {
  mapMeasurementPointsToElevationData,
  calculateSegmentElevationStats
} from "../../../../../utils/elevation/index";

export const getCompassDirection = (bearing: number): string => {
  if (bearing >= 337.5 || bearing < 22.5) return 'North';
  if (bearing >= 22.5 && bearing < 67.5) return 'Northeast';
  if (bearing >= 67.5 && bearing < 112.5) return 'East';
  if (bearing >= 112.5 && bearing < 157.5) return 'Southeast';
  if (bearing >= 157.5 && bearing < 202.5) return 'South';
  if (bearing >= 202.5 && bearing < 247.5) return 'Southwest';
  if (bearing >= 247.5 && bearing < 292.5) return 'West';
  return 'Northwest';
};

export const formatDistance = (meters: number): string => {
  if (!meters || isNaN(meters)) return "0 m";
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
};

export const formatElevation = (meters: number): string => {
  if (!meters || isNaN(meters)) return "0 m";
  return `${meters.toFixed(1)} m`;
};

export interface ProcessedElevationResult {
  processedData: any[];
  highPoint: any;
  lowPoint: any;
  elevationGain: number;
  elevationLoss: number;
  pointToElevationIndexMap: Map<string, number>;
  segmentElevationStats: any[];
}

export const processElevationDataAndReturnResults = (
  results: google.maps.ElevationResult[],
  points: { lat: number; lng: number }[],
  multiPointMode: boolean
): ProcessedElevationResult => {
  // Calculate total distance from the points array directly
  let calculatedTotalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(points[i].lat, points[i].lng),
      new google.maps.LatLng(points[i + 1].lat, points[i + 1].lng)
    );
    calculatedTotalDistance += segmentDistance;
  }

  const processedData = results.map((result, index) => {
    const distanceFromStart = (calculatedTotalDistance / results.length) * index;
    return {
      elevation: result.elevation,
      resolution: result.resolution || 0,
      location: {
        lat: result.location?.lat() || 0,
        lng: result.location?.lng() || 0
      },
      distance: distanceFromStart
    };
  });

  let high = processedData[0];
  let low = processedData[0];
  processedData.forEach((point) => {
    if (point.elevation > high.elevation) high = point;
    if (point.elevation < low.elevation) low = point;
  });

  let gain = 0;
  let loss = 0;
  for (let i = 1; i < processedData.length; i++) {
    const diff = processedData[i].elevation - processedData[i - 1].elevation;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  let pointToElevationIndexMap = new Map<string, number>();
  let segmentElevationStats: any[] = [];

  // Calculate segment statistics if multi-point mode
  if (multiPointMode && points.length > 2) {
    const measurementPoints = points.map((p, i) => ({
      ...p,
      label: String.fromCharCode(65 + i) // A, B, C, D...
    }));

    pointToElevationIndexMap = mapMeasurementPointsToElevationData(
      measurementPoints,
      processedData
    );

    // Calculate segment distances
    const segments = [];
    for (let i = 0; i < measurementPoints.length - 1; i++) {
      const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(measurementPoints[i].lat, measurementPoints[i].lng),
        new google.maps.LatLng(measurementPoints[i + 1].lat, measurementPoints[i + 1].lng)
      );
      segments.push({
        distance: segmentDistance,
        from: measurementPoints[i].label,
        to: measurementPoints[i + 1].label
      });
    }

    segmentElevationStats = calculateSegmentElevationStats(
      measurementPoints,
      processedData,
      pointToElevationIndexMap,
      segments
    );
  }

  return {
    processedData,
    highPoint: high,
    lowPoint: low,
    elevationGain: gain,
    elevationLoss: loss,
    pointToElevationIndexMap,
    segmentElevationStats
  };
};

