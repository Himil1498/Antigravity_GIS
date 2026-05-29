import React from 'react';
import { BulkAssignmentUser } from '../types/types';

interface UserSelectionProps {
  users: BulkAssignmentUser[];
  selectedUsers: string[];
  handleUserToggle: (userId: string) => void;
  handleSelectAllUsers: () => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({
  users,
  selectedUsers,
  handleUserToggle,
  handleSelectAllUsers
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-900/20 rounded-xl shadow-lg border-2 border-violet-100 dark:border-violet-900/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent">
            Select Users ({selectedUsers.length}/{users.length})
          </h3>
        </div>
        <button
          onClick={handleSelectAllUsers}
          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No users available
          </p>
        ) : (
          users.map(u => (
            <label
              key={u.id}
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                onChange={() => handleUserToggle(u.id)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {u.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {u.email} • {u.role}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {u.assignedRegions.length} region(s) assigned
                </div>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSelection;

