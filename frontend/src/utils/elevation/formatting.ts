
/**
 * Format elevation value for display
 * @param meters Elevation in meters
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export const formatElevation = (meters: number, decimals: number = 1): string => {
  const numMeters = Number(meters);
  if (!numMeters || isNaN(numMeters)) return "0 m";
  return `${numMeters.toFixed(decimals)} m`;
};

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string with appropriate unit
 */
export const formatDistance = (meters: number): string => {
  const numMeters = Number(meters);
  if (!numMeters || isNaN(numMeters)) return "0 m";
  return numMeters < 1000
    ? `${numMeters.toFixed(2)} m`
    : `${(numMeters / 1000).toFixed(2)} km`;
};

/**
 * Get color for grade visualization
 * @param grade Grade percentage
 * @returns CSS color class or hex color
 */
export const getGradeColor = (grade: number): string => {
  const absGrade = Math.abs(grade);
  if (absGrade > 15) return "#dc2626"; // red-600 - Very steep
  if (absGrade > 10) return "#ea580c"; // orange-600 - Steep
  if (absGrade > 5) return "#f59e0b"; // amber-500 - Moderate
  return "#6b7280"; // gray-500 - Gentle
};

/**
 * Get color for elevation visualization
 * @param elevation Current elevation
 * @param minElevation Minimum elevation in dataset
 * @param maxElevation Maximum elevation in dataset
 * @returns RGB color string
 */
export const getElevationColor = (
  elevation: number,
  minElevation: number,
  maxElevation: number
): string => {
  if (maxElevation === minElevation) return "rgb(59, 130, 246)"; // Default blue

  // Normalize elevation to 0-1 range
  const normalized = (elevation - minElevation) / (maxElevation - minElevation);

  // Color gradient: Green (low) -> Yellow (mid) -> Red (high)
  if (normalized < 0.5) {
    // Green to Yellow
    const r = Math.round(normalized * 2 * 255);
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red
    const r = 255;
    const g = Math.round((1 - (normalized - 0.5) * 2) * 255);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
};

