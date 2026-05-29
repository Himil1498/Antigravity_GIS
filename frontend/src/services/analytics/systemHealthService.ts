/**
 * System Health Service
 * Monitors and tracks system health metrics
 */

import type { SystemHealth } from "./types";
import { STORAGE_KEYS, MAX_HEALTH_HISTORY_SIZE } from "./constants";
import { getRecentActivities } from "./activityService";

/**
 * Record system health snapshot
 */
export const recordSystemHealth = (health: SystemHealth): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.SYSTEM_HEALTH);
    const data: { history: any[] } = storage
      ? JSON.parse(storage)
      : { history: [] };

    data.history.push({
      timestamp: new Date().toISOString(),
      cpu: health.cpu,
      memory: health.memory,
      latency: health.latency,
    });

    // Keep only last MAX_HEALTH_HISTORY_SIZE entries
    if (data.history.length > MAX_HEALTH_HISTORY_SIZE) {
      data.history = data.history.slice(-MAX_HEALTH_HISTORY_SIZE);
    }

    localStorage.setItem(STORAGE_KEYS.SYSTEM_HEALTH, JSON.stringify(data));
  } catch (error) {
    console.error("Error recording system health:", error);
  }
};

/**
 * Get system health history
 */
export const getSystemHealthHistory = (): any[] => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.SYSTEM_HEALTH);
    if (!storage) return [];

    const data: { history: any[] } = JSON.parse(storage);
    return data.history.map((h) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    }));
  } catch (error) {
    console.error("Error getting system health history:", error);
    return [];
  }
};

/**
 * Get current system health
 */
export const getCurrentSystemHealth = async (): Promise<SystemHealth> => {
  try {
    // Measure API latency
    const start = performance.now();
    // In production, this would be a real API call
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
    const end = performance.now();
    const latency = Math.round(end - start);

    // Mock CPU and Memory (in production, this would come from backend)
    const cpu = Math.round(20 + Math.random() * 40);
    const memory = Math.round(40 + Math.random() * 30);

    // Get uptime from session start
    const sessionStart = sessionStorage.getItem("session_start");
    const uptime = sessionStart
      ? Math.round((Date.now() - parseInt(sessionStart)) / 1000)
      : 0;

    // Calculate error rate from recent activities
    const activities = getRecentActivities(100);
    const failedActivities = activities.filter((a) => a.status === "failed")
      .length;
    const errorRate =
      activities.length > 0
        ? Math.round((failedActivities / activities.length) * 100)
        : 0;

    // Determine API status
    let apiStatus: "healthy" | "degraded" | "down" = "healthy";
    if (latency > 500 || cpu > 80 || memory > 85) {
      apiStatus = "degraded";
    }
    if (latency > 2000 || cpu > 95 || memory > 95) {
      apiStatus = "down";
    }

    const health: SystemHealth = {
      cpu,
      memory,
      latency,
      uptime,
      errorRate,
      apiStatus,
    };

    // Record in history
    recordSystemHealth(health);

    return health;
  } catch (error) {
    console.error("Error getting system health:", error);
    return {
      cpu: 0,
      memory: 0,
      latency: 0,
      uptime: 0,
      errorRate: 0,
      apiStatus: "down",
    };
  }
};

