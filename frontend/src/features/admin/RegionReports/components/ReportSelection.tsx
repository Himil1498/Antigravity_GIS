/**
 * Report Selection Component - Enhanced
 * Displays report types grouped by category with icons, descriptions, and column counts
 */

import React from 'react';
import type { ReportType } from '../index';

interface ReportOption {
  type: ReportType;
  name: string;
  description: string;
  icon?: string;
  columns?: number;
  category?: string;
}

interface ReportSelectionProps {
  availableReports: ReportOption[];
  selectedReport: ReportType;
  onReportChange: (type: ReportType) => void;
}

const ReportSelection: React.FC<ReportSelectionProps> = ({
  availableReports,
  selectedReport,
  onReportChange
}) => {
  // Group reports by category
  const categories = availableReports.reduce((acc, report) => {
    const cat = report.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(report);
    return acc;
  }, {} as Record<string, ReportOption[]>);

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Overview': { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    'Users': { bg: 'from-violet-500 to-violet-600', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
    'Regions': { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    'Access': { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    'Security': { bg: 'from-rose-500 to-rose-600', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    'Network': { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
    'General': { bg: 'from-gray-500 to-gray-600', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl shadow-lg border-2 border-indigo-100 dark:border-indigo-900/30 p-6">
      <div className="flex items-center mb-5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent">
            Select Report Type
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {availableReports.length} reports available • Select one to preview and export
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(categories).map(([category, reports]) => {
          const colors = categoryColors[category] || categoryColors['General'];
          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${colors.bg}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                  {category}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
              </div>

              {/* Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reports.map(report => {
                  const isSelected = selectedReport === report.type;
                  return (
                    <label
                      key={report.type}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-300 dark:ring-blue-700'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={report.type}
                        checked={isSelected}
                        onChange={e => onReportChange(e.target.value as ReportType)}
                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {report.icon && <span className="text-base">{report.icon}</span>}
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {report.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {report.description}
                        </p>
                        {report.columns && (
                          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                            </svg>
                            {report.columns} columns
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportSelection;
