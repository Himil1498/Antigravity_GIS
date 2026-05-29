import React from "react";
import { motion, Variants } from "framer-motion";
import { useAppSelector } from "../../../../store/index";

interface DashboardHeaderProps {
  autoRefresh?: boolean;
  loading?: boolean;
  lastRefresh?: Date | null;
  onToggleAutoRefresh?: () => void;
  onRefresh?: () => void;
  totalRegions?: number;
  showAllUsersData?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  autoRefresh,
  loading,
  lastRefresh,
  onToggleAutoRefresh,
  onRefresh,
  totalRegions = 0,
  showAllUsersData = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  // Helper to determine region display text
  const getRegionText = () => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      return `${totalRegions} Regions (All)`;
    }
    const count = user?.assignedRegions?.length || 0;
    return `${count} Region${count !== 1 ? "s" : ""} Assigned`;
  };

  const iconBg = showAllUsersData ? "bg-cyan-600 dark:bg-cyan-500" : "bg-blue-600 dark:bg-blue-500";
  const titleText = showAllUsersData ? "text-cyan-600 dark:text-cyan-400" : "text-blue-600 dark:text-blue-400";
  const roleBadge = showAllUsersData ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  const syncLabel = showAllUsersData ? "text-cyan-600 dark:text-cyan-400" : "text-blue-600 dark:text-blue-400";
  const syncBox = showAllUsersData ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  const syncIcon = showAllUsersData ? "text-cyan-500" : "text-blue-500";
  const syncTime = showAllUsersData ? "text-cyan-800 dark:text-cyan-200" : "text-blue-800 dark:text-blue-200";
  const btnActive = showAllUsersData 
    ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] dark:bg-cyan-500 dark:hover:bg-cyan-600"
    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600";


  return (
    <div 
      className="bg-white dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 relative overflow-hidden"
      style={{
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.06),
          0 6px 24px rgba(0,0,0,0.05),
          inset 0 1px 0 rgba(255,255,255,1),
          inset 0 -1px 2px rgba(0,0,0,0.03)
        `,
      }}
    >
      {/* Glossy top-edge highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5"
      />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex-shrink-0 cursor-pointer"
              initial="idle"
              whileHover="hover"
            >
              <div 
                className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}
                style={{
                  boxShadow: `
                    0 3px 10px rgba(0,0,0,0.2),
                    0 1px 3px rgba(0,0,0,0.15),
                    inset 0 1px 2px rgba(255,255,255,0.3),
                    inset 0 -2px 4px rgba(0,0,0,0.12)
                  `,
                }}
              >
                <motion.svg
                  variants={iconVariants}
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </motion.svg>
              </div>
            </motion.div>
            <div>
              <h1 className={`text-xl font-bold ${titleText} flex items-center gap-3`}>
                {showAllUsersData ? "Global Platform Analytics" : "Your Platform Dashboard"}
                {showAllUsersData && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
                    Live Data
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </span>
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadge}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Company Info & Controls */}
          <div className="flex items-center gap-6 shrink-0 ml-auto">
            {/* Live Status & Region Info */}
            <div className="flex flex-col items-end pr-6 border-r border-gray-100 dark:border-gray-700 hidden lg:flex">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-gray-900 dark:text-white tracking-wide uppercase">
                  {user?.company || "OptiConnect"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {getRegionText()}
              </p>
            </div>

            {/* Sync Status & Controls */}
            <div className="flex items-center gap-5">
              {/* Auto Refresh Toggle */}
              {onToggleAutoRefresh && (
                <div className="flex items-center gap-2 hidden sm:flex border-r border-gray-100 dark:border-gray-700 pr-5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Auto-Sync
                  </span>
                  <button
                    onClick={onToggleAutoRefresh}
                    className={`
                      relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${autoRefresh ? "bg-emerald-500 focus:ring-emerald-500" : "bg-gray-300 dark:bg-gray-600 focus:ring-gray-400"}
                    `}
                    title={autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
                  >
                    <span
                      className={`
                        inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                        ${autoRefresh ? "translate-x-4.5" : "translate-x-1"}
                      `}
                      style={{ transform: autoRefresh ? 'translateX(18px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>
              )}

              {lastRefresh && (
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className={`text-[9px] ${syncLabel} font-extrabold uppercase tracking-[0.15em] mb-1`}>
                    Last Global Sync
                  </span>
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border shadow-inner ${syncBox}`}>
                    <svg className={`w-3.5 h-3.5 ${syncIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-[11px] font-bold ${syncTime} tabular-nums tracking-wide`}>
                      {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-200 active:translate-y-[1px]
                    ${loading 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800" 
                      : btnActive
                    }
                  `}
                  style={{
                    boxShadow: loading ? 'none' : `
                      0 3px 8px rgba(0,0,0,0.15),
                      0 1px 2px rgba(0,0,0,0.1),
                      inset 0 1px 1px rgba(255,255,255,0.25),
                      inset 0 -1px 2px rgba(0,0,0,0.1)
                    `,
                  }}
                  title="Refresh Dashboard"
                >
                  <svg
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>{loading ? "Refreshing..." : "Refresh"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardHeader);

