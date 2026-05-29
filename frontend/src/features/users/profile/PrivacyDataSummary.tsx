import React from "react";
import type { User } from "../../../types/auth/index";

interface PrivacyDataSummaryProps {
  profileData: User | null;
}

const PrivacyDataSummary: React.FC<PrivacyDataSummaryProps> = ({ profileData }) => {
  // Mock data - in real app, this would come from API
  const dataStats = {
    assignedRegions: profileData?.assignedRegions?.length || 0,
    dataCreated: 0, // Would come from API
    searchesPerformed: 0, // Would come from API
    toolsUsed: 0, // Would come from API
    storageUsed: 0, // Would come from API
    storageLimit: 1024 // MB
  };

  const formatStorage = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const storagePercentage = (dataStats.storageUsed / dataStats.storageLimit) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Your Data Summary
      </h3>

      <div className="space-y-3">
        {/* Assigned Regions */}
        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigned Regions
            </span>
          </div>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {dataStats.assignedRegions}
          </span>
        </div>

        {/* Data Created */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Created
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {dataStats.dataCreated}
          </span>
        </div>

        {/* Searches Performed */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Searches Performed
            </span>
          </div>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {dataStats.searchesPerformed}
          </span>
        </div>

        {/* Tools Used */}
        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tools Used
            </span>
          </div>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {dataStats.toolsUsed}
          </span>
        </div>

        {/* Storage Used */}
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage Used
              </span>
            </div>
            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
              {formatStorage(dataStats.storageUsed)} / {formatStorage(dataStats.storageLimit)}
            </span>
          </div>
          <div className="w-full bg-cyan-200 dark:bg-cyan-900 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* GDPR Compliance Note */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Your data is processed according to our privacy policy. You have the right to request data export or deletion.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PrivacyDataSummary;

