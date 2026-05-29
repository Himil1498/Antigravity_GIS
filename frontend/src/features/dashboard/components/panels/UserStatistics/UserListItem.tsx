import React from "react";
import { UserListItemProps } from '../../../types/userStats.types';
import { getInitials, formatTimeOnline } from '../../../utils/userFormatters';
import { getAvatarColor, getRoleBadgeColor } from '../../../utils/userStyles';

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  viewMode,
  onClick,
}) => {
  if (viewMode === "grid") {
    return (
      <div
        onClick={onClick}
        className="flex flex-col items-center p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md group cursor-pointer"
      >
        <div className="relative mb-2">
          <div
            className={`w-14 h-14 rounded-xl ${getAvatarColor(
              user.name
            )} flex items-center justify-center text-white font-bold text-base shadow-lg group-hover:scale-105 transition-transform duration-200`}
          >
            {getInitials(user.name)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm">
            <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
          </span>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white text-center mb-1 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {user.name}
        </p>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(
            user.role
          )} shadow-sm mb-1`}
        >
          {user.role}
        </span>
        {user.lastLogin && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {user.minutesSinceLogin !== undefined
              ? formatTimeOnline(user.minutesSinceLogin)
              : "Active now"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-start space-x-3 p-3.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md group cursor-pointer"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-xl ${getAvatarColor(
            user.name
          )} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform duration-200`}
        >
          {getInitials(user.name)}
        </div>
        {/* Online Indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm">
          <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
        </span>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {user.name}
          </p>
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(
              user.role
            )} shadow-sm`}
          >
            {user.role}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2 flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {user.email}
        </p>
        <div className="flex items-center gap-2">
          {user.lastLogin && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                {user.minutesSinceLogin !== undefined
                  ? formatTimeOnline(user.minutesSinceLogin)
                  : "Active now"}
              </span>
            </div>
          )}
          <button
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-auto"
            aria-label="View user details"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;

