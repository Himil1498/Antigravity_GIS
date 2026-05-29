/**
 * Analytics Service - Barrel Exports
 * Clean public API for analytics operations
 */

// Tool Usage
export { trackToolUsage, getToolUsageStats } from "./toolUsageService";

// User Activity
export { trackActivity, getRecentActivities } from "./activityService";

// Regional Analytics
export {
  trackRegionalActivity,
  getRegionalActivity,
} from "./regionalService";

// System Health
export {
  recordSystemHealth,
  getSystemHealthHistory,
  getCurrentSystemHealth,
} from "./systemHealthService";

// User Statistics
export { getUserStatistics } from "./userStatsService";

// Utilities
export {
  clearAnalyticsData,
  exportAnalyticsData,
  initializeAnalyticsSession,
} from "./utils";

// Types
export type { ToolUsageEntry } from "./types";

