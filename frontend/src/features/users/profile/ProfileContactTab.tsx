import React from "react";
import type { User } from "../../../types/auth/index";
import { SectionHeader } from "./ProfileComponents";
import { MapPinIcon } from "./ProfileIcons";

interface ProfileContactTabProps {
  profileData: User | null;
}

const ProfileContactTab: React.FC<ProfileContactTabProps> = ({
  profileData
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <SectionHeader
        icon={<MapPinIcon />}
        title="Address Information"
        color="border-blue-300 dark:border-blue-600"
      />
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Physical Address
          </h4>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400">
                  <MapPinIcon />
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">
                {profileData?.address?.street ||
                  profileData?.street ||
                  "N/A"}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {profileData?.address?.city ||
                  profileData?.city ||
                  "N/A"}
                ,{" "}
                {profileData?.address?.state ||
                  profileData?.state ||
                  "N/A"}{" "}
                {profileData?.address?.pincode ||
                  profileData?.pincode ||
                  ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContactTab;

