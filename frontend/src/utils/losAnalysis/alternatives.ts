
import type { AlternativePath } from './types';
import { calculateMidpoint, calculateDestinationPoint } from './geometry';

/**
 * Suggest alternative paths when LOS is obstructed
 */
export const suggestAlternativePaths = (
  startPoint: { lat: number; lng: number; elevation: number },
  endPoint: { lat: number; lng: number; elevation: number },
  totalDistance: number,
  obstructions: any[],
  antennaHeight1: number,
  antennaHeight2: number,
  frequency: number,
  worstClearance: number
): AlternativePath[] => {
  const alternatives: AlternativePath[] = [];

  // Strategy 1: Increase antenna heights
  const requiredAdditionalHeight = Math.ceil(Math.abs(worstClearance)) + 5; // +5m safety margin
  if (requiredAdditionalHeight < 50) { // Reasonable limit
    const newHeight1 = antennaHeight1 + requiredAdditionalHeight;
    const newHeight2 = antennaHeight2 + requiredAdditionalHeight;

    alternatives.push({
      id: 'increase-height',
      waypoints: [startPoint, endPoint],
      reason: 'Increase Antenna Heights',
      improvement: `Raise both antennas by ${requiredAdditionalHeight}m to achieve clearance`,
      strategy: 'increase_height',
      estimatedImprovement: 100, // Should clear all obstructions
      additionalCost: `Tower height increase: ~$${(requiredAdditionalHeight * 500).toLocaleString()}`
    });
  }

  // Strategy 2: Add intermediate relay point
  const midpoint = calculateMidpoint(startPoint, endPoint);
  const suggestedRelayHeight = Math.max(
    startPoint.elevation,
    endPoint.elevation
  ) + Math.abs(worstClearance) + antennaHeight1 + 10;

  alternatives.push({
    id: 'add-relay',
    waypoints: [startPoint, midpoint, endPoint],
    reason: 'Add Relay Tower at Midpoint',
    improvement: `Install ${suggestedRelayHeight.toFixed(0)}m relay tower to split path into two shorter, clearer segments`,
    strategy: 'add_relay',
    estimatedImprovement: 85,
    additionalCost: `New relay tower: ~$${(suggestedRelayHeight * 1000 + 50000).toLocaleString()}`
  });

  // Strategy 3: Route around major obstructions
  if (obstructions.length > 0) {
    // Find the major obstruction point
    const majorObstruction = obstructions.reduce((max, obs) =>
      obs.penetration > max.penetration ? obs : max
    );

    // Suggest a detour point perpendicular to the line
    const bearing = 90; // Perpendicular
    const detourDistance = totalDistance * 0.2; // 20% offset
    const detourPoint = calculateDestinationPoint(
      startPoint,
      detourDistance,
      bearing
    );

    alternatives.push({
      id: 'route-around',
      waypoints: [startPoint, detourPoint, endPoint],
      reason: 'Route Around Major Obstruction',
      improvement: `Detour around ${majorObstruction.type} by ${(detourDistance / 1000).toFixed(1)}km`,
      strategy: 'route_around',
      estimatedImprovement: 70,
      additionalCost: `Additional ${((detourDistance * 2) / 1000).toFixed(1)}km path length`
    });
  }

  // Strategy 4: Use higher frequency (if currently low)
  if (frequency < 5000) {
    const newFrequency = Math.min(frequency * 2, 5800); // Suggest 5.8 GHz max
    const fresnelImprovement = (frequency / newFrequency) * 100;

    alternatives.push({
      id: 'adjust-frequency',
      waypoints: [startPoint, endPoint],
      reason: 'Use Higher Frequency Band',
      improvement: `Switch to ${newFrequency}MHz (${fresnelImprovement.toFixed(0)}% smaller Fresnel zone, easier to clear)`,
      strategy: 'adjust_frequency',
      estimatedImprovement: 60,
      additionalCost: 'Equipment upgrade to support higher frequency'
    });
  }

  return alternatives;
};

