
import { STORAGE_PREFIX, EXPIRY_DURATION } from "./constants";
import { GISToolType, TemporaryStorageItem } from "./types";
import { getStorageKey, parseStorageKey } from "./utils";

// Circular dependency note: cleanup is imported here, but cleanup might use data service.
// Ideally, cleanup logic should be self-contained or passed in.
// However, the original code had save calling cleanup. To break cycle, we'll keep cleanup separate
// and maybe call it from here, or duplication for "keysToDelete".
// Let's import cleanup function from cleanupService
import { cleanupExpiredData } from "./temporaryStorageCleanupService";

/**
 * Save temporary data to localStorage
 */
export const saveTemporaryData = (
  userId: string,
  toolType: GISToolType,
  name: string,
  data: any
): string => {
  const now = Date.now();
  const id = `temp_${toolType}_${now}`;

  const item: TemporaryStorageItem = {
    id,
    userId,
    toolType,
    storageType: "temporary",
    name,
    data,
    createdAt: now,
    expiresAt: now + EXPIRY_DURATION
  };

  const key = getStorageKey(toolType, userId, now);

  try {
    localStorage.setItem(key, JSON.stringify(item));

    // Run cleanup to remove expired items
    cleanupExpiredData();

    return id;
  } catch (error) {
    console.error("❌ Failed to save temporary data:", error);
    throw new Error("Failed to save temporary data. Storage may be full.");
  }
};

/**
 * Get all temporary data for a user (optionally filter by tool type)
 */
export const getTemporaryData = (
  userId: string,
  toolType?: GISToolType
): TemporaryStorageItem[] => {
  const items: TemporaryStorageItem[] = [];
  const now = Date.now();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

      const metadata = parseStorageKey(key);
      if (!metadata || metadata.userId !== userId) continue;
      if (toolType && metadata.toolType !== toolType) continue;

      const itemStr = localStorage.getItem(key);
      if (!itemStr) continue;

      const item: TemporaryStorageItem = JSON.parse(itemStr);

      // Skip expired items
      if (item.expiresAt < now) {
        localStorage.removeItem(key);

        continue;
      }

      items.push(item);
    }

    // Sort by creation date (newest first)
    items.sort((a, b) => b.createdAt - a.createdAt);

    return items;
  } catch (error) {
    console.error("❌ Failed to get temporary data:", error);
    return [];
  }
};

/**
 * Get a specific temporary item by ID
 */
export const getTemporaryItemById = (
  userId: string,
  itemId: string
): TemporaryStorageItem | null => {
  const items = getTemporaryData(userId);
  return items.find((item) => item.id === itemId) || null;
};

/**
 * Delete a specific temporary item
 */
export const deleteTemporaryItem = (
  userId: string,
  itemId: string
): boolean => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

      const itemStr = localStorage.getItem(key);
      if (!itemStr) continue;

      const item: TemporaryStorageItem = JSON.parse(itemStr);
      if (item.userId === userId && item.id === itemId) {
        localStorage.removeItem(key);

        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("❌ Failed to delete temporary item:", error);
    return false;
  }
};

/**
 * Delete all temporary data for a user (called on logout)
 */
export const clearAllTemporaryData = (userId: string): number => {
  let deletedCount = 0;

  try {
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

      const metadata = parseStorageKey(key);
      if (metadata && metadata.userId === userId) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      localStorage.removeItem(key);
      deletedCount++;
    });

    return deletedCount;
  } catch (error) {
    console.error("❌ Failed to clear temporary data:", error);
    return deletedCount;
  }
};

