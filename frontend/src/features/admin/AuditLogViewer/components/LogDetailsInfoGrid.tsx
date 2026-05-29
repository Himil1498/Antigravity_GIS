/**
 * Log Details Info Grid Component
 * Displays timestamp, event type, region, and tool information in a grid layout
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';

interface LogDetailsInfoGridProps {
  log: AuditLogEntry;
}

const LogDetailsInfoGrid: React.FC<LogDetailsInfoGridProps> = ({ log }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Timestamp */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="h-5 w-5 text-cyan-500 dark:text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Timestamp
          </h4>
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {log.timestamp.toLocaleString()}
        </p>
      </div>

      {/* Event Type */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="h-5 w-5 text-purple-500 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Event Type
          </h4>
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {log.eventType}
        </p>
      </div>

      {/* Region */}
      {log.region && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="h-5 w-5 text-amber-500 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Region
            </h4>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {log.region}
          </p>
        </div>
      )}

      {/* Tool */}
      {log.toolName && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="h-5 w-5 text-blue-500 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Tool
            </h4>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {log.toolName}
          </p>
        </div>
      )}

      {/* Connection & Network Details */}
      {(log.ipAddress || log.session_id || log.user_agent) && (
        <div className="md:col-span-2 mt-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">
              Network & Session Insights
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {log.ipAddress && (
              <div>
                <p className="text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">IP Address</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={log.ipAddress}>{log.ipAddress}</p>
              </div>
            )}
            {log.session_id && (
              <div>
                <p className="text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">Session ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white truncate" title={log.session_id}>{log.session_id}</p>
              </div>
            )}
            {log.user_agent && (
              <div className="md:col-span-2 lg:col-span-1">
                <p className="text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">User Agent / Device</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={log.user_agent}>{log.user_agent}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogDetailsInfoGrid;

