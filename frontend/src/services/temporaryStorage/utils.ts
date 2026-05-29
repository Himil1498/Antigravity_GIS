
import { STORAGE_PREFIX, NEAR_EXPIRY_THRESHOLD } from "./constants";
import { GISToolType, TemporaryStorageItem } from "./types";

/**
 * Generate storage key for temporary item
 */
export const getStorageKey = (
  toolType: GISToolType,
  userId: string,
  timestamp: number
): string => {
  return `${STORAGE_PREFIX}_${toolType}_${userId}_${timestamp}`;
};

/**
 * Parse storage key to extract metadata
 */
export const parseStorageKey = (
  key: string
): { toolType: GISToolType; userId: string; timestamp: number } | null => {
  const parts = key.split("_");
  if (parts.length !== 5 || parts[0] !== "temp" || parts[1] !== "gis") {
    return null;
  }
  return {
    toolType: parts[2] as GISToolType,
    userId: parts[3],
    timestamp: parseInt(parts[4])
  };
};

/**
 * Get tool type display name
 */
export const getToolTypeName = (toolType: GISToolType): string => {
  const names: Record<GISToolType, string> = {
    elevation: "Elevation Profile",
    distance: "Distance Measurement",
    polygon: "Polygon",
    circle: "Circle",
    sector: "RF Sector",
    infrastructure: "Infrastructure"
  };
  return names[toolType];
};

/**
 * Convert temporary item to permanent storage data format
 * This extracts the data from temporary storage format for permanent save
 */
export const convertTempToPermanentData = (
  item: TemporaryStorageItem
): any => {
  // Return the raw data without the temporary wrapper
  return item.data;
};

/**
 * Check if an item is near expiry (< 2 hours remaining)
 */
export const isNearExpiry = (item: TemporaryStorageItem): boolean => {
  const now = Date.now();
  return item.expiresAt - now < NEAR_EXPIRY_THRESHOLD;
};

/**
 * Get time remaining until expiry
 */
export const getTimeRemaining = (item: TemporaryStorageItem): string => {
  const now = Date.now();
  const remaining = item.expiresAt - now;

  if (remaining < 0) return "Expired";

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

