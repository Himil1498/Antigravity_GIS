/**
 * Quick Export Buttons Component - Enhanced
 * Provides quick one-click export buttons for all report types
 */

import React from 'react';
import type { ReportType } from '../index';

interface QuickExportButtonsProps {
  onQuickExport: (reportType: ReportType, format: 'csv' | 'json' | 'xlsx') => void;
}

const quickExports: Array<{
  label: string;
  report: ReportType;
  format: 'csv' | 'json' | 'xlsx';
  icon: string;
  gradient: string;
}> = [
  { label: 'Comprehensive (XLSX)', report: 'comprehensive', format: 'xlsx', icon: '📊', gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
  { label: 'User Activity (XLSX)', report: 'user_activity', format: 'xlsx', icon: '👥', gradient: 'from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700' },
  { label: 'Region Usage (XLSX)', report: 'region_usage', format: 'xlsx', icon: '🗺️', gradient: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' },
  { label: 'Zone Assignments (XLSX)', report: 'zone_assignments', format: 'xlsx', icon: '📌', gradient: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' },
  { label: 'Region Requests (XLSX)', report: 'region_requests', format: 'xlsx', icon: '📋', gradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' },
  { label: 'Audit Logs (CSV)', report: 'audit_logs', format: 'csv', icon: '📝', gradient: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700' },
  { label: 'Access Denials (CSV)', report: 'access_denials', format: 'csv', icon: '🚫', gradient: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' },
  { label: 'Network Data (XLSX)', report: 'network_data', format: 'xlsx', icon: '🌐', gradient: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700' },
];

const QuickExportButtons: React.FC<QuickExportButtonsProps> = ({ onQuickExport }) => {
  return (
    <div className="bg-gradient-to-br from-violet-50/50 to-violet-50 dark:from-gray-800 dark:to-violet-900/20 rounded-xl shadow-lg border-2 border-violet-100 dark:border-violet-900/30 p-6">
      <div className="flex items-center mb-5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mr-3 shadow-md">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent">
            Quick Export
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            One-click download with recommended format
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickExports.map((item) => (
          <button
            key={`${item.report}-${item.format}`}
            onClick={() => onQuickExport(item.report, item.format)}
            className={`inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r ${item.gradient} text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold`}
          >
            <span className="mr-2 text-base">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickExportButtons;
