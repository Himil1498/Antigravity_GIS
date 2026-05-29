/**
 * Tool Usage Service
 * Tracks and analyzes tool usage patterns
 */

import type { ToolUsageStats, UserActivity, ToolUsageEntry } from "./types";
import { STORAGE_KEYS } from "./constants";
import { trackActivity } from "./activityService";

/**
 * Format tool name for display
 */
const formatToolName = (toolName: string): string => {
  return toolName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Track tool usage
 */
export const trackToolUsage = (data: {
  toolName: string;
  userId: string;
  userName: string;
  region?: string;
  duration?: number;
}): void => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.TOOL_USAGE);
    const toolUsage: { [key: string]: ToolUsageEntry } = storage
      ? JSON.parse(storage)
      : {};

    if (!toolUsage[data.toolName]) {
      toolUsage[data.toolName] = {
        count: 0,
        lastUsed: new Date().toISOString(),
        users: [],
        averageDuration: 0,
        sessions: [],
      };
    }

    const tool = toolUsage[data.toolName];
    tool.count++;
    tool.lastUsed = new Date().toISOString();

    if (!tool.users.includes(data.userId)) {
      tool.users.push(data.userId);
    }

    // Add session
    tool.sessions.push({
      timestamp: new Date().toISOString(),
      userId: data.userId,
      duration: data.duration || 0,
      region: data.region,
    });

    // Keep only last 50 sessions per tool
    if (tool.sessions.length > 50) {
      tool.sessions = tool.sessions.slice(-50);
    }

    // Calculate average duration
    const totalDuration = tool.sessions.reduce((sum, s) => sum + s.duration, 0);
    tool.averageDuration = totalDuration / tool.sessions.length / 60; // Convert to minutes

    localStorage.setItem(STORAGE_KEYS.TOOL_USAGE, JSON.stringify(toolUsage));

    // Also track in activity log
    trackActivity({
      userId: data.userId,
      userName: data.userName,
      action: "tool_used",
      tool: data.toolName,
      region: data.region,
      timestamp: new Date(),
      duration: data.duration,
      status: "success",
    });
  } catch (error) {
    console.error("Error tracking tool usage:", error);
  }
};

/**
 * Get tool usage statistics
 */
export const getToolUsageStats = (): ToolUsageStats[] => {
  try {
    const storage = localStorage.getItem(STORAGE_KEYS.TOOL_USAGE);
    if (!storage) return [];

    const toolUsage: { [key: string]: ToolUsageEntry } = JSON.parse(storage);

    return Object.entries(toolUsage).map(([toolName, data]) => {
      // Get popular regions
      const regionCounts: { [region: string]: number } = {};
      data.sessions.forEach((session) => {
        if (session.region) {
          regionCounts[session.region] = (regionCounts[session.region] || 0) + 1;
        }
      });

      const popularRegions = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([region]) => region);

      // Calculate trend
      const recentSessions = data.sessions.slice(-10);
      const olderSessions = data.sessions.slice(-20, -10);
      let trend: "up" | "down" | "stable" = "stable";
      let trendPercentage = 0;

      if (olderSessions.length > 0) {
        const recentAvg = recentSessions.length;
        const olderAvg = olderSessions.length;
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (change > 10) {
          trend = "up";
          trendPercentage = Math.round(change);
        } else if (change < -10) {
          trend = "down";
          trendPercentage = Math.round(Math.abs(change));
        }
      }

      return {
        toolName,
        displayName: formatToolName(toolName),
        totalUsage: data.count,
        averageDuration: Math.round(data.averageDuration * 10) / 10,
        lastUsed: new Date(data.lastUsed),
        popularRegions,
        userCount: data.users.length,
        trend,
        trendPercentage,
      };
    });
  } catch (error) {
    console.error("Error getting tool usage stats:", error);
    return [];
  }
};

