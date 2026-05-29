import React from 'react';
import { ClockIcon } from "@heroicons/react/24/outline";

interface TemporaryAccessHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TemporaryAccessHeader: React.FC<TemporaryAccessHeaderProps> = ({ onRefresh, isRefreshing = false }) => {
  return (
    <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-xl shadow-xl border-2 border-amber-100 dark:border-amber-900/30 p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
          <ClockIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
            Temporary Access Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
            Grant and manage temporary region access for users
          </p>
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors font-medium text-sm border border-amber-200 dark:border-amber-700/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
          title="Refresh temporary access grants"
        >
          {isRefreshing ? (
             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-700 dark:text-amber-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};

export default TemporaryAccessHeader;

