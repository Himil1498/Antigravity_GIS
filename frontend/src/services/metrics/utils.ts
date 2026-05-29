
import { DashboardMetrics } from '../../types/dashboard/index';

/**
 * Get trend icon and color
 */
export const getTrendDisplay = (trend: 'up' | 'down' | 'stable'): {
  icon: string;
  color: string;
} => {
  switch (trend) {
    case 'up':
      return { icon: '↑', color: 'text-green-600' };
    case 'down':
      return { icon: '↓', color: 'text-red-600' };
    case 'stable':
      return { icon: '→', color: 'text-gray-600' };
  }
};

export const formatMetricsForExport = (metrics: DashboardMetrics): any => {
  return {
    summary: {
      activeUsers: metrics.activeUsers,
      inactiveUsers: metrics.inactiveUsers,
      totalUsers: metrics.activeUsers + metrics.inactiveUsers,
      loggedInCount: metrics.currentlyLoggedIn.length,
      toolUsageCount: Object.keys(metrics.toolUsage).length,
      regionCount: Object.keys(metrics.regionalActivity).length,
      systemStatus: metrics.systemHealth.apiStatus
    },
    toolUsage: Object.entries(metrics.toolUsage).map(([tool, usage]) => ({
      tool,
      usage
    })),
    regionalActivity: Object.entries(metrics.regionalActivity).map(([region, score]) => ({
      region,
      activityScore: score
    })),
    systemHealth: metrics.systemHealth,
    generatedAt: metrics.lastUpdated.toISOString()
  };
};


