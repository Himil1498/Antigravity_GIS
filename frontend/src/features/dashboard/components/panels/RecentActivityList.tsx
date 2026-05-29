import React, { useState, useMemo } from "react";
import { RecentActivity } from "../../types/types";

interface RecentActivityListProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

// Activity type configuration with icons and colors
const activityConfig: Record<
  string,
  {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  measurement: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Measurement",
    icon: (
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
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  polygon: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Polygon",
    icon: (
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
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  infrastructure: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Infrastructure",
    icon: (
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  circle: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "Circle",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    ),
  },
  sector: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "Sector",
    icon: (
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  login: {
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    label: "Login",
    icon: (
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
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
    ),
  },
  logout: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    label: "Logout",
    icon: (
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
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    ),
  },
  default: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Activity",
    icon: (
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
};

// Helper function to format relative time
const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return activityTime.toLocaleDateString();
};

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  isLoading,
}) => {
  const [filter, setFilter] = useState<string>("all");

  // Get unique activity types from data
  const activityTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.type));
    return Array.from(types);
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  const getActivityConfig = (type: string) => {
    return activityConfig[type] || activityConfig.default;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            Recent Activity
          </h3>
          {!isLoading && activities.length > 0 && (
            <span className="text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-1 rounded-full">
              {filteredActivities.length}
            </span>
          )}
        </div>

        {/* Filter Pills - Compact */}
        {!isLoading && activityTypes.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                filter === "all"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {activityTypes.slice(0, 4).map((type) => {
              const config = getActivityConfig(type);
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    filter === type
                      ? `${config.bgColor} ${config.color}`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div
        className="flex-1 overflow-y-auto p-3"
        style={{ maxHeight: "320px" }}
      >
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl mb-3">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              No activity yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((activity) => {
              const config = getActivityConfig(activity.type);

              return (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                  {/* Activity Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center ${config.color} transition-transform group-hover:scale-105`}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white leading-snug">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {activity.action.toLowerCase()}
                      </span>
                    </p>

                    {activity.details && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {typeof activity.details === "object"
                          ? JSON.stringify(activity.details)
                          : activity.details}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      {activity.region && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {activity.region}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityList;

