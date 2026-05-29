/**
 * Custom hook for elevation data processing and export
 * Handles point mapping, segment statistics, and CSV exports
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  mapMeasurementPointsToElevationData,
  calculateSegmentElevationStats,
  exportElevationToCSV,
  exportSegmentStatsToCSV,
  downloadCSV
} from '../../../../utils/elevation/index';
import type { SegmentElevation } from '../../../../types/gisToolTypes/index';

interface UseElevationDataParams {
  elevationData: Array<{
    elevation: number;
    resolution: number;
    location: { lat: number; lng: number };
    distance: number;
  }>;
  points: Array<{ lat: number; lng: number; label?: string }>;
  measurementName: string;
  totalDistance: number;
  maxElevation?: number;
  minElevation?: number;
  elevationGain?: number;
  elevationLoss?: number;
}

export function useElevationData({
  elevationData,
  points,
  measurementName,
  totalDistance,
  maxElevation,
  minElevation,
  elevationGain,
  elevationLoss
}: UseElevationDataParams) {
  const [pointToIndexMap, setPointToIndexMap] = useState<Map<string, number>>(new Map());
  const [segmentStats, setSegmentStats] = useState<SegmentElevation[]>([]);

  // Find high and low points
  const { highPoint, lowPoint } = useMemo(() => {
    if (elevationData.length === 0) {
      return { highPoint: null, lowPoint: null };
    }

    const high = elevationData.reduce((max, point) => {
      const maxElev = Number(max.elevation) || 0;
      const pointElev =Number(point.elevation) || 0;
      return pointElev > maxElev ? point : max;
    });

    const low = elevationData.reduce((min, point) => {
      const minElev = Number(min.elevation) || Infinity;
      const pointElev = Number(point.elevation) || Infinity;
      return pointElev < minElev ? point : min;
    });

    return { highPoint: high, lowPoint: low };
  }, [elevationData]);

  // Calculate point mapping and segment stats when data is available
  useEffect(() => {
    if (elevationData.length > 0 && points.length > 0) {
      // Create labels for points if not already labeled
      const labeledPoints = points.map((p, index) => ({
        ...p,
        label: p.label || String.fromCharCode(65 + index) // A, B, C, D...
      }));

      // Map measurement points to elevation data
      const mapping = mapMeasurementPointsToElevationData(
        labeledPoints,
        elevationData
      );
      setPointToIndexMap(mapping);

      // Calculate segment statistics if we have distance segments
      if (labeledPoints.length >= 2) {
        const segments = [];
        for (let i = 0; i < labeledPoints.length - 1; i++) {
          segments.push({
            distance: 0, // Will be calculated from elevation data
            from: labeledPoints[i].label,
            to: labeledPoints[i + 1].label
          });
        }

        const stats = calculateSegmentElevationStats(
          labeledPoints,
          elevationData,
          mapping,
          segments
        );
        setSegmentStats(stats);
      }
    }
  }, [elevationData, points]);

  // Export handlers
  const handleExportElevation = useCallback(() => {
    const csv = exportElevationToCSV(
      elevationData,
      measurementName,
      Number(totalDistance) || 0,
      Number(maxElevation) || Number(highPoint?.elevation) || 0,
      Number(minElevation) || Number(lowPoint?.elevation) || 0,
      Number(elevationGain) || 0,
      Number(elevationLoss) || 0
    );
    downloadCSV(csv, `${measurementName}_elevation.csv`);
  }, [elevationData, measurementName, totalDistance, maxElevation, minElevation, elevationGain, elevationLoss, highPoint, lowPoint]);

  const handleExportSegments = useCallback(() => {
    if (segmentStats.length > 0) {
      const csv = exportSegmentStatsToCSV(segmentStats, measurementName);
      downloadCSV(csv, `${measurementName}_segments.csv`);
    }
  }, [segmentStats, measurementName]);

  return {
    pointToIndexMap,
    segmentStats,
    highPoint,
    lowPoint,
    handleExportElevation,
    handleExportSegments
  };
}



