/**
 * Utility functions for SectorRFTool feature
 */

import { EARTH_RADIUS } from '../constants/sectorConstants';
import type { SectorCenter } from '../types/sectorTypes';

/**
 * Get cardinal direction from azimuth angle
 */
export const getCardinalDirection = (azimuth: number): string => {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW'
  ];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
};

/**
 * Format area for display
 */
export const formatArea = (sqMeters: number): string => {
  if (sqMeters < 10000) {
    return `${sqMeters.toFixed(2)} m²`;
  } else if (sqMeters < 1000000) {
    return `${(sqMeters / 10000).toFixed(2)} hectares`;
  } else {
    return `${(sqMeters / 1000000).toFixed(2)} km²`;
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
};

/**
 * Calculate point at distance and bearing from center
 */
export const calculatePointAtBearing = (
  center: SectorCenter,
  distanceMeters: number,
  bearingDegrees: number
): google.maps.LatLngLiteral => {
  const bearing = (bearingDegrees * Math.PI) / 180; // Convert to radians
  const lat1 = (center.lat * Math.PI) / 180;
  const lng1 = (center.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMeters / EARTH_RADIUS) +
      Math.cos(lat1) * Math.sin(distanceMeters / EARTH_RADIUS) * Math.cos(bearing)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distanceMeters / EARTH_RADIUS) * Math.cos(lat1),
      Math.cos(distanceMeters / EARTH_RADIUS) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI
  };
};

/**
 * Create sector path points for polygon
 */
export const createSectorPath = (
  centerPoint: SectorCenter,
  radiusMeters: number,
  azimuthDegrees: number,
  beamwidthDegrees: number,
  segments: number = 30
): google.maps.LatLngLiteral[] => {
  const points: google.maps.LatLngLiteral[] = [];

  // Start from center
  points.push(centerPoint);

  // Calculate start and end angles
  const startAngle = azimuthDegrees - beamwidthDegrees / 2;
  const endAngle = azimuthDegrees + beamwidthDegrees / 2;

  // Create arc points
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments);
    const point = calculatePointAtBearing(centerPoint, radiusMeters, angle);
    points.push(point);
  }

  // Close the path back to center
  points.push(centerPoint);

  return points;
};

/**
 * Calculate sector geometry (area and arc length)
 */
export const calculateSectorGeometry = (
  radiusMeters: number,
  beamwidthDegrees: number
): { area: number; arcLength: number } => {
  // Area of sector = (θ/360) × π × r²
  const beamwidthRadians = (beamwidthDegrees * Math.PI) / 180;
  const area = (beamwidthRadians / (2 * Math.PI)) * Math.PI * radiusMeters * radiusMeters;

  // Arc length = (θ/360) × 2 × π × r
  const arcLength = (beamwidthRadians / (2 * Math.PI)) * 2 * Math.PI * radiusMeters;

  return { area, arcLength };
};

