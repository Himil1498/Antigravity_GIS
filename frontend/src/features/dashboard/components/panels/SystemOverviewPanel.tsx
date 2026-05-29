import React from "react";
import { SystemOverviewData } from '../../types/types';

interface SystemOverviewPanelProps {
  systemOverview: SystemOverviewData | null;
  isLoading: boolean;
}

const SystemOverviewPanel: React.FC<SystemOverviewPanelProps> = ({
  systemOverview,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white flex items-center">
          <svg
            className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          System Overview
        </h3>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"></div>
                </div>
              ))}
            </div>
          ) : systemOverview ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Network Health
                </span>
                <span
                  className={`text-sm font-bold ${
                    systemOverview.networkHealth >= 90
                      ? "text-green-600 dark:text-green-400"
                      : systemOverview.networkHealth >= 70
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {systemOverview.networkHealth}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                <div
                  className={`h-2.5 rounded-full shadow-sm transition-all duration-500 ${
                    systemOverview.networkHealth >= 90
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : systemOverview.networkHealth >= 70
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-red-600"
                  }`}
                  style={{ width: `${systemOverview.networkHealth}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {systemOverview.details.activeInfrastructure} of{" "}
                {systemOverview.details.totalInfrastructure} infrastructure
                active
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Coverage
                </span>
                <span
                  className={`text-sm font-bold ${
                    systemOverview.coverage >= 80
                      ? "text-blue-600 dark:text-blue-400"
                      : systemOverview.coverage >= 50
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {systemOverview.coverage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${systemOverview.coverage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {systemOverview.details.coveredRegions} of{" "}
                {systemOverview.details.totalRegions} regions covered
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Utilization
                </span>
                <span
                  className={`text-sm font-bold ${
                    systemOverview.utilization >= 80
                      ? "text-green-600 dark:text-green-400"
                      : systemOverview.utilization >= 60
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {systemOverview.utilization}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2.5 rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${systemOverview.utilization}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Based on UPS availability and power source quality
              </p>

              {systemOverview.details.maintenanceDue > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                      {systemOverview.details.maintenanceDue} item
                      {systemOverview.details.maintenanceDue > 1 ? "s" : ""}{" "}
                      due for maintenance
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Unable to load system overview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemOverviewPanel;

