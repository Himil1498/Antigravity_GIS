/**
 * GrantsTable - Table displaying temporary access grants
 */

import React from "react";
import {
  ClockIcon,
  MapIcon,
  ArrowPathIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { TemporaryRegionAccess } from "../types/types";
import { formatDate, getStatusBadge } from "../utils/utils";

import Countdown from "./Countdown";

interface GrantsTableProps {
  grants: TemporaryRegionAccess[];
  onExtend: (grant: TemporaryRegionAccess) => void;
  onRevoke: (grant: TemporaryRegionAccess) => void;
  onDelete: (grant: TemporaryRegionAccess) => void;
}

const GrantsTable: React.FC<GrantsTableProps> = ({
  grants,
  onExtend,
  onRevoke,
  onDelete,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-violet-50/30 dark:from-gray-800 dark:to-violet-900/10 rounded-xl shadow-lg border border-violet-200/60 dark:border-violet-800/30 overflow-hidden">
      <div className="p-6 border-b border-violet-100 dark:border-violet-900/30">
        <h2 className="text-xl font-semibold text-violet-700 dark:text-violet-400 flex items-center gap-2">
          <span className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg text-white shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </span>
          Temporary Access Grants
          <span className="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
            {grants.length}
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/20">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Granted By / Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {grants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No temporary access grants found
                </td>
              </tr>
            ) : (
              grants.map((grant) => (
                <tr
                  key={grant.id}
                  className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {grant.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {grant.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <MapIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {grant.region}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {grant.grantedByName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(grant.grantedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(grant.expiresAt)}
                    </div>
                    {!grant.revokedAt && (
                      <Countdown expiresAt={grant.expiresAt} />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(grant)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-center">
                    {grant.isActive &&
                      !grant.revokedAt &&
                      grant.expiresAt > new Date() && (
                        <>
                          <button
                            onClick={() => onExtend(grant)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Extend"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onRevoke(grant)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Revoke"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    <button
                      onClick={() => onDelete(grant)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrantsTable;

