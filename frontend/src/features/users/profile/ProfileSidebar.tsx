import React from "react";
import type { User } from "../../../types/auth/index";
import { formatDate } from "./profileHelpers";
import { SectionHeader } from "./ProfileComponents";
import { CalendarIcon } from "./ProfileIcons";
import SecurityScore from "./SecurityScore";
import RecentSecurityActivity from "./RecentSecurityActivity";
import ActiveSessions from "./ActiveSessions";
// import PrivacyDataSummary from "./PrivacyDataSummary";

interface ProfileSidebarProps {
  profileData: User | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profileData }) => {
  return (
    <div className="space-y-6">
      {/* Account Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <SectionHeader
          icon={<CalendarIcon />}
          title="Account Timeline"
          color="border-amber-300 dark:border-amber-600"
        />
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Created
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(profileData?.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Last Updated
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(profileData?.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Last Login
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(profileData?.lastLogin)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Score */}
      <SecurityScore profileData={profileData} />

      {/* Recent Security Activity */}
      <RecentSecurityActivity profileData={profileData} />

      {/* Active Sessions */}
      <ActiveSessions profileData={profileData} />

      {/* Privacy Data Summary - Hidden until real metadata API is built */}
      {/* <PrivacyDataSummary profileData={profileData} /> */}
    </div>
  );
};

export default ProfileSidebar;

