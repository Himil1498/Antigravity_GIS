/**
 * Analytics Service Constants
 * Storage keys and configuration limits
 */

export const STORAGE_KEYS = {
  TOOL_USAGE: "gis_tool_usage",
  USER_ACTIVITY: "gis_user_activity",
  REGIONAL_STATS: "gis_regional_stats",
  SYSTEM_HEALTH: "gis_system_health",
  ACTIVITY_LOG: "gis_activity_log",
} as const;

export const MAX_ACTIVITY_LOG_SIZE = 100;
export const MAX_HEALTH_HISTORY_SIZE = 48; // 24 hours with 30min interval

