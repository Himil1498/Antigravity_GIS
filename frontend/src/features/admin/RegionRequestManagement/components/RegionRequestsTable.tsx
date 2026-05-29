/**
 * RegionRequestsTable - Table Component
 * Displays region access requests with action buttons
 */

import React from 'react';
import type { RegionAccessRequest } from '../types/types';

interface RegionRequestsTableProps {
  requests: RegionAccessRequest[];
  filterStatus: string;
  onApprove: (request: RegionAccessRequest) => void;
  onReject: (request: RegionAccessRequest) => void;
  onDelete: (request: RegionAccessRequest) => void;
}

const RegionRequestsTable: React.FC<RegionRequestsTableProps> = ({
  requests,
  filterStatus,
  onApprove,
  onReject,
  onDelete
}) => {
  if (requests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-violet-100 dark:border-violet-900/30 overflow-hidden">
        <div className="p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No requests found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {filterStatus === 'all' ? 'There are no region access requests yet.' : `There are no ${filterStatus} requests.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-violet-100 dark:border-violet-900/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-violet-200 dark:divide-violet-900/30">
          <thead className="bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Requested Regions
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Reason
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{request.userName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{request.userEmail}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{request.userRole}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {request.requestedRegions.map((region: string) => (
                      <span key={region} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                        {region}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                    {request.reason.length > 100 ? `${request.reason.substring(0, 100)}...` : request.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                    request.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                    request.status === 'rejected' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                    'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.reviewedByName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {request.reviewedByName}</div>
                  )}
                  {request.reviewNotes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{request.reviewNotes}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs">{new Date(request.createdAt).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onApprove(request)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-xs"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(request)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-xs"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDelete(request)}
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-xs"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionRequestsTable;

