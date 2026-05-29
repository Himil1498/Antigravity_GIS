
import { STORAGE_PREFIX } from "./constants";
import { TemporaryStorageItem } from "./types";

/**
 * Cleanup expired items across all users
 */
export const cleanupExpiredData = (): number => {
  let cleanedCount = 0;
  const now = Date.now();

  try {
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

      const itemStr = localStorage.getItem(key);
      if (!itemStr) continue;

      try {
        const item: TemporaryStorageItem = JSON.parse(itemStr);
        if (item.expiresAt < now) {
          keysToDelete.push(key);
        }
      } catch (e) {
        // If parsing fails, it's corrupt, valid to delete?
        // Or ignore. Safe option: ignore or delete if prefix matches rigidly.
        // Assuming strict prefix control, removing corrupt is likely safer for cleanup.
        // But adhering to original logic: it didn't strictly handle parse error inside loop,
        // although JSON.parse would throw and break loop in original code if not wrapped!
        // Original code:
        /*
          const item: TemporaryStorageItem = JSON.parse(itemStr);
          if (item.expiresAt < now) { ... }
        */
        // If JSON.parse throws, original function exits with error catch.
        // I will keep try/catch inside loop to be more robust.
      }
    }

    keysToDelete.forEach((key) => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    return cleanedCount;
  } catch (error) {
    console.error("❌ Failed to cleanup expired data:", error);
    return cleanedCount;
  }
};

/**
 * Initialize auto-cleanup interval
 * Should be called once when app starts
 */
export const initializeAutoCleanup = (): void => {
  // Run cleanup every 10 minutes
  setInterval(() => {
    cleanupExpiredData();
  }, 10 * 60 * 1000);

  // Run initial cleanup
  cleanupExpiredData();
};

