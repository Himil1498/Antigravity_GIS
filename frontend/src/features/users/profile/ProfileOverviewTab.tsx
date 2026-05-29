import React from "react";
import type { User } from "../../../types/auth/index";
import { formatDate } from "./profileHelpers";
import { InfoField, SectionHeader } from "./ProfileComponents";
import { BriefcaseIcon, MailIcon, PhoneIcon, ShieldIcon } from "./ProfileIcons";

interface ProfileOverviewTabProps {
  profileData: User | null;
}

const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  profileData
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <SectionHeader
        icon={<BriefcaseIcon />}
        title="Profile Overview"
        color="border-blue-300 dark:border-blue-600"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Personal Details
          </h4>
          <div className="space-y-5">
            <InfoField
              icon={<MailIcon />}
              label="Email Address"
              value={profileData?.email}
            />
            <InfoField
              icon={<PhoneIcon />}
              label="Phone Number"
              value={profileData?.phoneNumber || profileData?.phone}
            />
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    <ShieldIcon />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User ID
                </p>
                <p className="text-gray-900 dark:text-gray-100 font-mono text-sm font-semibold mt-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg inline-block">
                  {profileData?.id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Account Status
          </h4>
          <div className="space-y-5">
            <div
              className={`p-4 rounded-lg border ${
                profileData?.isActive
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  profileData?.isActive
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {profileData?.isActive
                  ? "✓ Active Account"
                  : "✗ Inactive Account"}
              </p>
              <p
                className={`text-xs mt-1 ${
                  profileData?.isActive
                    ? "text-green-600 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                }`}
              >
                {profileData?.isActive
                  ? "Your account is in good standing"
                  : "Your account requires attention"}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                profileData?.isEmailVerified
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  profileData?.isEmailVerified
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {profileData?.isEmailVerified
                  ? "✓ Email Verified"
                  : "⚠ Email Not Verified"}
              </p>
              <p
                className={`text-xs mt-1 ${
                  profileData?.isEmailVerified
                    ? "text-blue-600 dark:text-blue-300"
                    : "text-amber-600 dark:text-amber-300"
                }`}
              >
                Last{" "}
                {profileData?.isEmailVerified ? "verified" : "check"}{" "}
                on {formatDate(profileData?.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverviewTab;

