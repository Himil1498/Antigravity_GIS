/**
 * Regional Service
 * Tracks and analyzes regional activity
 */

import type { RegionalActivity } from "./types";
import { STORAGE_KEYS } from "./constants";
import { getToolUsageStats } from "./toolUsageService";

/**
 * Track regional activity
 */
export const trackRegionalActivity = (region: string): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.REGIONAL_STATS);
    const regionalStats: {
      [region: string]: { visits: number; lastVisit: string };
    } = storage ? JSON.parse(storage) : {};

    if (!regionalStats[region]) {
      regionalStats[region] = {
        visits: 0,
        lastVisit: new Date().toISOString(),
      };
    }

    regionalStats[region].visits++;
    regionalStats[region].lastVisit = new Date().toISOString();

    localStorage.setItem(
      STORAGE_KEYS.REGIONAL_STATS,
      JSON.stringify(regionalStats)
    );
  } catch (error) {
    console.error("Error tracking regional activity:", error);
  }
};

/**
 * Get regional activity statistics
 */
export const getRegionalActivity = (): RegionalActivity[] => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.REGIONAL_STATS);
    if (!storage) return [];

    const regionalStats: {
      [region: string]: { visits: number; lastVisit: string };
    } = JSON.parse(storage);
    const toolUsage = getToolUsageStats();

    return Object.entries(regionalStats).map(([regionName, data]) => {
      // Calculate activity score based on visits and recency
      const daysSinceLastVisit =
        (Date.now() - new Date(data.lastVisit).getTime()) /
        (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - daysSinceLastVisit * 10);
      const visitScore = Math.min(100, data.visits * 5);
      const activityScore = Math.round((recencyScore + visitScore) / 2);

      // Get top tools used in this region
      const topTools = toolUsage
        .filter((tool) => tool.popularRegions.includes(regionName))
        .sort((a, b) => b.totalUsage - a.totalUsage)
        .slice(0, 3)
        .map((tool) => tool.toolName);

      return {
        regionName,
        activeUsers: 0, // Will be calculated from user data
        toolUsage: data.visits,
        lastActivity: new Date(data.lastVisit),
        assignedUsers: 0, // Will be fetched from user assignments
        activityScore,
        topTools,
      };
    });
  } catch (error) {
    console.error("Error getting regional activity:", error);
    return [];
  }
};

