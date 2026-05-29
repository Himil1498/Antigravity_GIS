/**
 * Log Details User Info Component
 * Displays user information with avatar, name, email, and role
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';

interface LogDetailsUserInfoProps {
  log: AuditLogEntry;
}

const LogDetailsUserInfo: React.FC<LogDetailsUserInfoProps> = ({ log }) => {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-xl p-4 border-2 border-violet-200 dark:border-violet-700">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-2">
            User Information
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {log.userName}
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                ({log.userId})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-violet-500 dark:text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {log.userEmail || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-violet-500 dark:text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="px-2 py-1 bg-violet-200 dark:bg-violet-700 text-violet-800 dark:text-violet-200 rounded-md font-semibold text-xs">
                  {log.userRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsUserInfo;

