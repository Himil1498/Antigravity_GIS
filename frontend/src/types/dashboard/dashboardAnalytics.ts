
import { User } from '../auth/index';
import { SystemHealth } from './dashboardSystem';

// ============================================================================
// Main Dashboard Metrics
// ============================================================================

export interface DashboardMetrics {
  activeUsers: number;
  inactiveUsers: number;
  currentlyLoggedIn: User[];
  toolUsage: { [toolName: string]: number };
  regionalActivity: { [region: string]: number };
  systemHealth: SystemHealth;
  lastUpdated: Date;
}

// ============================================================================
// Tool Usage Statistics
// ============================================================================

export interface ToolUsageStats {
  toolName: string;
  displayName: string;
  totalUsage: number;
  averageDuration: number;  // Minutes
  lastUsed: Date;
  popularRegions: string[];
  userCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface ToolAnalytics {
  totalTools: number;
  activeTools: number;
  totalUsage: number;
  mostUsedTool: string;
  leastUsedTool: string;
  usageByTool: ToolUsageStats[];
  usageByTime: {
    hour: number;
    count: number;
  }[];
}

// ============================================================================
// Regional Activity
// ============================================================================

export interface RegionalActivity {
  regionName: string;
  activeUsers: number;
  toolUsage: number;
  lastActivity: Date;
  assignedUsers: number;
  activityScore: number;  // 0-100
  topTools: string[];
}

export interface RegionalAnalytics {
  totalRegions: number;
  activeRegions: number;
  totalActivity: number;
  mostActiveRegion: string;
  leastActiveRegion: string;
  activityByRegion: RegionalActivity[];
  coveragePercentage: number;
}

// ============================================================================
// User Statistics
// ============================================================================

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  loggedIn: User[];
  newThisWeek: number;
  currentlyOnline?: number; // Optional: real-time count from backend
  trend: {
    daily: number[];
    weekly?: number[];
    monthly?: number[];
  };
}

