import React from "react";
import type { User } from "../../../types/auth/index";
import { formatDateShort } from "./profileHelpers";
import { StatCard } from "./ProfileComponents";
import { CalendarIcon, ShieldIcon, GlobeIcon } from "./ProfileIcons";

interface ProfileStatsProps {
  profileData: User | null;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        icon={<CalendarIcon />}
        label="Member Since"
        value={
          profileData?.createdAt
            ? formatDateShort(profileData.createdAt)
            : "N/A"
        }
        color="from-blue-500 to-blue-600"
      />
      <StatCard
        icon={<ShieldIcon />}
        label="Verification Status"
        value={profileData?.isEmailVerified ? "Verified" : "Pending"}
        color="from-green-500 to-emerald-600"
      />
      <StatCard
        icon={<GlobeIcon />}
        label="Assigned Regions"
        value={profileData?.assignedRegions?.length || 0}
        color="from-purple-500 to-indigo-600"
      />
    </div>
  );
};

export default ProfileStats;

