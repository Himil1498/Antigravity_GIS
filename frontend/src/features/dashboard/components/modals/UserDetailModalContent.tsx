import React from 'react';
import { User } from '../../../../types/auth/index';
import * as adminUserService from '../../../../services/adminUserService';
import { formatTimeAgo, parseDeviceInfo } from '../../utils/UserDetailModalUtils';

interface UserDetailModalContentProps {
  user: User;
  loading: boolean;
  stats: adminUserService.SessionStats | null;
  activities: adminUserService.RecentActivity[];
  onShowMessageDialog: () => void;
  onShowForceLogoutConfirm: () => void;
  onRefreshData: () => void;
}

const UserDetailModalContent: React.FC<UserDetailModalContentProps> = ({
  user,
  loading,
  stats,
  activities,
  onShowMessageDialog,
  onShowForceLogoutConfirm,
  onRefreshData,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Session Statistics */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              📊 Activity Overview
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.activeSessions || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalActions || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Actions (7d)</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.totalTimeToday.formatted || '0h 0m'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Time Today</p>
              </div>
            </div>
          </div>

          {/* Current Session */}
          {stats?.currentSession && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                🌐 Current Session
              </h4>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-lg border-2 border-green-200 dark:border-green-800">
                {/* IP Address */}
                <div className="flex items-center gap-3 mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">IP Address</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                      {stats.currentSession.ip_address}
                    </p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="flex items-center gap-3 mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Device & Browser</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        const device = parseDeviceInfo(stats.currentSession.device_info);
                        return `${device.browser} on ${device.os}`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Login Time */}
                <div className="flex items-center gap-2 pt-2 border-t border-green-200 dark:border-green-800">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Logged in: <span className="font-semibold">{formatTimeAgo(stats.currentSession.login_time)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Contact Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Regions */}
          {user.assignedRegions && user.assignedRegions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                📍 Assigned Regions ({user.assignedRegions.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.assignedRegions.slice(0, 6).map((region: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
                  >
                    {region}
                  </span>
                ))}
                {user.assignedRegions.length > 6 && (
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 rounded-full">
                    +{user.assignedRegions.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              📝 Recent Activity
            </h4>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              ⚡ Admin Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onShowMessageDialog}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              <button
                onClick={onShowForceLogoutConfirm}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Force Logout
              </button>
              <button
                onClick={onRefreshData}
                className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetailModalContent;

