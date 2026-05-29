/**
 * Centralized Overlay Registry
 *
 * Manages all map overlays in a single registry to prevent:
 * - Duplicate overlays
 * - Memory leaks
 * - Orphaned overlays
 *
 * Usage:
 *   overlayRegistry.register('distance-123', polyline);
 *   overlayRegistry.has('distance-123'); // true
 *   overlayRegistry.unregister('distance-123'); // removes and cleans up
 */

import { logger } from "./logger";

type OverlayKey = string;

class OverlayRegistry {
  private overlays: Map<OverlayKey, google.maps.MVCObject[]> = new Map();
  private metadata: Map<OverlayKey, OverlayMetadata> = new Map();

  /**
   * Register a new overlay
   * @param key - Unique identifier (e.g., 'distance-123', 'polygon-456')
   * @param overlay - Google Maps overlay object
   * @param metadata - Optional metadata for tracking
   */
  register(
    key: OverlayKey,
    overlay: google.maps.MVCObject,
    metadata?: Partial<OverlayMetadata>,
  ): void {
    if (!this.overlays.has(key)) {
      this.overlays.set(key, []);
    }

    const overlays = this.overlays.get(key)!;
    overlays.push(overlay);

    // Store metadata
    this.metadata.set(key, {
      type: metadata?.type || "unknown",
      itemId: metadata?.itemId,
      createdAt: Date.now(),
      source: metadata?.source || "unknown",
    });

    // console.log(`📍 [OverlayRegistry] Registered: ${key}`, {
    //   totalOverlays: overlays.length,
    //   metadata: this.metadata.get(key),
    // });
  }

  /**
   * Check if an overlay exists
   */
  has(key: OverlayKey): boolean {
    return this.overlays.has(key) && this.overlays.get(key)!.length > 0;
  }

  /**
   * Get overlays by key
   */
  get(key: OverlayKey): google.maps.MVCObject[] | undefined {
    return this.overlays.get(key);
  }

  /**
   * Get metadata for an overlay
   */
  getMetadata(key: OverlayKey): OverlayMetadata | undefined {
    return this.metadata.get(key);
  }

  /**
   * Unregister and cleanup overlays
   * @param key - Overlay key to remove
   */
  unregister(key: OverlayKey): void {
    const overlays = this.overlays.get(key);
    if (overlays) {
      overlays.forEach((overlay) => {
        try {
          if ("setMap" in overlay && typeof overlay.setMap === "function") {
            (overlay as any).setMap(null);
          }
        } catch (error) {
          logger.error(
            `❌ [OverlayRegistry] Error removing overlay ${key}:`,
            error,
          );
        }
      });

      this.overlays.delete(key);
      this.metadata.delete(key);

      logger.debug(`🗑️ [OverlayRegistry] Unregistered: ${key}`);
    }
  }

  /**
   * Unregister overlays by pattern (e.g., 'distance-*')
   */
  unregisterByPattern(pattern: RegExp): void {
    const keysToRemove: OverlayKey[] = [];

    this.overlays.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.unregister(key));

    logger.debug(
      `🗑️ [OverlayRegistry] Unregistered ${keysToRemove.length} overlays matching pattern: ${pattern}`,
    );
  }

  /**
   * Clear all overlays
   */
  clear(): void {
    const count = this.overlays.size;
    this.overlays.forEach((_, key) => this.unregister(key));
    logger.debug(`🗑️ [OverlayRegistry] Cleared all ${count} overlay groups`);
  }

  /**
   * Get statistics about registered overlays
   */
  getStats(): OverlayStats {
    const stats: OverlayStats = {
      totalGroups: this.overlays.size,
      totalOverlays: 0,
      byType: {},
      bySource: {},
      oldestOverlay: null,
      newestOverlay: null,
    };

    this.overlays.forEach((overlays, key) => {
      stats.totalOverlays += overlays.length;

      const meta = this.metadata.get(key);
      if (meta) {
        // Count by type
        stats.byType[meta.type] =
          (stats.byType[meta.type] || 0) + overlays.length;

        // Count by source
        stats.bySource[meta.source] =
          (stats.bySource[meta.source] || 0) + overlays.length;

        // Track oldest/newest
        if (
          !stats.oldestOverlay ||
          meta.createdAt < stats.oldestOverlay.createdAt
        ) {
          stats.oldestOverlay = { key, ...meta };
        }
        if (
          !stats.newestOverlay ||
          meta.createdAt > stats.newestOverlay.createdAt
        ) {
          stats.newestOverlay = { key, ...meta };
        }
      }
    });

    return stats;
  }

  /**
   * Debug: Log all registered overlays
   */
  debug(): void {
    logger.debug("🔍 [OverlayRegistry] Debug Info");
    logger.debug("Stats:", this.getStats());
    logger.debug("All Overlays:", Array.from(this.overlays.keys()));
    logger.debug("Metadata:", Array.from(this.metadata.entries()));
  }
}

// Types
interface OverlayMetadata {
  type: string;
  itemId?: number;
  createdAt: number;
  source: string;
}

interface OverlayStats {
  totalGroups: number;
  totalOverlays: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  oldestOverlay: (OverlayMetadata & { key: string }) | null;
  newestOverlay: (OverlayMetadata & { key: string }) | null;
}

// Export singleton instance
export const overlayRegistry = new OverlayRegistry();

// Export class for testing
export { OverlayRegistry };

// Export types
export type { OverlayKey, OverlayMetadata, OverlayStats };

