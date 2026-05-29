/**
 * Activity Service
 * Tracks and retrieves user activity logs
 */

import type { UserActivity } from "./types";
import { STORAGE_KEYS, MAX_ACTIVITY_LOG_SIZE } from "./constants";

/**
 * Track user activity
 */
export const trackActivity = (activity: UserActivity): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY);
    const activities: UserActivity[] = storage ? JSON.parse(storage) : [];

    activities.push({
      ...activity,
      timestamp: new Date(activity.timestamp),
    });

    // Keep only last MAX_ACTIVITY_LOG_SIZE activities
    const recentActivities = activities.slice(-MAX_ACTIVITY_LOG_SIZE);

    localStorage.setItem(
      STORAGE_KEYS.USER_ACTIVITY,
      JSON.stringify(recentActivities)
    );
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
};

/**
 * Get recent activities
 */
export const getRecentActivities = (limit: number = 20): UserActivity[] => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY);
    if (!storage) return [];

    const activities: UserActivity[] = JSON.parse(storage);
    return activities
      .map((a) => ({ ...a, timestamp: new Date(a.timestamp) }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return [];
  }
};

