import React from 'react';
import type { GroupRegion } from '../../../../services/group/index';

interface RegionsSectionProps {
  regions: GroupRegion[];
}

export const RegionsSection: React.FC<RegionsSectionProps> = ({ regions }) => {
  if (regions.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Assigned Regions ({regions.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <span
            key={region.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {region.name || region.code || `Region ${region.region_id}`}
          </span>
        ))}
      </div>
    </div>
  );
};

