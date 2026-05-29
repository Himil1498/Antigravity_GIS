/**
 * Log Details Status Banner Component
 * Displays success/failure status with severity badge and optional error message
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';


interface LogDetailsStatusBannerProps {
  log: AuditLogEntry;
}

const LogDetailsStatusBanner: React.FC<LogDetailsStatusBannerProps> = ({ log }) => {
  const isSuccess = log.status === 'SUCCESS' || (log.status === undefined && log.success);
  const isUnauthorized = log.status === 'UNAUTHORIZED';

  return (
    <div
      className={`rounded-xl p-3 border-2 ${
        isSuccess
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
          : isUnauthorized 
          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
          : "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700"
      }`}
    >
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <svg
            className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : isUnauthorized ? (
          <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-lg font-bold ${
                isSuccess
                  ? "text-emerald-700 dark:text-emerald-300"
                  : isUnauthorized
                  ? "text-orange-700 dark:text-orange-300"
                  : "text-rose-700 dark:text-rose-300"
              }`}
            >
              {isSuccess ? "Success" : isUnauthorized ? "Unauthorized" : (log.status || "Failed")}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {log.action}
          </p>
        </div>
      </div>
      {log.errorMessage && (
        <div className="mt-3 pt-3 border-t border-rose-300 dark:border-rose-700">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">
            Error Message:
          </p>
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {log.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogDetailsStatusBanner;

