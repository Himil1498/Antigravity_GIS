import React, { useState } from "react";
import { User } from '../../../../../types/auth/index';
import { ViewMode, SortBy } from '../../../types/userStats.types';
import SearchAndControls from './SearchAndControls';
import UserListItem from './UserListItem';
import { useUserFiltering } from '../../../hooks/useUserFiltering';
import { SCROLLBAR_STYLES } from '../../../utils/userStyles';

interface OnlineUsersSectionProps {
  users: User[];
  onUserClick: (user: User) => void;
}

const OnlineUsersSection: React.FC<OnlineUsersSectionProps> = ({
  users,
  onUserClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const filteredUsers = useUserFiltering({ users, searchTerm, sortBy });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
      <style>{SCROLLBAR_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Currently Online
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {users.length} {users.length === 1 ? "user" : "users"} active
            </p>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <SearchAndControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* User List */}
      <div
        className={`${
          viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"
        } max-h-96 overflow-y-auto pr-1 custom-scrollbar`}
      >
        {filteredUsers.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-8 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {searchTerm ? "No users found" : "No users online"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
              {searchTerm
                ? "Try adjusting your search"
                : "Users will appear here when they log in"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              viewMode={viewMode}
              onClick={() => onUserClick(user)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsersSection;

