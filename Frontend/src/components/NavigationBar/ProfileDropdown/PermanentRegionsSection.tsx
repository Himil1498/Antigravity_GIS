import React from "react";
import { TemporaryRegionAccess } from '../../../types/temporaryAccess.types';
import { UserProfile } from "./types";

interface PermanentRegionsSectionProps {
  user: UserProfile | null;
  tempAccessGrants: TemporaryRegionAccess[];
}

const getPermanentRegions = (
  user: UserProfile | null,
  tempAccessGrants: TemporaryRegionAccess[]
): string[] => {
  if (!user?.assignedRegions || !Array.isArray(user.assignedRegions)) {
    return [];
  }

  // Simply return all assigned regions. If they are also in Temporary, that's fine.
  // The user explicitly assigned them permanently.
  return user.assignedRegions;
};

const PermanentRegionsSection: React.FC<PermanentRegionsSectionProps> = ({
  user,
  tempAccessGrants,
}) => {
  const permanentRegions = getPermanentRegions(user, tempAccessGrants);

  if (permanentRegions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/10">
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center">
        <svg
          className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Permanent Access ({permanentRegions.length})
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
        {permanentRegions.map((region: string) => (
          <span
            key={region}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
          >
            <svg
              className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {region}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PermanentRegionsSection;

