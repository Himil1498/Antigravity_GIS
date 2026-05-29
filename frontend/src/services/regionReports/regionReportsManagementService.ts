
import { getAuditLogStats, exportAuditLogsCSV } from '../audit/index';
import { getTemporaryAccess, getTemporaryAccessStats } from '../temporaryAccess/index';
import { getRegionRequests, getRegionRequestStats } from '../regionRequest/index';
import {
  getRegionZones,
  getZoneAssignments,
  getZoneStats
} from '../regionHierarchy/index';
import {
  getAllRegionUsageStats,
  getUserRegionActivity,
  getAnalyticsSummary
} from '../regionAnalytics/index';

/**
 * Generate audit logs report calling audit service
 */
export const generateAuditLogsReport = (format: 'csv' | 'json' | 'xlsx'): string => {
  return format === 'json'
    ? JSON.stringify(getAuditLogStats(), null, 2)
    : exportAuditLogsCSV();
};

/**
 * Generate temporary access report
 */
export const generateTemporaryAccessReport = async (format: 'csv' | 'json' | 'xlsx'): Promise<string> => {
  const grants = await getTemporaryAccess();

  if (format === 'json') {
    return JSON.stringify(grants, null, 2);
  }

  // CSV format
  const headers = [
    'User Name',
    'Email',
    'Region',
    'Granted By',
    'Granted At',
    'Expires At',
    'Is Active',
    'Revoked At',
    'Revoked By',
    'Reason'
  ];

  const rows = grants.map(g => [
    g.userName,
    g.userEmail,
    g.region,
    g.grantedByName,
    new Date(g.grantedAt).toISOString(),
    new Date(g.expiresAt).toISOString(),
    g.isActive ? 'Yes' : 'No',
    g.revokedAt ? new Date(g.revokedAt).toISOString() : 'N/A',
    g.revokedByName || 'N/A',
    g.reason
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Generate region requests report
 */
export const generateRegionRequestsReport = async (format: 'csv' | 'json' | 'xlsx'): Promise<string> => {
  const requests = await getRegionRequests();

  if (format === 'json') {
    return JSON.stringify(requests, null, 2);
  }

  // CSV format
  const headers = [
    'User Name',
    'Email',
    'Role',
    'Requested Regions',
    'Reason',
    'Status',
    'Created At',
    'Reviewed By',
    'Reviewed At',
    'Review Notes'
  ];

  const rows = requests.map((r: any) => [
    r.userName,
    r.userEmail,
    r.userRole,
    r.requestedRegions.join('; '),
    r.reason,
    r.status,
    new Date(r.createdAt).toISOString(),
    r.reviewedByName || 'N/A',
    r.reviewedAt ? new Date(r.reviewedAt).toISOString() : 'N/A',
    r.reviewNotes || 'N/A'
  ]);

  return [
    headers.join(','),
    ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Generate zone assignments report
 */
export const generateZoneAssignmentsReport = (format: 'csv' | 'json' | 'xlsx'): string => {
  const zones = getRegionZones();
  const assignments = getZoneAssignments();

  const data = assignments.map(assignment => {
    const assignedZones = assignment.zoneIds
      .map((id: string) => zones.find(z => z.id === id))
      .filter((z: any) => z !== undefined);

    return {
      userName: assignment.userName,
      userEmail: assignment.userEmail,
      zones: assignedZones.map((z: any) => z!.name).join(', '),
      states: assignedZones.flatMap((z: any) => z!.states).join(', '),
      assignedBy: assignment.assignedByName,
      assignedAt: assignment.assignedAt
    };
  });

  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // CSV format
  const headers = ['User Name', 'Email', 'Assigned Zones', 'States', 'Assigned By', 'Assigned At'];

  const rows = data.map(d => [
    d.userName,
    d.userEmail,
    d.zones,
    d.states,
    d.assignedBy,
    new Date(d.assignedAt).toISOString()
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Generate comprehensive report (all data combined)
 */
export const generateComprehensiveReport = async (format: 'csv' | 'json' | 'xlsx'): Promise<string> => {
  const summary = getAnalyticsSummary();
  const auditStats = getAuditLogStats();
  const tempAccessStats = await getTemporaryAccessStats();
  const requestStats = await getRegionRequestStats();
  const zoneStats = getZoneStats();

  const tempGrants = await getTemporaryAccess();
  const regionRequests = await getRegionRequests();

  const comprehensiveData = {
    generatedAt: new Date().toISOString(),
    summary: {
      analytics: summary,
      auditLogs: {
        totalEvents: auditStats.totalEvents,
        successfulEvents: auditStats.successfulEvents,
        failedEvents: auditStats.failedEvents
      },
      temporaryAccess: tempAccessStats,
      regionRequests: requestStats,
      zoneManagement: zoneStats
    },
    regionUsage: getAllRegionUsageStats(),
    userActivity: getUserRegionActivity(),
    temporaryGrants: tempGrants,
    regionRequests: regionRequests,
    zoneAssignments: getZoneAssignments()
  };

  if (format === 'json') {
    return JSON.stringify(comprehensiveData, null, 2);
  }

  // For CSV, generate a summary section
  const lines = [
    '=== COMPREHENSIVE REGION MANAGEMENT REPORT ===',
    `Generated: ${new Date().toISOString()}`,
    '',
    '=== SUMMARY STATISTICS ===',
    `Total Regions Accessed: ${summary.totalRegionsAccessed}`,
    `Total Access Attempts: ${summary.totalAccessAttempts}`,
    `Successful Accesses: ${summary.totalSuccessfulAccesses}`,
    `Denied Accesses: ${summary.totalDeniedAccesses}`,
    `Overall Success Rate: ${summary.overallSuccessRate.toFixed(2)}%`,
    `Most Active Region: ${summary.mostActiveRegion}`,
    '',
    `Total Audit Events: ${auditStats.totalEvents}`,
    `Total Temporary Grants: ${tempAccessStats.totalGrants}`,
    `Active Temporary Grants: ${tempAccessStats.activeGrants}`,
    `Total Region Requests: ${requestStats.totalRequests}`,
    `Pending Requests: ${requestStats.pendingRequests}`,
    `Total Zones: ${zoneStats.totalZones}`,
    '',
    '=== For detailed data, please use JSON format ===',
    ''
  ];

  return lines.join('\n');
};

