/**
 * DataHub Service Utilities
 * Helper functions for data transformation and mapping
 */

import { STORAGE_KEYS, DATA_TYPES } from "./constants";

/**
 * Get storage key for data type
 */
export const getStorageKey = (type: string): string => {
  switch (type) {
    case DATA_TYPES.DISTANCE:
      return STORAGE_KEYS.DISTANCE;
    case DATA_TYPES.POLYGON:
      return STORAGE_KEYS.POLYGON;
    case DATA_TYPES.CIRCLE:
      return STORAGE_KEYS.CIRCLE;
    case DATA_TYPES.ELEVATION:
      return STORAGE_KEYS.ELEVATION;
    case DATA_TYPES.INFRASTRUCTURE:
      return STORAGE_KEYS.INFRASTRUCTURE;
    case DATA_TYPES.SECTOR_RF:
      return STORAGE_KEYS.SECTOR_RF;
    default:
      return "";
  }
};

/**
 * Parse JSON fields from backend item based on type
 */
export const parseJSONFields = (item: any): any => {
  let parsedData = item;

  if (item.type === DATA_TYPES.ELEVATION) {
    parsedData = {
      ...item,
      start_point:
        typeof item.start_point === "string"
          ? JSON.parse(item.start_point)
          : item.start_point,
      end_point:
        typeof item.end_point === "string"
          ? JSON.parse(item.end_point)
          : item.end_point,
      points:
        typeof item.points === "string" ? JSON.parse(item.points) : item.points,
      elevation_data:
        typeof item.elevation_data === "string"
          ? JSON.parse(item.elevation_data)
          : item.elevation_data,
      building_data:
        item.building_data && typeof item.building_data === "string"
          ? JSON.parse(item.building_data)
          : item.building_data,
      obstacle_data:
        item.obstacle_data && typeof item.obstacle_data === "string"
          ? JSON.parse(item.obstacle_data)
          : item.obstacle_data,
      los_analysis:
        item.los_analysis && typeof item.los_analysis === "string"
          ? JSON.parse(item.los_analysis)
          : item.los_analysis,
      bearing:
        item.bearing !== null && item.bearing !== undefined
          ? Number(item.bearing)
          : null,
      reverse_bearing:
        item.reverse_bearing !== null && item.reverse_bearing !== undefined
          ? Number(item.reverse_bearing)
          : null,
    };
  } else if (item.type === DATA_TYPES.DISTANCE) {
    parsedData = {
      ...item,
      points:
        typeof item.points === "string" ? JSON.parse(item.points) : item.points,
      elevation_data:
        item.elevation_data && typeof item.elevation_data === "string"
          ? JSON.parse(item.elevation_data)
          : item.elevation_data,
    };
  } else if (item.type === DATA_TYPES.POLYGON) {
    parsedData = {
      ...item,
      coordinates:
        typeof item.coordinates === "string"
          ? JSON.parse(item.coordinates)
          : item.coordinates,
    };
  } else if (item.type === DATA_TYPES.INFRASTRUCTURE) {
    parsedData = {
      ...item,
      properties:
        item.properties && typeof item.properties === "string"
          ? JSON.parse(item.properties)
          : item.properties,
    };
  }

  return parsedData;
};

/**
 * Transform backend item to DataHubEntry format
 */
export const transformBackendItem = (item: any): any => {
  const parsedData = parseJSONFields(item);

  return {
    id: item.id?.toString() || `${item.type}_${Date.now()}`,
    type: item.type,
    name:
      item.measurement_name ||
      item.polygon_name ||
      item.circle_name ||
      item.profile_name ||
      item.item_name ||
      item.sector_name ||
      "Untitled",
    createdAt: new Date(item.created_at),
    savedAt: new Date(item.updated_at || item.created_at),
    fileSize: JSON.stringify(item).length,
    source: item.source || "Manual",
    userId: item.created_by || item.user_id,
    username: item.username,
    data: parsedData,
  };
};

