import type { AuditLogFilter } from './types';
import { getAuditLogs, getFilteredAuditLogs } from './auditControlService';

/**
 * Export audit logs to JSON
 */
export const exportAuditLogs = (filter?: AuditLogFilter): string => {
  const logs = filter ? getFilteredAuditLogs(filter) : getAuditLogs();
  return JSON.stringify(logs, null, 2);
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogsCSV = (filter?: AuditLogFilter): string => {
  const logs = filter ? getFilteredAuditLogs(filter) : getAuditLogs();

  // CSV headers
  const headers = [
    'Timestamp',
    'User Name',
    'User Email',
    'User Role',
    'Event Type',
    'Severity',
    'Region',
    'Tool Name',
    'Action',
    'Success',
    'Error Message'
  ];

  // CSV rows
  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.userName,
    log.userEmail,
    log.userRole,
    log.eventType,
    log.severity,
    log.region || '',
    log.toolName || '',
    log.action,
    log.success ? 'Yes' : 'No',
    log.errorMessage || ''
  ]);

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

