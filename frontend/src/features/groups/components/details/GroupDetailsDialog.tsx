

import React from 'react';
import type { GroupDetailsDialogProps } from '../../types/types';
import { useGroupDetails } from '../../hooks/useGroupDetails';
import { DialogHeader } from './DialogHeader';
import { StatusSection } from './StatusSection';
import { MetadataSection } from './MetadataSection';
import { MembersSection } from './MembersSection';
import { PermissionsSection } from './PermissionsSection';
import { RegionsSection } from './RegionsSection';

const GroupDetailsDialog: React.FC<GroupDetailsDialogProps> = ({
  group,
  onClose,
}) => {
  const { members, permissions, regions, isLoading } = useGroupDetails(group.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <DialogHeader group={group} onClose={onClose} />

          {/* Content */}
          <div className="space-y-6 max-h-96 overflow-y-auto px-4">
            <StatusSection isActive={group.is_active} />
            <MetadataSection
              createdAt={group.created_at}
              updatedAt={group.updated_at}
            />
            <MembersSection members={members} />
            <PermissionsSection permissions={permissions} />
            <RegionsSection regions={regions} />
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsDialog;

