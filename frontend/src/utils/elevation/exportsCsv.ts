import type { SegmentElevation, ElevationPoint } from './types';
import { formatDistance, formatElevation } from './formatting';

/**
 * Export elevation data to CSV format.
 */
export const exportElevationToCSV = (
  elevationData: ElevationPoint[],
  measurementName: string,
  totalDistance: number,
  maxElevation: number,
  minElevation: number,
  elevationGain: number,
  elevationLoss: number
): string => {
  let csv = `Elevation Profile: ${measurementName}\n`;
  csv += `Total Distance: ${formatDistance(totalDistance)}\n`;
  csv += `Max Elevation: ${formatElevation(maxElevation)}\n`;
  csv += `Min Elevation: ${formatElevation(minElevation)}\n`;
  csv += `Elevation Gain: ${formatElevation(elevationGain)}\n`;
  csv += `Elevation Loss: ${formatElevation(elevationLoss)}\n`;
  csv += `\n`;
  csv += `Distance (m),Latitude,Longitude,Elevation (m),Resolution (m)\n`;

  elevationData.forEach((point) => {
    csv += `${point.distance.toFixed(2)},${point.location.lat.toFixed(
      6
    )},${point.location.lng.toFixed(6)},${point.elevation.toFixed(
      2
    )},${point.resolution.toFixed(2)}\n`;
  });

  return csv;
};

/**
 * Export segment elevation stats to CSV.
 */
export const exportSegmentStatsToCSV = (
  segmentStats: SegmentElevation[],
  measurementName: string
): string => {
  let csv = `Segment Elevation Statistics: ${measurementName}\n\n`;
  csv += `Segment,Distance (m),From Elevation (m),To Elevation (m),Elevation Change (m),Gain (m),Loss (m),Grade (%)\n`;

  segmentStats.forEach((segment) => {
    csv += `${segment.from} → ${segment.to},`;
    csv += `${segment.distance.toFixed(2)},`;
    csv += `${segment.fromElevation.toFixed(2)},`;
    csv += `${segment.toElevation.toFixed(2)},`;
    csv += `${segment.elevationChange.toFixed(2)},`;
    csv += `${segment.gain.toFixed(2)},`;
    csv += `${segment.loss.toFixed(2)},`;
    csv += `${segment.grade.toFixed(2)}\n`;
  });

  return csv;
};

/**
 * Download a CSV file.
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



