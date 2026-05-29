/**
 * DataHub Service Constants
 * Configuration and API settings
 */

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:82/api";

export const USE_BACKEND = process.env.REACT_APP_USE_BACKEND === "true";

/**
 * LocalStorage keys for different data types
 */
export const STORAGE_KEYS = {
  DISTANCE: "gis_distance_measurements",
  POLYGON: "gis_polygons",
  CIRCLE: "gis_circles",
  ELEVATION: "gis_elevation_profiles",
  INFRASTRUCTURE: "gis_infrastructures",
  SECTOR_RF: "gis_sector_rf",
} as const;

/**
 * Data type names
 */
export const DATA_TYPES = {
  DISTANCE: "Distance",
  POLYGON: "Polygon",
  CIRCLE: "Circle",
  ELEVATION: "Elevation",
  INFRASTRUCTURE: "Infrastructure",
  SECTOR_RF: "SectorRF",
} as const;

