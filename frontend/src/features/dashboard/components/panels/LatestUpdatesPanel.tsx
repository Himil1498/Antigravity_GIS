import React, { useEffect, useState } from "react";
import { updatesApi, SystemUpdate } from "../../../../services/api/systemUpdatesApiService";

const LatestUpdatesPanel: React.FC = () => {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await updatesApi.getPublishedUpdates(1, 4);
        setUpdates(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard updates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const openFullPanel = () => {
    window.dispatchEvent(new CustomEvent('openUpdatesPanel'));
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'feature': return { label: 'Feature', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' };
      case 'bugfix': return { label: 'Bug Fix', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' };
      case 'announcement': return { label: 'News', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' };
      case 'auto-release': return { label: 'Update', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
      default: return { label: 'Update', color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-fuchsia-50/50 to-purple-50/50 dark:from-fuchsia-900/10 dark:to-purple-900/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              Latest Updates
              <p className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                New features & improvements
              </p>
            </div>
          </h3>
          <button 
            onClick={openFullPanel}
            className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 transition-colors"
          >
            History →
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : updates.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No recent updates found.</p>
          </div>
        ) : (
          updates.map((update) => {
            const badge = getBadgeConfig(update.type);
            return (
              <div key={update.id} className="group flex items-start gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all duration-200">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      {new Date(update.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors truncate">
                    {update.title}
                  </h4>
                  {update.version_tag && (
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      v{update.version_tag}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={openFullPanel}
          className="w-full text-center text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest"
        >
          Explore All Change Logs
        </button>
      </div>
    </div>
  );
};

export default LatestUpdatesPanel;
