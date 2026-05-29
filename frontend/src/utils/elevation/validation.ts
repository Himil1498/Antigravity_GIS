
import type { ElevationPoint } from './types';

/**
 * Validate elevation data quality
 * @param elevationData Elevation data array
 * @returns Validation result with warnings
 */
export const validateElevationData = (
  elevationData: ElevationPoint[]
): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for null/undefined elevations
  const invalidCount = elevationData.filter(
    (d) => d.elevation == null || isNaN(d.elevation)
  ).length;

  if (invalidCount > 0) {
    warnings.push(
      `${invalidCount} data points have invalid elevation values`
    );
  }

  // Check for suspicious elevation changes (>500m between consecutive points)
  for (let i = 1; i < elevationData.length; i++) {
    const elevChange = Math.abs(
      elevationData[i].elevation - elevationData[i - 1].elevation
    );
    if (elevChange > 500) {
      warnings.push(
        `Suspicious elevation change of ${elevChange.toFixed(1)}m detected at index ${i}`
      );
    }
  }

  // Check resolution quality
  const avgResolution =
    elevationData.reduce((sum, d) => sum + d.resolution, 0) /
    elevationData.length;
  if (avgResolution > 100) {
    warnings.push(
      `Low resolution data detected (avg: ${avgResolution.toFixed(1)}m)`
    );
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
};

