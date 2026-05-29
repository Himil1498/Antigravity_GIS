/**
 * Elevation Utilities
 * Helper functions for elevation data processing and visualization
 */

import { ElevationDataPoint, Point, Segment } from "../types/distanceTypes";
import { SegmentElevation } from "../../../../../types/gisToolTypes/index";
import {
  mapMeasurementPointsToElevationData,
  calculateSegmentElevationStats,
  validateElevationData,
  exportElevationToCSV,
  downloadCSV,
  exportElevationToKML,
  exportElevationToGPX,
  downloadKML,
  downloadGPX,
} from "../../../../../utils/elevation/index";
import { showToast } from "../../../../../utils/toastUtils";

/**
 * Process raw elevation results into structured data
 */
export const processRawElevationResults = (
  results: google.maps.ElevationResult[],
  totalDistance: number,
): ElevationDataPoint[] => {
  return results.map((result, index) => {
    const distanceFromStart = (totalDistance / results.length) * index;
    return {
      elevation: result.elevation,
      resolution: result.resolution || 0,
      location: {
        lat: result.location?.lat() || 0,
        lng: result.location?.lng() || 0,
      },
      distance: distanceFromStart,
    };
  });
};

/**
 * Find high and low points in elevation data
 */
export const findExtremePoints = (
  data: ElevationDataPoint[],
): { high: ElevationDataPoint; low: ElevationDataPoint } => {
  let high = data[0];
  let low = data[0];

  data.forEach((point) => {
    if (point.elevation > high.elevation) high = point;
    if (point.elevation < low.elevation) low = point;
  });

  return { high, low };
};

/**
 * Calculate elevation gain and loss
 */
export const calculateGainLoss = (
  data: ElevationDataPoint[],
): { gain: number; loss: number } => {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].elevation - data[i - 1].elevation;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  return { gain, loss };
};

/**
 * Calculate segment stats and mapping
 */
export const calculateElevationStats = (
  points: Point[],
  processedData: ElevationDataPoint[],
  segments: Segment[],
): {
  mapping: Map<string, number>;
  segmentStats: SegmentElevation[];
} => {
  const mapping = mapMeasurementPointsToElevationData(points, processedData);
  const segmentStats = calculateSegmentElevationStats(
    points,
    processedData,
    mapping,
    segments,
  );

  const validation = validateElevationData(processedData);
  if (!validation.valid && validation.warnings.length > 0) {
    console.warn("Elevation data quality warnings:", validation.warnings);
  }

  return { mapping, segmentStats };
};

/**
 * Get elevation API error message
 */
export const getElevationErrorMessage = (status: string): string => {
  switch (status) {
    case "INVALID_REQUEST":
      return "Invalid elevation request. Check your points.";
    case "OVER_QUERY_LIMIT":
      return "Elevation API quota exceeded. Try again later.";
    case "REQUEST_DENIED":
      return "Elevation API access denied. Check your API key.";
    case "UNKNOWN_ERROR":
      return "Unknown error. Please try again.";
    default:
      return "Failed to fetch elevation data.";
  }
};

/**
 * Export elevation data to KML
 */
export const handleExportKML = (
  elevationData: ElevationDataPoint[],
  points: Point[],
  name: string,
  totalDistance: number,
  highElevation: number,
  lowElevation: number,
  gain: number,
  loss: number,
) => {
  const measurementName = name || `Distance_Measurement_${Date.now()}`;
  const kmlContent = exportElevationToKML(
    elevationData,
    points,
    measurementName,
    totalDistance,
    highElevation,
    lowElevation,
    gain,
    loss,
  );
  downloadKML(kmlContent, measurementName);
  showToast.success("KML exported!");
};

/**
 * Export elevation data to GPX
 */
export const handleExportGPX = (
  elevationData: ElevationDataPoint[],
  points: Point[],
  name: string,
  totalDistance: number,
  highElevation: number,
  lowElevation: number,
  gain: number,
  loss: number,
) => {
  const measurementName = name || `Distance_Measurement_${Date.now()}`;
  const gpxContent = exportElevationToGPX(
    elevationData,
    points,
    measurementName,
    totalDistance,
    highElevation,
    lowElevation,
    gain,
    loss,
  );
  downloadGPX(gpxContent, measurementName);
  showToast.success("GPX exported!");
};

/**
 * Export elevation data to CSV
 */
export const handleExportCSV = (
  elevationData: ElevationDataPoint[],
  name: string,
  totalDistance: number,
  highElevation: number,
  lowElevation: number,
  gain: number,
  loss: number,
) => {
  const measurementName = name || `Distance_Measurement_${Date.now()}`;
  const csvContent = exportElevationToCSV(
    elevationData,
    measurementName,
    totalDistance,
    highElevation,
    lowElevation,
    gain,
    loss,
  );
  downloadCSV(csvContent, `${measurementName}.csv`);
  showToast.success("CSV exported!");
};
