/**
 * Analytics Utilities
 * Helper functions and maintenance utilities
 */

import { STORAGE_KEYS } from "./constants";
import { getToolUsageStats } from "./toolUsageService";
import { getRecentActivities } from "./activityService";
import { getRegionalActivity } from "./regionalService";
import { getSystemHealthHistory } from "./systemHealthService";

/**
 * Clear all analytics data
 */
export const clearAnalyticsData = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

/**
 * Export all analytics data
 */
export const exportAnalyticsData = (): any => {
  return {
    toolUsage: getToolUsageStats(),
    recentActivities: getRecentActivities(100),
    regionalActivity: getRegionalActivity(),
    systemHealthHistory: getSystemHealthHistory(),
    exportedAt: new Date().toISOString(),
  };
};

/**
 * Initialize analytics session
 */
export const initializeAnalyticsSession = (): void => {
  if (!sessionStorage.getItem("session_start")) {
    sessionStorage.setItem("session_start", Date.now().toString());
  }
};

