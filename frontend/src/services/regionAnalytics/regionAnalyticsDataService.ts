
import { getAuditLogs } from '../audit/index';
import { RegionUsageStats } from './types';

/**
 * Get usage statistics for all regions
 */
export const getAllRegionUsageStats = (): RegionUsageStats[] => {
  const logs = getAuditLogs();
  const regionLogs = logs.filter(
    log => log.eventType === 'REGION_ACCESS_GRANTED' || log.eventType === 'REGION_ACCESS_DENIED'
  );

  const regionMap = new Map<string, RegionUsageStats>();

  regionLogs.forEach(log => {
    if (!log.region) return;

    if (!regionMap.has(log.region)) {
      regionMap.set(log.region, {
        region: log.region,
        totalAccesses: 0,
        successfulAccesses: 0,
        deniedAccesses: 0,
        uniqueUsers: 0,
        toolsUsed: {},
        lastAccessed: undefined,
        mostActiveUser: undefined
      });
    }

    const stats = regionMap.get(log.region)!;
    stats.totalAccesses++;

    if (log.eventType === 'REGION_ACCESS_GRANTED') {
      stats.successfulAccesses++;
    } else {
      stats.deniedAccesses++;
    }

    if (log.toolName) {
      stats.toolsUsed[log.toolName] = (stats.toolsUsed[log.toolName] || 0) + 1;
    }

    if (!stats.lastAccessed || log.timestamp > stats.lastAccessed) {
      stats.lastAccessed = log.timestamp;
    }
  });

  // Calculate unique users and most active user per region
  regionMap.forEach((stats, region) => {
    const regionUserLogs = regionLogs.filter(log => log.region === region);
    const userAccessCount = new Map<string, { count: number; name: string }>();

    regionUserLogs.forEach(log => {
      const existing = userAccessCount.get(log.userId) || { count: 0, name: log.userName };
      existing.count++;
      userAccessCount.set(log.userId, existing);
    });

    stats.uniqueUsers = userAccessCount.size;

    // Find most active user
    let maxCount = 0;
    let mostActiveUserId = '';
    let mostActiveUserName = '';

    userAccessCount.forEach((data, userId) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        mostActiveUserId = userId;
        mostActiveUserName = data.name;
      }
    });

    if (mostActiveUserId) {
      stats.mostActiveUser = {
        userId: mostActiveUserId,
        userName: mostActiveUserName,
        accessCount: maxCount
      };
    }
  });

  return Array.from(regionMap.values()).sort((a, b) => b.totalAccesses - a.totalAccesses);
};

/**
 * Get usage stats for a specific region
 */
export const getRegionUsageStats = (region: string): RegionUsageStats | null => {
  const allStats = getAllRegionUsageStats();
  return allStats.find(stats => stats.region === region) || null;
};

/**
 * Get top accessed regions
 */
export const getTopAccessedRegions = (limit: number = 10): RegionUsageStats[] => {
  const stats = getAllRegionUsageStats();
  return stats.slice(0, limit);
};

/**
 * Get regions with most denials
 */
export const getTopDeniedRegions = (limit: number = 10): RegionUsageStats[] => {
  const stats = getAllRegionUsageStats();
  return stats
    .sort((a, b) => b.deniedAccesses - a.deniedAccesses)
    .slice(0, limit);
};

/**
 * Get access success rate by region
 */
export const getRegionAccessSuccessRate = (): Array<{
  region: string;
  successRate: number;
  totalAttempts: number;
}> => {
  const stats = getAllRegionUsageStats();

  return stats.map(s => ({
    region: s.region,
    successRate: s.totalAccesses > 0 ? (s.successfulAccesses / s.totalAccesses) * 100 : 0,
    totalAttempts: s.totalAccesses
  })).sort((a, b) => b.successRate - a.successRate);
};

/**
 * Get overall analytics summary
 */
export const getAnalyticsSummary = (): {
  totalRegionsAccessed: number;
  totalAccessAttempts: number;
  totalSuccessfulAccesses: number;
  totalDeniedAccesses: number;
  averageAccessesPerRegion: number;
  mostActiveRegion: string;
  leastActiveRegion: string;
  overallSuccessRate: number;
} => {
  const stats = getAllRegionUsageStats();

  if (stats.length === 0) {
    return {
      totalRegionsAccessed: 0,
      totalAccessAttempts: 0,
      totalSuccessfulAccesses: 0,
      totalDeniedAccesses: 0,
      averageAccessesPerRegion: 0,
      mostActiveRegion: 'N/A',
      leastActiveRegion: 'N/A',
      overallSuccessRate: 0
    };
  }

  const totalAccessAttempts = stats.reduce((sum, s) => sum + s.totalAccesses, 0);
  const totalSuccessfulAccesses = stats.reduce((sum, s) => sum + s.successfulAccesses, 0);
  const totalDeniedAccesses = stats.reduce((sum, s) => sum + s.deniedAccesses, 0);

  const mostActive = stats.reduce((max, s) => (s.totalAccesses > max.totalAccesses ? s : max));
  const leastActive = stats.reduce((min, s) => (s.totalAccesses < min.totalAccesses ? s : min));

  return {
    totalRegionsAccessed: stats.length,
    totalAccessAttempts,
    totalSuccessfulAccesses,
    totalDeniedAccesses,
    averageAccessesPerRegion: totalAccessAttempts / stats.length,
    mostActiveRegion: mostActive.region,
    leastActiveRegion: leastActive.region,
    overallSuccessRate: totalAccessAttempts > 0 ? (totalSuccessfulAccesses / totalAccessAttempts) * 100 : 0
  };
};

