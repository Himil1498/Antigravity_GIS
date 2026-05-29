
import { GISToolType, StorageStats } from "./types";
import { getTemporaryData } from "./temporaryStorageDataService";
import { NEAR_EXPIRY_THRESHOLD } from "./constants";

/**
 * Get storage statistics for a user
 */
export const getStorageStats = (userId: string): StorageStats => {
  const items = getTemporaryData(userId);
  const now = Date.now();

  const stats: StorageStats = {
    total: items.length,
    byTool: {
      elevation: 0,
      distance: 0,
      polygon: 0,
      circle: 0,
      sector: 0,
      infrastructure: 0
    },
    nearExpiry: 0
  };

  items.forEach((item) => {
    // Check if toolType exists in byTool (safety check)
    if (Object.prototype.hasOwnProperty.call(stats.byTool, item.toolType)) {
      stats.byTool[item.toolType]++;
    }

    if (item.expiresAt - now < NEAR_EXPIRY_THRESHOLD) {
      stats.nearExpiry++;
    }
  });

  return stats;
};

