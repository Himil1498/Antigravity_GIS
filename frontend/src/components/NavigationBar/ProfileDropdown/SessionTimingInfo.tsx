import React from "react";
import { SessionInfo } from "./sessionUtils";
import { UserProfile } from "./types";

interface SessionTimingInfoProps {
  user: UserProfile | null;
  sessionInfo: SessionInfo;
}

const SessionTimingInfo: React.FC<SessionTimingInfoProps> = ({
  user,
  sessionInfo,
}) => {
  const {
    sessionDuration,
    timeRemaining,
    expiryWarning,
    sessionStart,
    expiryTime,
  } = sessionInfo;

  return (
    <div className="px-4 py-3 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 border-y border-gray-200 dark:border-gray-700">
      <div className="space-y-2.5">
        {user?.lastLogin && (
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Last Login (Previous Session)
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const lastLoginDate = new Date(user.lastLogin);
                  return `${lastLoginDate.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} at ${lastLoginDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`;
                })()}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Session Started
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {sessionStart
                ? `${sessionStart.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })} at ${sessionStart.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`
                : "Active"}
            </p>
            <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <svg
                className="w-3 h-3 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Logged in for: {sessionDuration}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Session Expires
            </p>
            {expiryTime ? (
              <>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {expiryTime.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {expiryTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <p
                  className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                    expiryWarning === "critical"
                      ? "text-red-600 dark:text-red-400 animate-pulse"
                      : expiryWarning === "warning"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {timeRemaining === "Session expired" ? "⚠️" : "⏳"}{" "}
                  {timeRemaining} remaining
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                4 hours from login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimingInfo;

