import React from 'react';
import type { GroupMember } from '../../../../services/group/index';

interface MembersSectionProps {
  members: GroupMember[];
}

export const MembersSection: React.FC<MembersSectionProps> = ({ members }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Members ({members.length})
      </h4>
      {members.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between text-sm py-1"
            >
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {member.username || member.full_name || `User ${member.user_id}`}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  ({member.email || 'No email'})
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No members in this group
        </p>
      )}
    </div>
  );
};

