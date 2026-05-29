
import type { Building, Obstacle } from '../buildingData/index';
import type { LOSAnalysisResult, LOSPoint } from './types';
import { calculateFresnelRadius } from './fresnel';
import { getSurfaceElevation } from './surface';
import { suggestAlternativePaths } from './alternatives';

/**
 * Calculate line-of-sight analysis between two points
 *
 * @param startPoint Start point with elevation
 * @param endPoint End point with elevation
 * @param elevationData Terrain elevation samples along path
 * @param buildings Buildings along or near the path
 * @param obstacles Other obstacles (trees, towers, etc.)
 * @param antennaHeight1 Height of antenna at start point (meters)
 * @param antennaHeight2 Height of antenna at end point (meters)
 * @param frequency RF frequency in MHz
 * @returns Comprehensive LOS analysis result
 */
export const calculateLOS = (
  startPoint: { lat: number; lng: number; elevation: number },
  endPoint: { lat: number; lng: number; elevation: number },
  elevationData: Array<{
    elevation: number;
    location: { lat: number; lng: number };
    distance: number;
  }>,
  buildings: Building[],
  obstacles: Obstacle[],
  antennaHeight1: number = 30,
  antennaHeight2: number = 30,
  frequency: number = 2400
): LOSAnalysisResult => {

  const totalDistance = elevationData[elevationData.length - 1]?.distance || 0;

  if (totalDistance === 0 || elevationData.length === 0) {
    throw new Error('Invalid elevation data');
  }

  const losPoints: LOSPoint[] = [];
  const obstructions: LOSAnalysisResult['obstructions'] = [];
  let buildingsDetected = 0;
  let obstaclesDetected = 0;

  // Calculate LOS for each sample point
  elevationData.forEach((point, index) => {
    const distanceFromStart = point.distance;
    const distanceFromEnd = totalDistance - distanceFromStart;

    // Calculate LOS beam height at this point (linear interpolation)
    const startHeight = startPoint.elevation + antennaHeight1;
    const endHeight = endPoint.elevation + antennaHeight2;
    const losBeamHeight = startHeight +
      (distanceFromStart / totalDistance) * (endHeight - startHeight);

    // Calculate First Fresnel zone radius at this point
    const fresnelRadius = calculateFresnelRadius(
      distanceFromStart,
      distanceFromEnd,
      frequency
    );

    const fresnel60Radius = fresnelRadius * 0.6; // 60% Fresnel zone (recommended)

    // Get surface elevation (terrain + buildings/obstacles)
    const surfaceData = getSurfaceElevation(
      point.location,
      point.elevation,
      buildings,
      obstacles
    );

    const surfaceElevation = surfaceData.height;

    // Calculate clearance (positive = clear, negative = obstructed)
    const clearance = losBeamHeight - surfaceElevation - fresnel60Radius;
    const isObstructed = clearance < 0;

    // Track statistics
    if (surfaceData.type !== 'terrain') {
      if (surfaceData.type === 'building') {
        buildingsDetected++;
      } else {
        obstaclesDetected++;
      }
    }

    const losPoint: LOSPoint = {
      distance: distanceFromStart,
      terrainElevation: point.elevation,
      surfaceElevation,
      losElevation: losBeamHeight,
      fresnelRadius,
      fresnel60Radius,
      isObstructed,
      clearance,
      obstruction: isObstructed ? {
        type: surfaceData.type as any,
        name: surfaceData.name,
        height: surfaceElevation,
        penetration: Math.abs(clearance)
      } : undefined
    };

    losPoints.push(losPoint);

    // Record obstructions
    if (isObstructed) {
      obstructions.push({
        distance: distanceFromStart,
        type: surfaceData.type,
        name: surfaceData.name,
        penetration: Math.abs(clearance),
        clearance
      });
    }
  });

  // Find worst clearance point
  const worstPoint = losPoints.reduce((worst, current) => {
    return current.clearance < worst.clearance ? current : worst;
  });

  const worstClearance = worstPoint.clearance;

  // Calculate statistics
  const clearPoints = losPoints.filter(p => !p.isObstructed).length;
  const obstructedPoints = losPoints.length - clearPoints;
  const clearancePercentage = (clearPoints / losPoints.length) * 100;
  const averageClearance = losPoints.reduce((sum, p) => sum + p.clearance, 0) / losPoints.length;

  // Determine if path is clear (60% Fresnel zone clearance recommended)
  const isClear = clearancePercentage >= 60;

  // Generate alternative paths if obstructed
  const alternativePaths = isClear ? undefined : suggestAlternativePaths(
    startPoint,
    endPoint,
    totalDistance,
    obstructions,
    antennaHeight1,
    antennaHeight2,
    frequency,
    worstClearance
  );

  return {
    isClear,
    clearancePercentage,
    worstClearance,
    worstPoint,
    points: losPoints,
    obstructions,
    statistics: {
      totalDistance,
      clearPoints,
      obstructedPoints,
      averageClearance,
      buildingsDetected,
      obstaclesDetected
    },
    alternativePaths
  };
};

