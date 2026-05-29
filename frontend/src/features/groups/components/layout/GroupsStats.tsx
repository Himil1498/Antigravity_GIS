// ============================================================================
// 3. GroupsStats.tsx - Stats section with all cards
// ============================================================================
import React from 'react';
import type { ApiGroup } from "../../../../services/group/groupApiService";
import { StatCard } from "./StatCard";

interface GroupsStatsProps {
  groups: ApiGroup[];
}

export const GroupsStats: React.FC<GroupsStatsProps> = ({ groups }) => {
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.is_active).length;
  const totalMembers = groups.reduce(
    (sum, g) => sum + (g.member_count || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
      <StatCard
        title="Total Groups"
        value={totalGroups}
        colorClass="bg-amber-100 dark:bg-amber-900/30"
        icon={
          <svg
            className="h-7 w-7 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Active Groups"
        value={activeGroups}
        colorClass="bg-green-100 dark:bg-green-900/30"
        icon={
          <svg
            className="h-7 w-7 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        title="Total Members"
        value={totalMembers}
        colorClass="bg-blue-100 dark:bg-blue-900/30"
        icon={
          <svg
            className="h-7 w-7 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />
    </div>
  );
};

