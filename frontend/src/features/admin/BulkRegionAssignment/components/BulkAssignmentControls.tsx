import React from 'react';
import { AssignmentAction } from '../types/types';

interface BulkAssignmentControlsProps {
  action: AssignmentAction;
  selectedUsersCount: number;
  selectedRegionsCount: number;
  handleApplyBulkAssignment: () => void;
}

const BulkAssignmentControls: React.FC<BulkAssignmentControlsProps> = ({
  action,
  selectedUsersCount,
  selectedRegionsCount,
  handleApplyBulkAssignment
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 rounded-xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/30 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              {action === 'assign' && 'Add selected regions to selected users'}
              {action === 'revoke' && 'Remove selected regions from selected users'}
              {action === 'replace' && 'Replace all regions for selected users with selected regions'}
            </p>
            {selectedUsersCount > 0 && selectedRegionsCount > 0 && (
              <p className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700 dark:text-cyan-300 mt-2 px-3 py-1 bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 rounded-lg shadow-sm border border-cyan-300 dark:border-cyan-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                This will affect {selectedUsersCount} user(s) and {selectedRegionsCount} region(s)
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleApplyBulkAssignment}
          disabled={selectedUsersCount === 0 || selectedRegionsCount === 0}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Apply Bulk {action === 'assign' ? 'Assignment' : action === 'revoke' ? 'Revocation' : 'Replacement'}
        </button>
      </div>
    </div>
  );
};

export default BulkAssignmentControls;

