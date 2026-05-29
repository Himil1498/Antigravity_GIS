/**
 * Log Details Additional Details Component
 * Displays dynamic key-value pairs from log details
 */

import React from 'react';
import { renderValue } from './ValueRenderer';

interface LogDetailsAdditionalDetailsProps {
  details: Record<string, any>;
}

const LogDetailsAdditionalDetails: React.FC<LogDetailsAdditionalDetailsProps> = ({ details }) => {
  if (Object.keys(details).length === 0) return null;

  const { diff, ...standardDetails } = details;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-2">
        <svg className="h-6 w-6 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Additional Details</h4>
      </div>

      {/* Render Payload Differencer if diff state exists */}
      {diff && diff.before !== undefined && diff.after !== undefined && (
        <div className="mb-6">
          <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Payload Changes</h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-red-200 dark:border-red-900/30 overflow-hidden shadow-sm">
              <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/30">
                BEFORE (Previous State)
              </div>
              <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 overflow-x-auto h-full min-h-[80px]">
                {JSON.stringify(diff.before, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-green-200 dark:border-green-900/30 overflow-hidden shadow-sm">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 text-xs font-bold text-green-600 dark:text-green-400 border-b border-green-200 dark:border-green-900/30">
                AFTER (New State)
              </div>
              <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 overflow-x-auto h-full min-h-[80px]">
                {JSON.stringify(diff.after, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Standard Flat Details rendering */}
      {Object.keys(standardDetails).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 font-mono text-sm overflow-x-auto">
          <div className="space-y-2">
            {Object.entries(standardDetails).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold min-w-fit">{key}:</span>
                <div className="flex-1">{renderValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogDetailsAdditionalDetails;

