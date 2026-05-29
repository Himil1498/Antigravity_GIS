/**
 * Utility functions for MapSettings feature
 */

/**
 * Get user-friendly label for zoom level
 */
export const getZoomLevelLabel = (zoom: number): string => {
  if (zoom <= 5) return 'Country Level';
  if (zoom <= 8) return 'State Level';
  if (zoom <= 11) return 'Region Level';
  if (zoom <= 14) return 'City Level';
  if (zoom <= 16) return 'District Level';
  return 'Street Level';
};

