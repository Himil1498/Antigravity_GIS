import React from 'react';
import { AssignmentAction } from '../types/types';

interface ActionSelectionProps {
  action: AssignmentAction;
  setAction: (action: AssignmentAction) => void;
}

const ActionSelection: React.FC<ActionSelectionProps> = ({ action, setAction }) => {
  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl shadow-lg border-2 border-indigo-100 dark:border-indigo-900/30 p-6">
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent">
          Select Action
        </h3>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200">
          <input
            type="radio"
            name="action"
            value="assign"
            checked={action === 'assign'}
            onChange={e => setAction(e.target.value as AssignmentAction)}
            className="mr-3 h-5 w-5 text-emerald-600"
          />
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Assign (Add to existing)
            </span>
          </div>
        </label>
        <label className="flex items-center px-4 py-3 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-2 border-rose-200 dark:border-rose-700 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200">
          <input
            type="radio"
            name="action"
            value="revoke"
            checked={action === 'revoke'}
            onChange={e => setAction(e.target.value as AssignmentAction)}
            className="mr-3 h-5 w-5 text-rose-600"
          />
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-rose-600 dark:text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
            <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
              Revoke (Remove from existing)
            </span>
          </div>
        </label>
        <label className="flex items-center px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200">
          <input
            type="radio"
            name="action"
            value="replace"
            checked={action === 'replace'}
            onChange={e => setAction(e.target.value as AssignmentAction)}
            className="mr-3 h-5 w-5 text-amber-600"
          />
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Replace (Override all)
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ActionSelection;

