/**
 * Region Reports Export Header Component - Enhanced
 * Displays the header with title, description, total reports count, and date
 */

import React from 'react';

const RegionReportsExportHeader: React.FC = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gradient-to-br from-cyan-50/50 to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 rounded-xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/30 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 dark:from-cyan-400 dark:to-cyan-600 bg-clip-text text-transparent">
              Export Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
              Generate and download comprehensive reports — users, regions, access logs, network data, and more
            </p>
          </div>
        </div>

        {/* Date + Stats */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formattedDate}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">8 Reports • CSV / XLSX / JSON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionReportsExportHeader;
