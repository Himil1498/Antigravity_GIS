import React from "react";
import PerformanceChart from '../charts/PerformanceChart';
import { calculateSuccessRate } from '../../utils/dashboardHelpers';
import type { PerformanceData, TimeRange, PerfChartDataPoint } from '../../types/dashboardTypes';

interface PerformanceSectionProps {
  performanceData: PerformanceData | null;
  performanceLoading: boolean;
  performanceError: string | null;
  selectedPerfTimeRange: TimeRange;
  perfChartData: PerfChartDataPoint[];
  onTimeRangeChange: (range: TimeRange) => void;
  onRetry: () => void;
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  performanceData,
  performanceLoading,
  performanceError,
  selectedPerfTimeRange,
  perfChartData,
  onTimeRangeChange,
  onRetry
}) => {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2.5">
          <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <span 
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
          >
            API Performance Monitoring
          </span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
          Track API latency, request volume, and success rates
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">API Latency Metrics</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">Response times and throughput</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                {(["1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => onTimeRangeChange(range)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                      selectedPerfTimeRange === range
                        ? "bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-500"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={onRetry}
                title="Refresh Chart Data"
                className="h-8 w-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>

        {performanceLoading && !performanceData ? (
          <div className="p-8 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ) : performanceError ? (
          <div className="p-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-2">Error loading data</p>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">{performanceError}</p>
              <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">Retry</button>
            </div>
          </div>
        ) : !performanceData?.latencyOverTime?.length ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No data available</p>
          </div>
        ) : (
          <>
            {performanceData.overall && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-700/50">
                {/* Total Requests Card */}
                <div className="group bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 rounded-2xl p-5 border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
                    <p className="text-[11px] font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-widest">
                      Total Requests
                    </p>
                  </div>
                  <p className="text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {performanceData.overall.total_requests.toLocaleString()}
                  </p>
                </div>

                {/* Avg Latency Card */}
                <div className="group bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl p-5 border border-blue-100/50 dark:border-blue-800/30 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                    <p className="text-[11px] font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-widest">
                      Avg Latency
                    </p>
                  </div>
                  <p className="text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {(performanceData.overall.avg_latency || 0).toFixed(0)}<span className="text-lg font-bold opacity-75">ms</span>
                  </p>
                </div>

                {/* Success Rate Card */}
                <div className="group bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 rounded-2xl p-5 border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                    <p className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest">
                      Success Rate
                    </p>
                  </div>
                  <p className="text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {calculateSuccessRate(performanceData)}<span className="text-lg font-bold opacity-75">%</span>
                  </p>
                </div>

                {/* Failed Card */}
                <div className="group bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-gray-800 rounded-2xl p-5 border border-rose-100/50 dark:border-rose-800/30 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                    <p className="text-[11px] font-bold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-widest">
                      Failed
                    </p>
                  </div>
                  <p className="text-3xl font-black text-rose-950 dark:text-rose-100 tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {performanceData.overall.failed_requests.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6">
              <PerformanceChart
                data={perfChartData}
                timeRange={selectedPerfTimeRange}
              />
            </div>

            {performanceData.topEndpoints?.length > 0 && (
              <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Top Endpoints
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                          Endpoint
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                          Requests
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                          Avg Latency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {performanceData.topEndpoints
                        .slice(0, 5)
                        .map((endpoint, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium truncate max-w-xs">
                              {endpoint.endpoint}
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">
                              {endpoint.request_count.toLocaleString()}
                            </td>
                            <td className="px-5 py-4 text-sm text-blue-600 dark:text-blue-400 text-right font-bold">
                              {parseFloat(endpoint.avg_latency).toFixed(1)}ms
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PerformanceSection;

