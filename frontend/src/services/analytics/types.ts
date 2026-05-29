/**
 * Analytics Service Types
 * Type definitions for analytics data structures
 */

// Re-export dashboard types for convenience
export type {
  UserActivity,
  ToolUsageStats,
  RegionalActivity,
  SystemHealth,
  ActivityLogEntry,
  UserStatistics,
} from "../../types/dashboard/index";

export type { User } from "../../types/auth/index";

/**
 * Tool usage entry (internal storage format)
 */
export interface ToolUsageEntry {
  count: number;
  lastUsed: string;
  users: string[];
  averageDuration: number;
  sessions: {
    timestamp: string;
    userId: string;
    duration: number;
    region?: string;
  }[];
}



