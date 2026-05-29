
/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(0)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

/**
 * Format clearance for display
 */
export const formatClearance = (meters: number): string => {
  return `${meters >= 0 ? '+' : ''}${meters.toFixed(1)}m`;
};

/**
 * Get clearance status color
 */
export const getClearanceColor = (clearance: number): string => {
  if (clearance >= 0) return 'green';
  if (clearance >= -5) return 'yellow';
  return 'red';
};

/**
 * Get clearance status text
 */
export const getClearanceStatus = (clearancePercentage: number): string => {
  if (clearancePercentage >= 80) return 'Excellent';
  if (clearancePercentage >= 60) return 'Good';
  if (clearancePercentage >= 40) return 'Marginal';
  return 'Poor';
};

