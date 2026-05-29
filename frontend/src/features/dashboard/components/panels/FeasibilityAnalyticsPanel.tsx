import React from "react";

interface FeasibilityStats {
  total_checks: number;
  successful: number;
  unfeasible: number;
  failure_reasons: Record<string, number>;
}

interface FeasibilityAnalyticsPanelProps {
  data: FeasibilityStats | null;
  loading: boolean;
  error: string | null;
}

const FeasibilityAnalyticsPanel: React.FC<FeasibilityAnalyticsPanelProps> = ({
  data,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-900 dark:text-white font-bold">Failed to load Feasibility Analytics</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error || 'No data available'}</p>
      </div>
    );
  }

  const successRate = data.total_checks > 0 
    ? Math.round((data.successful / data.total_checks) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-900/10 dark:to-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Auto-Feasibility Check</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">Success Rates & Diagnostics</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Main Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Checks</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{data.total_checks}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Success Rate</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{successRate}%</p>
          </div>
        </div>

        {/* Progress Bar representing Success vs Failed */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-emerald-600 dark:text-emerald-400">{data.successful} Successful</span>
            <span className="text-rose-600 dark:text-rose-400">{data.unfeasible} Unfeasible</span>
          </div>
          <div className="h-3 w-full bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Top Failure Reasons */}
        <div className="mt-auto">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Top Infeasibility Reasons
          </h4>
          <div className="space-y-3">
            {Object.entries(data.failure_reasons || {})
              .sort(([, a], [, b]) => b - a)
              .map(([reason, count]) => {
                const percentage = data.unfeasible > 0 ? Math.round((count / data.unfeasible) * 100) : 0;
                return (
                  <div key={reason} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-gray-900 dark:text-white">{count}</span>
                      <span className="text-xs font-bold text-gray-400 w-8 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
            })}
            {Object.keys(data.failure_reasons || {}).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No failures recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeasibilityAnalyticsPanel;
