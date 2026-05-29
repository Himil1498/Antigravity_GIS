import React from "react";
import UsageTrendsChart from '../charts/UsageTrendsChart';
import type { UsageTrendsData, UsageTimeRange, UsageTotals } from '../../types/dashboardTypes';

interface UsageTrendsSectionProps {
  usageTrendsData: UsageTrendsData | null;
  usageTrendsLoading: boolean;
  usageTrendsError: string | null;
  selectedUsageTimeRange: UsageTimeRange;
  usageTotals: UsageTotals;
  onTimeRangeChange: (range: UsageTimeRange) => void;
  onRetry: () => void;
}

const UsageTrendsSection: React.FC<UsageTrendsSectionProps> = ({
  usageTrendsData,
  usageTrendsLoading,
  usageTrendsError,
  selectedUsageTimeRange,
  usageTotals,
  onTimeRangeChange,
  onRetry
}) => {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2.5">
          <div className="h-6 w-1 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
          <span 
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #22c55e, #059669)' }}
          >
            Usage Trends & Activity
          </span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
          Track feature creation and user activity patterns
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-5 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/20 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  Feature Creation Trends
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">
                  Activity over time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                {(["7d", "30d", "90d"] as UsageTimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => onTimeRangeChange(range)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                      selectedUsageTimeRange === range
                        ? "bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm border border-gray-200/50 dark:border-gray-500"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {range === "7d"
                      ? "7D"
                      : range === "30d"
                      ? "30D"
                      : "90D"}
                  </button>
                ))}
              </div>
              
              
              <button
                onClick={onRetry}
                title="Refresh Chart Data"
                className="h-8 pl-2 pr-3 flex items-center gap-1.5 justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 font-bold text-xs uppercase tracking-wider"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {usageTrendsLoading && !usageTrendsData ? (
          <div className="p-8 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ) : usageTrendsError ? (
          <div className="p-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Error loading trends
              </p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !usageTrendsData?.trends?.length ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No usage data available
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5 p-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-700/50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Total
                  </p>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {usageTotals.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Distance
                  </p>
                </div>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {usageTotals.distance.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Polygon
                  </p>
                </div>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {usageTotals.polygon.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Elevation
                  </p>
                </div>
                <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                  {usageTotals.elevation.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Circle
                  </p>
                </div>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 tracking-tight">
                  {usageTotals.circle.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Sector RF
                  </p>
                </div>
                <p className="text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                  {usageTotals.sector_rf.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6">
              <UsageTrendsChart data={usageTrendsData.trends} />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default UsageTrendsSection;

