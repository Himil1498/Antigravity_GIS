
import type { Building, BoundingBox } from './types';

/**
 * Calculate bounding box around path with buffer
 */
export const calculateBoundingBox = (
  path: Array<{ lat: number; lng: number }>,
  bufferMeters: number
): BoundingBox => {
  const lats = path.map(p => p.lat);
  const lngs = path.map(p => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Convert buffer from meters to degrees (approximate)
  // At equator: 1 degree ≈ 111km
  // This is approximate; more accurate calculation would use Haversine
  const bufferDeg = bufferMeters / 111000;

  return {
    south: minLat - bufferDeg,
    north: maxLat + bufferDeg,
    west: minLng - bufferDeg,
    east: maxLng + bufferDeg
  };
};

/**
 * Calculate coverage statistics
 */
export const calculateCoverage = (buildings: Building[]) => {
  const totalBuildings = buildings.length;
  const buildingsWithHeight = buildings.filter(b => !b.estimatedHeight).length;
  const estimatedBuildings = buildings.filter(b => b.estimatedHeight).length;
  const coveragePercentage = totalBuildings > 0
    ? (buildingsWithHeight / totalBuildings) * 100
    : 0;

  // Calculate weighted confidence score
  const confidenceScore = totalBuildings > 0
    ? buildings.reduce((sum, b) => sum + b.confidence, 0) / totalBuildings
    : 0;

  return {
    totalBuildings,
    buildingsWithHeight,
    estimatedBuildings,
    coveragePercentage,
    confidenceScore
  };
};

