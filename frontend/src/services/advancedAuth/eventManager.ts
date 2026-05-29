/**
 * Advanced Auth Event Manager
 * Handles browser events and activity tracking
 */

import type { AuthSession } from "./types";
import { ACTIVITY_EVENTS, ACTIVITY_THROTTLE_DELAY } from "./constants";

export class EventManager {
  private activityThrottle: NodeJS.Timeout | null = null;

  /**
   * Setup browser event listeners
   */
  setupBrowserEventListeners(
    onBeforeUnload: (e: BeforeUnloadEvent) => void,
    onUnload: () => void,
    onVisibilityChange: () => void,
    onWindowFocus: () => void,
    onWindowBlur: () => void,
    onStorageChange: (e: StorageEvent) => void,
    onOnline: () => void,
    onOffline: () => void
  ): void {
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("unload", onUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("storage", onStorageChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
  }

  /**
   * Setup activity tracking
   */
  setupActivityTracking(updateActivityFn: () => void): void {
    const throttledUpdate = () => {
      if (this.activityThrottle) return;
      this.activityThrottle = setTimeout(() => {
        updateActivityFn();
        this.activityThrottle = null;
      }, ACTIVITY_THROTTLE_DELAY);
    };

    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
  }

  /**
   * Cleanup activity throttle
   */
  clearActivityThrottle(): void {
    if (this.activityThrottle) {
      clearTimeout(this.activityThrottle);
      this.activityThrottle = null;
    }
  }
}


