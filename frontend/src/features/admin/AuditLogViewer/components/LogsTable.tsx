/**
 * Logs Table Component
 * Renders the audit logs table with all rows
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';
import { EventCategoryMap, getEventLabel } from '../../../../types/audit.types';

interface LogsTableProps {
  logs: AuditLogEntry[];
  onViewDetails: (log: AuditLogEntry) => void;
  onDeleteLog: (logId: string) => void;
}

const getCategoryColor = (eventType: string) => {
  const category = EventCategoryMap[eventType as keyof typeof EventCategoryMap];
  switch (category) {
    case 'Access & Security': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Data Operations': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Network & GIS Activity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Administration': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

/** Converts raw action strings like "CREATE_ELEVATION_PROFILE" into "Created Elevation Profile" */
const formatAction = (action: string): string => {
  if (!action) return "—";
  // If the action is already human-readable (contains spaces and lowercase), return as-is
  if (/[a-z]/.test(action) && action.includes(" ")) return action;
  // Otherwise, format it
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

const LogsTable: React.FC<LogsTableProps> = ({ logs, onViewDetails, onDeleteLog }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
          <tr>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Category / Event
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Action
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-4 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onViewDetails(log)}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-150 border-b border-blue-100 dark:border-blue-900/20 cursor-pointer"
            >
              <td className="px-4 py-4 text-sm text-center text-gray-800 dark:text-gray-200 font-medium">
                #{log.id}
              </td>
              <td className="px-4 py-4 text-sm text-center text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900 dark:text-white font-bold">{log.userName}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">{log.userRole}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="inline-flex flex-col items-center gap-1">
                  <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getCategoryColor(log.eventType)}`}>
                    {EventCategoryMap[log.eventType as keyof typeof EventCategoryMap] || "Other"}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {getEventLabel(log.eventType)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-center text-gray-800 dark:text-gray-200 max-w-[280px] truncate" title={log.action}>
                {formatAction(log.action)}
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg ${
                  log.status === 'SUCCESS' || (log.status === undefined && log.success) 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : log.status === 'UNAUTHORIZED' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {log.status === 'SUCCESS' || (log.status === undefined && log.success) ? (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Success
                    </>
                  ) : log.status === 'UNAUTHORIZED' ? (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Unauthorized
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {log.status || 'Failed'}
                    </>
                  )}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-center">
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(log); }}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-xs"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-xs"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
