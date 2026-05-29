/**
 * Request Filter Panel Component
 * Provides filtering UI for region requests
 */

import React from 'react';
import EnhancedSelect from '../../../../components/ui/EnhancedSelect';
import type { RegionRequestStatus } from '../types/types';

interface RequestFilterPanelProps {
  filterStatus: RegionRequestStatus | 'all';
  onFilterChange: (status: RegionRequestStatus | 'all') => void;
  requestCount: number;
}

const RequestFilterPanel: React.FC<RequestFilterPanelProps> = ({
  filterStatus,
  onFilterChange,
  requestCount
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 rounded-xl shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30 p-6">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
        <EnhancedSelect
          label="Filter by Status:"
          value={filterStatus}
          onChange={(value: string) => onFilterChange(value as RegionRequestStatus | 'all')}
          options={[
            {
              value: 'all',
              label: 'All Requests',
              icon: <span>📋</span>,
              description: 'Show all requests',
            },
            {
              value: 'pending',
              label: 'Pending',
              icon: <span>⏳</span>,
              description: 'Awaiting review',
            },
            {
              value: 'approved',
              label: 'Approved',
              icon: <span>✅</span>,
              description: 'Approved requests',
            },
            {
              value: 'rejected',
              label: 'Rejected',
              icon: <span>❌</span>,
              description: 'Rejected requests',
            },
            {
              value: 'cancelled',
              label: 'Cancelled',
              icon: <span>🚫</span>,
              description: 'Cancelled by user',
            },
          ]}
          placeholder="Filter by status..."
          className="flex-1"
        />
        <div className="flex-1 text-right">
          <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 text-cyan-700 dark:text-cyan-300 rounded-lg font-bold text-sm shadow-sm border border-cyan-300 dark:border-cyan-700">
            <svg
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Showing {requestCount} request{requestCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RequestFilterPanel;

