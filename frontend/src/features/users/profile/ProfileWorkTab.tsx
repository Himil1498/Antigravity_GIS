import React from "react";
import type { User } from "../../../types/auth/index";
import { formatDate } from "./profileHelpers";
import { InfoField, SectionHeader } from "./ProfileComponents";
import { BriefcaseIcon, MapPinIcon, CalendarIcon } from "./ProfileIcons";

interface ProfileWorkTabProps {
  profileData: User | null;
}

const ProfileWorkTab: React.FC<ProfileWorkTabProps> = ({ profileData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <SectionHeader
        icon={<BriefcaseIcon />}
        title="Work Information"
        color="border-blue-300 dark:border-blue-600"
      />

      {/* Assigned Regions */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Assigned Regions
        </h4>
        <div className="flex flex-wrap gap-2">
          {profileData?.assignedRegions &&
          profileData.assignedRegions.length > 0 ? (
            profileData.assignedRegions.map((region: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300 dark:border-purple-700"
              >
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                {region}
              </span>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
              No regions assigned
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <InfoField
            icon={<BriefcaseIcon />}
            label="Role"
            value={profileData?.role}
          />
          <InfoField
            icon={<BriefcaseIcon />}
            label="Department"
            value={profileData?.department}
          />
          {profileData?.createdByName && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created By
                </p>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                  {profileData.createdByName}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <InfoField
            icon={<MapPinIcon />}
            label="Office Location"
            value={profileData?.officeLocation}
          />
          <div className="flex items-start space-x-4 pt-2">
            <div className="flex-shrink-0">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400">
                  <CalendarIcon />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Login
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1 text-sm">
                {formatDate(profileData?.lastLogin, "datetime")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWorkTab;

