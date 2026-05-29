import type { AuditEventType, AuditLogEntry, AuditLogFilter, AuditLogStats } from './types';
import { getAuditLogs, getFilteredAuditLogs } from './auditControlService';

/**
 * Get audit log statistics
 */
export const getAuditLogStats = (filter?: AuditLogFilter): AuditLogStats => {
  const logs = filter ? getFilteredAuditLogs(filter) : getAuditLogs();

  const eventsByType: Record<string, number> = {};
  const eventsByRegion: Record<string, number> = {};
  const eventsByUser: Record<string, number> = {};

  let successfulEvents = 0;
  let failedEvents = 0;

  logs.forEach(log => {
    // Count by type
    eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;

    // Count by region
    if (log.region) {
      eventsByRegion[log.region] = (eventsByRegion[log.region] || 0) + 1;
    }

    // Count by user
    const userKey = `${log.userName} (${log.userEmail})`;
    eventsByUser[userKey] = (eventsByUser[userKey] || 0) + 1;

    // Count success/failure
    if (log.success) {
      successfulEvents++;
    } else {
      failedEvents++;
    }
  });

  return {
    totalEvents: logs.length,
    successfulEvents,
    failedEvents,
    eventsByType: eventsByType as Record<AuditEventType, number>,
    eventsByRegion,
    eventsByUser,
    recentActivity: logs.slice(0, 50) // Last 50 events
  };
};

/**
 * Get recent failed access attempts for a region
 */
export const getRegionAccessDenials = (region?: string, limit: number = 20): AuditLogEntry[] => {
  const filter: AuditLogFilter = {
    eventType: 'REGION_ACCESS_DENIED',
    success: false
  };

  if (region) {
    filter.region = region;
  }

  const logs = getFilteredAuditLogs(filter);
  return logs.slice(0, limit);
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = (userId: string): {
  totalActions: number;
  regionsAccessed: string[];
  toolsUsed: string[];
  recentActivity: AuditLogEntry[];
} => {
  const logs = getFilteredAuditLogs({ userId });

  const regionsSet = new Set<string>();
  const toolsSet = new Set<string>();

  logs.forEach(log => {
    if (log.region) regionsSet.add(log.region);
    if (log.toolName) toolsSet.add(log.toolName);
  });

  return {
    totalActions: logs.length,
    regionsAccessed: Array.from(regionsSet),
    toolsUsed: Array.from(toolsSet),
    recentActivity: logs.slice(0, 20)
  };
};

