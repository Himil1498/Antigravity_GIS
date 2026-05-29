/**
 * StatsCards - Statistics Display Cards
 */

import React from "react";
import {
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import type { AccessStats } from "../types/types";

interface StatsCardsProps {
  stats: AccessStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Grants */}
      <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl shadow-lg border-2 border-indigo-100 dark:border-indigo-900/30 p-5 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              Total Grants
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
            <UserGroupIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 rounded-xl shadow-lg border-2 border-emerald-100 dark:border-emerald-900/30 p-5 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              Active
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
            <CheckCircleIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Expired */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-900/30 p-5 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Expired
            </p>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.expired}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-md">
            <ClockIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Revoked */}
      <div className="bg-gradient-to-br from-white to-rose-50 dark:from-gray-800 dark:to-rose-900/20 rounded-xl shadow-lg border-2 border-rose-100 dark:border-rose-900/30 p-5 hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">
              Revoked
            </p>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {stats.revoked}
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md">
            <XCircleIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;

