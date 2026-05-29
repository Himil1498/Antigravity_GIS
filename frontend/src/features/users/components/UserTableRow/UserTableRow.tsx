import React from "react";
import { UserTableRowProps } from "./types";
import { getRoleBadgeConfig } from "./utils";
import UserTableRowActions from "./UserTableRowActions";

const UserTableRow: React.FC<UserTableRowProps> = React.memo(
  (props) => {
    const { user, isSelected, onSelect } = props;

    const roleBadge = getRoleBadgeConfig(user.role);

    return (
      <tr className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-150">
        {/* Checkbox */}
        <td className="px-4 py-3.5 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(user.id)}
            aria-label={`Select ${user.name}`}
            className="h-5 w-5 rounded border-violet-300 dark:border-violet-600 text-violet-600 focus:ring-violet-500"
          />
        </td>

        <td className="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
          {user.id}
        </td>

        {/* Name & Username */}
        <td className="px-4 py-3.5 text-center">
          <div className="flex flex-col items-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              @{user.username}
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white text-center max-w-[200px] truncate">
          {user.email}
        </td>

        {/* Role */}
        <td className="px-4 py-3.5 text-center">
          <div className="max-w-[200px] flex justify-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${roleBadge.bg} whitespace-nowrap overflow-hidden`}
              title={roleBadge.text}
            >
              <svg
                className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                fill={user.role === "admin" ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {roleBadge.icon}
              </svg>
              <span className="truncate max-w-[150px]">{roleBadge.text}</span>
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3.5 text-center">
          {user.status === "Active" ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-300 dark:border-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
              Inactive
            </span>
          )}
        </td>
        {/* Email Verification */}
        <td className="px-4 py-3.5 text-center">
          {user.isEmailVerified ? (
            <div className="flex flex-col gap-1 items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-300 dark:border-green-700">
                <svg
                  className="h-3 w-3 mr-1.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
              {user.manualVerification && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                  Manual
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              <svg
                className="h-3 w-3 mr-1.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Not Verified
            </span>
          )}
        </td>

        {/* 2FA Status */}
        <td className="px-4 py-3.5 text-center">
          {user.mfaEnabled ? (
            <div className="flex flex-col gap-1 items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                <svg
                  className="h-3.5 w-3.5 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Enabled
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                {user.mfaMethod?.toUpperCase() || "EMAIL"}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              <svg
                className="h-3.5 w-3.5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Disabled
            </span>
          )}
        </td>

        {/* Assigned Regions */}
        <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white text-center max-w-[150px]">
          <div className="line-clamp-2 leading-tight">
            {user.assignedRegions.slice(0, 2).join(", ")}
            {user.assignedRegions.length > 2 &&
              ` +${user.assignedRegions.length - 2} more`}
          </div>
        </td>

        {/* Temporary Access */}
        <td className="px-4 py-3.5 text-sm text-center">
          {user.temporaryAccess && user.temporaryAccess.length > 0 ? (
            <div className="flex flex-col gap-1 items-center">
              {user.temporaryAccess.slice(0, 2).map((ta) => (
                <div key={ta.id} className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {ta.region}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ta.timeRemaining.days <= 1
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : ta.timeRemaining.days <= 7
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    <svg
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {ta.timeRemaining.display}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">None</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-sm text-center">
          <UserTableRowActions {...props} />
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.user === nextProps.user
    );
  },
);

export default UserTableRow;
