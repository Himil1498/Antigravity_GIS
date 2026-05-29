/**
 * Utility functions for AuditLogViewer
 */

import type { AuditSeverity } from '../../../types/audit.types';

export const getSeverityColor = (severity: AuditSeverity): string => {
  switch (severity) {
    case 'info':
      return 'text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-300 dark:border-blue-700 shadow-sm';
    case 'warning':
      return 'text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border border-amber-300 dark:border-amber-700 shadow-sm';
    case 'error':
      return 'text-red-700 dark:text-red-300 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 border border-red-300 dark:border-red-700 shadow-sm';
    case 'critical':
      return 'text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border border-purple-300 dark:border-purple-700 shadow-sm';
    default:
      return 'text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 border border-gray-300 dark:border-gray-700 shadow-sm';
  }
};

export const getSuccessColor = (success: boolean): string => {
  return success
    ? 'text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 border border-emerald-300 dark:border-emerald-700 shadow-sm'
    : 'text-rose-700 dark:text-rose-300 bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 border border-rose-300 dark:border-rose-700 shadow-sm';
};

export const exportToCSV = (logs: any[]) => {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Success'];
  const rows = logs.map((log) => [
    log.timestamp.toISOString(),
    log.userName,
    log.action,
    log.region || '-',
    log.severity,
    log.success ? 'Yes' : 'No'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

