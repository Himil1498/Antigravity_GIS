
import { getAuditLogs } from '../audit/index';
import { getAllRegionUsageStats } from './regionAnalyticsDataService';
import { RegionActivityTimeline, RegionHeatmapData } from './types';

/**
 * Get region activity timeline
 */
export const getRegionActivityTimeline = (
  daysBack: number = 30
): RegionActivityTimeline[] => {
  const logs = getAuditLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const regionLogs = logs.filter(
    log =>
      (log.eventType === 'REGION_ACCESS_GRANTED' ||
        log.eventType === 'REGION_ACCESS_DENIED') &&
      log.timestamp >= cutoffDate &&
      log.region
  );

  const timelineMap = new Map<string, RegionActivityTimeline>();

  regionLogs.forEach(log => {
    const dateKey = log.timestamp.toISOString().split('T')[0];
    const key = `${dateKey}_${log.region}`;

    if (!timelineMap.has(key)) {
      timelineMap.set(key, {
        date: dateKey,
        region: log.region!,
        accessCount: 0,
        denialCount: 0
      });
    }

    const timeline = timelineMap.get(key)!;

    if (log.eventType === 'REGION_ACCESS_GRANTED') {
      timeline.accessCount++;
    } else {
      timeline.denialCount++;
    }
  });

  return Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get region heatmap data
 */
export const getRegionHeatmapData = (): RegionHeatmapData[] => {
  const usageStats = getAllRegionUsageStats();

  if (usageStats.length === 0) {
    return [];
  }

  const maxAccesses = Math.max(...usageStats.map(s => s.successfulAccesses));

  return usageStats.map(stats => ({
    region: stats.region,
    intensity: maxAccesses > 0 ? Math.round((stats.successfulAccesses / maxAccesses) * 100) : 0,
    accessCount: stats.successfulAccesses,
    uniqueUsers: stats.uniqueUsers
  }));
};

