import React, { useState } from "react";
import { User } from "../../../../types/auth/index";
import { UserStatsPanelProps } from "../../types/userStats.types";
import UserDetailModal from "../modals/UserDetailModal";
import StatsSummaryCards from "./UserStatistics/StatsSummaryCards";
import OnlineUsersSection from "./UserStatistics/OnlineUsersSection";
import ActivityTrendChart from "../charts/ActivityTrendChart";

const UserStatisticsMain: React.FC<UserStatsPanelProps> = ({
  statistics,
  loading = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (loading || !statistics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse w-full">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          User Statistics
        </h3>
      </div>

      {/* Stats Content */}
      <div className="p-6 space-y-4">
        {/* Stats Summary Cards */}
        <StatsSummaryCards statistics={statistics} />

        {/* Currently Online Users */}
        <OnlineUsersSection
          users={statistics.loggedIn}
          onUserClick={setSelectedUser}
        />

        {/* Activity Trend Chart */}
        <ActivityTrendChart dailyData={statistics.trend?.daily || []} />
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default React.memo(UserStatisticsMain);

