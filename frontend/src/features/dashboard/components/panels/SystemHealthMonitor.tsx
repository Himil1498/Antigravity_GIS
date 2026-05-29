import React, { useEffect, useState } from 'react';
import { SystemHealth } from '../../../../types/dashboard/index';
import MetricGauge from '../charts/MetricGauge';

interface SystemHealthMonitorProps {
  health: SystemHealth | null;
  loading?: boolean;
  autoRefresh?: boolean;
  onRefresh?: () => void;
}

const getStatusColor = (status: SystemHealth['apiStatus']): string => {
  switch (status) {
    case 'healthy': return 'text-green-600 dark:text-green-400';
    case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
    case 'down': return 'text-red-600 dark:text-red-400';
  }
};

const getStatusBgColor = (status: SystemHealth['apiStatus']): string => {
  switch (status) {
    case 'healthy': return 'bg-green-50 dark:bg-green-900/20';
    case 'degraded': return 'bg-yellow-50 dark:bg-yellow-900/20';
    case 'down': return 'bg-red-50 dark:bg-red-900/20';
  }
};

const getStatusBorderColor = (status: SystemHealth['apiStatus']): string => {
  switch (status) {
    case 'healthy': return 'border-green-200 dark:border-green-800/50';
    case 'degraded': return 'border-yellow-200 dark:border-yellow-800/50';
    case 'down': return 'border-red-200 dark:border-red-800/50';
  }
};

const getStatusDotColor = (status: SystemHealth['apiStatus']): string => {
  switch (status) {
    case 'healthy': return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]';
    case 'degraded': return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]';
    case 'down': return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]';
  }
};

const formatUptime = (seconds: number): string => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ health, loading = false, autoRefresh = true, onRefresh }) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (health) {
      setLastUpdate(new Date());
    }
  }, [health]);

  if (loading || !health) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl col-span-1"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl md:col-span-3"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl col-span-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200/50 dark:shadow-green-900/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">System Health</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(health.apiStatus)}`}></span>
                Live status monitoring
              </p>
            </div>
          </div>
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5 items-stretch">
          
          {/* Status Box (Col 1) */}
          <div className={`col-span-1 lg:col-span-1 flex flex-col justify-center items-center ${getStatusBgColor(health.apiStatus)} rounded-2xl p-6 border ${getStatusBorderColor(health.apiStatus)} shadow-sm`}>
            <div className="relative">
              <span className={`absolute -right-1 -top-1 w-3.5 h-3.5 rounded-full ${getStatusDotColor(health.apiStatus)} animate-pulse`}></span>
              <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                <svg className={`w-7 h-7 ${getStatusColor(health.apiStatus)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {health.apiStatus === 'healthy' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                  {health.apiStatus === 'degraded' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                  {health.apiStatus === 'down' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 font-semibold uppercase tracking-wider">Status</p>
            <p className={`text-xl font-bold mt-1 ${getStatusColor(health.apiStatus)}`}>{health.apiStatus.toUpperCase()}</p>
          </div>

          {/* Metrics (Col 2-3 or 2-4) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col justify-evenly bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <MetricGauge label="CPU Usage" value={health.cpu} max={100} unit="%" color="blue" threshold={{ warning: 70, critical: 90 }} />
            <MetricGauge label="Memory Usage" value={health.memory} max={100} unit="%" color="purple" threshold={{ warning: 75, critical: 90 }} />
            <MetricGauge label="API Latency" value={health.latency} max={1000} unit="ms" color="orange" threshold={{ warning: 300, critical: 700 }} />
          </div>

          {/* Quick Stats (Col 4 or 5) */}
          <div className="col-span-1 lg:col-span-1 flex flex-col justify-center gap-6 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-center group">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Uptime
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formatUptime(health.uptime)}</p>
            </div>
            <div className="h-px w-2/3 mx-auto bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-center group">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Error Rate
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{health.errorRate}%</p>
            </div>
          </div>

        </div>

        <div className="mt-5 text-[11px] text-gray-400 font-medium text-right uppercase tracking-wider flex items-center justify-end gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;



