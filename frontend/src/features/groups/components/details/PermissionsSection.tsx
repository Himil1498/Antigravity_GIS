import React from 'react';
import { SYSTEM_PERMISSIONS } from '../../../../types/permissions/index';

interface PermissionsSectionProps {
  permissions: string[];
}

export const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  permissions,
}) => {
  const permissionDetails = SYSTEM_PERMISSIONS.filter((p) =>
    permissions.includes(p.id)
  );

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Permissions ({permissionDetails.length})
      </h4>
      {permissionDetails.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {permissionDetails.map((perm) => (
            <div key={perm.id} className="text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {perm.name}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {perm.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No permissions assigned
        </p>
      )}
    </div>
  );
};


