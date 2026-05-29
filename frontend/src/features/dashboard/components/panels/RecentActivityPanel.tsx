import React, { useState, useMemo } from "react";
import { getRelativeTime } from "../../utils/dashboardHelpers";
import type { RecentActivity } from "../../types/types";

interface RecentActivityPanelProps {
  activities: RecentActivity[];
  loading: boolean;
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
  feasibility: {
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    label: "Feasibility",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// Helper component to format JSON details beautifully
const ActivityDetails = React.memo(({ details }: { details: any }) => {
  let parsedDetails = details;
  
  if (typeof details === 'string' && details.startsWith('{')) {
    try {
      parsedDetails = JSON.parse(details);
    } catch (e) {}
  }

  if (typeof parsedDetails === 'object' && parsedDetails !== null) {
    if (parsedDetails.action && parsedDetails.email) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
          parsedDetails.action.includes('SUCCESS') 
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {parsedDetails.action.includes('SUCCESS') ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {parsedDetails.action.replace(/_/g, ' ')}
        </span>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-2 text-xs mt-1">
        {Object.entries(parsedDetails).map(([key, value]) => {
          if (typeof value === 'object') return null;
          return (
            <span key={key} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">{key}:</span>
              <span className="font-medium">{String(value)}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-1 inline-block">
      {String(details)}
    </span>
  );
});

const RecentActivityItem = React.memo(
  ({
    activity,
    config,
    index,
  }: {
    activity: RecentActivity;
    config: typeof activityConfig.default;
    index: number;
  }) => {
    return (
      <div
        className="group relative flex items-start gap-4 pb-6 last:pb-0"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-10 w-px h-full bg-gray-200 dark:bg-gray-700 group-last:hidden" />

        {/* Activity Icon / Dot */}
        <div
          className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center ${config.color} ring-4 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-110`}
        >
          {config.icon}
        </div>

        {/* Content Card */}
        <div className="flex-1 min-w-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {activity.user}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ring-1 ring-inset ${config.bgColor} ${config.color}`}
              >
                {config.label}
              </span>
            </div>

            <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {getRelativeTime(activity.timestamp)}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            {activity.action}
          </p>

          {activity.details && (
            <div className="mb-3">
              <ActivityDetails details={activity.details} />
            </div>
          )}

          {activity.region && (
            <div className="mt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {activity.region}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  activities,
  loading,
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [showCount, setShowCount] = useState(10);

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

  // Limit displayed activities
  const displayedActivities = filteredActivities.slice(0, showCount);

  const getActivityConfig = (type: string) => {
    return activityConfig[type] || activityConfig.default;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50/50 to-rose-50/50 dark:from-orange-900/10 dark:to-rose-900/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <span>Recent Activity</span>
              <p className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time user actions
              </p>
            </div>
          </h3>
          {!loading && activities.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 rounded-full shadow-sm">
                {filteredActivities.length} {filter !== "all" ? filter : ""}{" "}
                activities
              </span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        {!loading && activityTypes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 ${
                filter === "all"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md ring-2 ring-gray-900/20 dark:ring-white/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              All Types
            </button>
            {activityTypes.map((type) => {
              const config = getActivityConfig(type);
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 border border-transparent ${
                    filter === type
                      ? `${config.bgColor} ${config.color} ring-2 ring-current shadow-sm`
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-6 bg-gray-50/30 dark:bg-gray-900/20">
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
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
              <p className="text-gray-600 dark:text-gray-400 font-semibold mb-1">
                {filter !== "all"
                  ? `No ${filter} activities`
                  : "No recent activity"}
              </p>
              <p className="text-sm text-gray-500">
                Activities will appear here as users interact with the system
              </p>
            </div>
          ) : (
            displayedActivities.map((activity, index) => (
              <RecentActivityItem
                key={activity.id}
                activity={activity}
                index={index}
                config={getActivityConfig(activity.type)}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredActivities.length > showCount && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCount((prev) => prev + 10)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              Load More ({filteredActivities.length - showCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RecentActivityPanel);

