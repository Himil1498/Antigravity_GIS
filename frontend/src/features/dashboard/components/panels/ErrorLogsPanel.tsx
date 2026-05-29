import React from "react";
import { getRelativeTime } from "../../utils/dashboardHelpers";

interface ErrorLog {
  id: number;
  action: string;
  details: any;
  timestamp: string;
  user: string;
}

interface ErrorLogsPanelProps {
  logs: ErrorLog[];
  loading: boolean;
  error: string | null;
}

const ErrorLogsPanel: React.FC<ErrorLogsPanelProps> = ({
  logs,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6 flex flex-col h-full min-h-[300px]">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-8"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-3 border border-red-500/20">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-100 font-bold">Failed to load Error Logs</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="text-sm font-mono font-bold text-gray-300 ml-2">system_exceptions.log</h3>
        </div>
        {logs.length > 0 && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20">
            {logs.length} Errors Found
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-green-500/80">
            &gt; System running smoothly. No critical errors recorded. _
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              let detailsStr = "No additional details";
              if (typeof log.details === 'string') {
                detailsStr = log.details;
              } else if (log.details) {
                detailsStr = JSON.stringify(log.details);
              }

              return (
                <div key={log.id} className="border-l-2 border-red-500/50 pl-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <span className="text-blue-400">[{getRelativeTime(log.timestamp)}]</span>
                    <span className="text-purple-400">user:{log.user}</span>
                  </div>
                  <div className="text-red-400 font-bold mb-1">
                    {log.action}
                  </div>
                  <div className="text-gray-400 bg-gray-950 p-2 rounded border border-gray-800 whitespace-pre-wrap break-all">
                    {detailsStr}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorLogsPanel;
