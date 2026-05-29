
import {
  DashboardMetrics,
  ToolAnalytics,
  RegionalAnalytics,
  SystemPerformance
} from '../../types/dashboard/index';
import { User } from '../../types/auth/index';
import {
  getToolUsageStats,
  getRegionalActivity,
  getCurrentSystemHealth,
  getUserStatistics,
  getSystemHealthHistory
} from '../analytics/index';

export const getDashboardMetrics = async (users: User[]): Promise<DashboardMetrics> => {
  try {
    const userStats = getUserStatistics(users);
    const toolStats = getToolUsageStats();
    const regionalStats = getRegionalActivity();
    const systemHealth = await getCurrentSystemHealth();

    // Build tool usage map
    const toolUsage: { [toolName: string]: number } = {};
    toolStats.forEach((tool: any) => {
      toolUsage[tool.toolName] = tool.totalUsage;
    });

    // Build regional activity map
    const regionalActivity: { [region: string]: number } = {};
    regionalStats.forEach((region: any) => {
      regionalActivity[region.regionName] = region.activityScore;
    });

    return {
      activeUsers: userStats.active,
      inactiveUsers: userStats.inactive,
      currentlyLoggedIn: userStats.loggedIn,
      toolUsage,
      regionalActivity,
      systemHealth,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    throw error;
  }
};

export const getToolAnalytics = (): ToolAnalytics => {
  try {
    const toolStats = getToolUsageStats();

    if (toolStats.length === 0) {
      return {
        totalTools: 0,
        activeTools: 0,
        totalUsage: 0,
        mostUsedTool: 'None',
        leastUsedTool: 'None',
        usageByTool: [],
        usageByTime: []
      };
    }

    const totalUsage = toolStats.reduce((sum: number, tool: any) => sum + tool.totalUsage, 0);
    const activeTools = toolStats.filter((tool: any) => tool.totalUsage > 0).length;

    const sortedByUsage = [...toolStats].sort((a, b) => b.totalUsage - a.totalUsage);
    const mostUsedTool = sortedByUsage[0]?.displayName || 'None';
    const leastUsedTool = sortedByUsage[sortedByUsage.length - 1]?.displayName || 'None';

    // Mock usage by time (in production, would be calculated from actual timestamps)
    const usageByTime = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 20) + 5
    }));

    return {
      totalTools: toolStats.length,
      activeTools,
      totalUsage,
      mostUsedTool,
      leastUsedTool,
      usageByTool: toolStats,
      usageByTime
    };
  } catch (error) {
    console.error('Error getting tool analytics:', error);
    return {
      totalTools: 0,
      activeTools: 0,
      totalUsage: 0,
      mostUsedTool: 'None',
      leastUsedTool: 'None',
      usageByTool: [],
      usageByTime: []
    };
  }
};

export const getRegionalAnalytics = (): RegionalAnalytics => {
  try {
    const regionalStats = getRegionalActivity();

    if (regionalStats.length === 0) {
      return {
        totalRegions: 0,
        activeRegions: 0,
        totalActivity: 0,
        mostActiveRegion: 'None',
        leastActiveRegion: 'None',
        activityByRegion: [],
        coveragePercentage: 0
      };
    }

    const activeRegions = regionalStats.filter((region: any) => region.activityScore > 50).length;
    const totalActivity = regionalStats.reduce((sum: number, region: any) => sum + region.toolUsage, 0);

    const sortedByActivity = [...regionalStats].sort((a, b) => b.activityScore - a.activityScore);
    const mostActiveRegion = sortedByActivity[0]?.regionName || 'None';
    const leastActiveRegion = sortedByActivity[sortedByActivity.length - 1]?.regionName || 'None';

    const coveragePercentage = Math.round((activeRegions / regionalStats.length) * 100);

    return {
      totalRegions: regionalStats.length,
      activeRegions,
      totalActivity,
      mostActiveRegion,
      leastActiveRegion,
      activityByRegion: regionalStats,
      coveragePercentage
    };
  } catch (error) {
    console.error('Error getting regional analytics:', error);
    return {
      totalRegions: 0,
      activeRegions: 0,
      totalActivity: 0,
      mostActiveRegion: 'None',
      leastActiveRegion: 'None',
      activityByRegion: [],
      coveragePercentage: 0
    };
  }
};

export const getSystemPerformance = async (): Promise<SystemPerformance> => {
  try {
    const health = await getCurrentSystemHealth();
    const history = getSystemHealthHistory();

    // Generate alerts based on thresholds
    const alerts = [];

    if (health.cpu > 80) {
      alerts.push({
        id: `cpu-${Date.now()}`,
        type: 'cpu' as const,
        severity: health.cpu > 90 ? ('critical' as const) : ('high' as const),
        message: `High CPU usage detected: ${health.cpu}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (health.memory > 85) {
      alerts.push({
        id: `memory-${Date.now()}`,
        type: 'memory' as const,
        severity: health.memory > 95 ? ('critical' as const) : ('high' as const),
        message: `High memory usage detected: ${health.memory}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (health.latency > 500) {
      alerts.push({
        id: `latency-${Date.now()}`,
        type: 'latency' as const,
        severity: health.latency > 1000 ? ('critical' as const) : ('medium' as const),
        message: `High API latency detected: ${health.latency}ms`,
        timestamp: new Date(),
        resolved: false
      });
    }

    return {
      health,
      history,
      alerts,
      uptime: health.uptime,
      downtimeEvents: [] // Would be tracked in production
    };
  } catch (error) {
    console.error('Error getting system performance:', error);
    throw error;
  }
};



