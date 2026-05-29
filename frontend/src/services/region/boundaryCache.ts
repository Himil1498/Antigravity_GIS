/**
 * Boundary Cache Service
 *
 * Caches boundary data in IndexedDB for:
 * - Offline access
 * - Faster load times
 * - Reduced API calls
 *
 * Cache Strategy:
 * - Cache valid for 24 hours
 * - Automatic invalidation on new data
 * - Version tracking
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { PublishedBoundary } from "./publicBoundaryService";

// Database schema
interface BoundaryCacheDB extends DBSchema {
  boundaries: {
    key: string;
    value: {
      data: PublishedBoundary[];
      timestamp: number;
      version: number;
      source: "api" | "static" | "merged";
    };
  };
  metadata: {
    key: string;
    value: {
      lastUpdate: number;
      totalBoundaries: number;
      cacheHits: number;
      cacheMisses: number;
    };
  };
}

const DB_NAME = "boundary-cache-v3-fresh";
const DB_VERSION = 9; // Bump to v9 to force refresh for "missing boundary" fix
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (More robust refetching)

class BoundaryCacheService {
  private db: IDBPDatabase<BoundaryCacheDB> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database
   */
  private async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      try {
        this.db = await openDB<BoundaryCacheDB>(DB_NAME, DB_VERSION, {
          upgrade(db, oldVersion) {
            // Version 9: Force clear old cache to remove "red triangle" / bad data
            if (oldVersion < 9) {
              if (db.objectStoreNames.contains("boundaries")) {
                db.deleteObjectStore("boundaries");
              }
              if (db.objectStoreNames.contains("metadata")) {
                db.deleteObjectStore("metadata");
              }
            }

            // Create object stores
            if (!db.objectStoreNames.contains("boundaries")) {
              db.createObjectStore("boundaries");
            }
            if (!db.objectStoreNames.contains("metadata")) {
              db.createObjectStore("metadata");
            }
          },
        });
        console.log("✅ [BoundaryCache] Database initialized");
      } catch (error) {
        console.error(
          "❌ [BoundaryCache] Failed to initialize database:",
          error,
        );
        throw error;
      }
    })();

    await this.initPromise;
  }

  /**
   * Set boundaries in cache
   */
  async set(
    boundaries: PublishedBoundary[],
    source: "api" | "static" | "merged" = "merged",
  ): Promise<void> {
    try {
      await this.init();
      if (!this.db) throw new Error("Database not initialized");

      const cacheData = {
        data: boundaries,
        timestamp: Date.now(),
        version: 1,
        source,
      };

      await this.db.put("boundaries", cacheData, "latest");

      // Update metadata
      const metadata = await this.getMetadata();
      await this.db.put(
        "metadata",
        {
          lastUpdate: Date.now(),
          totalBoundaries: boundaries.length,
          cacheHits: metadata.cacheHits,
          cacheMisses: metadata.cacheMisses,
        },
        "stats",
      );

      console.log(
        `✅ [BoundaryCache] Cached ${boundaries.length} boundaries (${source})`,
      );
    } catch (error) {
      console.error("❌ [BoundaryCache] Failed to set cache:", error);
    }
  }

  /**
   * Get boundaries from cache
   */
  async get(): Promise<PublishedBoundary[] | null> {
    try {
      await this.init();
      if (!this.db) return null;

      const cached = await this.db.get("boundaries", "latest");

      if (!cached) {
        console.log("⚠️ [BoundaryCache] Cache miss - no data");
        await this.incrementCacheMisses();
        return null;
      }

      const age = Date.now() - cached.timestamp;

      if (age > CACHE_DURATION) {
        // console.log(
        //   `⚠️ [BoundaryCache] Cache expired (${Math.round(
        //     age / 1000 / 60
        //   )} minutes old)`
        // );
        await this.incrementCacheMisses();
        return null;
      }

      // console.log(
      //   `✅ [BoundaryCache] Cache hit - ${cached.data.length} boundaries (${cached.source})`
      // );
      await this.incrementCacheHits();
      return cached.data;
    } catch (error) {
      console.error("❌ [BoundaryCache] Failed to get cache:", error);
      return null;
    }
  }

  /**
   * Check if cache is valid
   */
  async isValid(): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      const cached = await this.db.get("boundaries", "latest");
      if (!cached) return false;

      const age = Date.now() - cached.timestamp;
      return age <= CACHE_DURATION;
    } catch (error) {
      console.error(
        "❌ [BoundaryCache] Failed to check cache validity:",
        error,
      );
      return false;
    }
  }

  /**
   * Get cache age in milliseconds
   */
  async getAge(): Promise<number | null> {
    try {
      await this.init();
      if (!this.db) return null;

      const cached = await this.db.get("boundaries", "latest");
      if (!cached) return null;

      return Date.now() - cached.timestamp;
    } catch (error) {
      console.error("❌ [BoundaryCache] Failed to get cache age:", error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clear(): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      await this.db.delete("boundaries", "latest");
      console.log("🗑️ [BoundaryCache] Cache cleared");
    } catch (error) {
      console.error("❌ [BoundaryCache] Failed to clear cache:", error);
    }
  }

  /**
   * Get cache metadata
   */
  async getMetadata(): Promise<{
    lastUpdate: number;
    totalBoundaries: number;
    cacheHits: number;
    cacheMisses: number;
  }> {
    try {
      await this.init();
      if (!this.db) {
        return {
          lastUpdate: 0,
          totalBoundaries: 0,
          cacheHits: 0,
          cacheMisses: 0,
        };
      }

      const metadata = await this.db.get("metadata", "stats");
      return (
        metadata || {
          lastUpdate: 0,
          totalBoundaries: 0,
          cacheHits: 0,
          cacheMisses: 0,
        }
      );
    } catch (error) {
      console.error("❌ [BoundaryCache] Failed to get metadata:", error);
      return {
        lastUpdate: 0,
        totalBoundaries: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    isValid: boolean;
    age: number | null;
    ageFormatted: string;
    metadata: {
      lastUpdate: number;
      totalBoundaries: number;
      cacheHits: number;
      cacheMisses: number;
    };
    hitRate: number;
  }> {
    const isValid = await this.isValid();
    const age = await this.getAge();
    const metadata = await this.getMetadata();

    const totalRequests = metadata.cacheHits + metadata.cacheMisses;
    const hitRate =
      totalRequests > 0 ? (metadata.cacheHits / totalRequests) * 100 : 0;

    const ageFormatted = age
      ? age < 60000
        ? `${Math.round(age / 1000)}s`
        : age < 3600000
          ? `${Math.round(age / 60000)}m`
          : `${Math.round(age / 3600000)}h`
      : "N/A";

    return {
      isValid,
      age,
      ageFormatted,
      metadata,
      hitRate,
    };
  }

  /**
   * Increment cache hits
   */
  private async incrementCacheHits(): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      await this.db?.put(
        "metadata",
        {
          ...metadata,
          cacheHits: metadata.cacheHits + 1,
        },
        "stats",
      );
    } catch (error) {
      console.error(
        "❌ [BoundaryCache] Failed to increment cache hits:",
        error,
      );
    }
  }

  /**
   * Increment cache misses
   */
  private async incrementCacheMisses(): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      await this.db?.put(
        "metadata",
        {
          ...metadata,
          cacheMisses: metadata.cacheMisses + 1,
        },
        "stats",
      );
    } catch (error) {
      console.error(
        "❌ [BoundaryCache] Failed to increment cache misses:",
        error,
      );
    }
  }

  /**
   * Debug: Log cache information
   */
  async debug(): Promise<void> {
    const stats = await this.getStats();
    console.group("🔍 [BoundaryCache] Debug Info");
    console.log("Valid:", stats.isValid);
    console.log("Age:", stats.ageFormatted);
    console.log("Total Boundaries:", stats.metadata.totalBoundaries);
    console.log("Cache Hits:", stats.metadata.cacheHits);
    console.log("Cache Misses:", stats.metadata.cacheMisses);
    console.log("Hit Rate:", `${stats.hitRate.toFixed(2)}%`);
    console.groupEnd();
  }
}

// Export singleton instance
export const boundaryCache = new BoundaryCacheService();

// Export class for testing
export { BoundaryCacheService };
