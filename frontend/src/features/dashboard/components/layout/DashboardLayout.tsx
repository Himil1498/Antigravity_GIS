import React, { useCallback } from "react";
import { useSessionValidator } from "../../../../hooks/useSessionValidator";
import { useAppSelector } from "../../../../store/index";
import {
  transformPerfChartData,
  getGrandTotal,
} from "../../utils/dashboardHelpers";
import { useDashboardData } from "../../hooks/useDashboardData";

// Components
import PageContainer from "../../../../components/ui/PageContainer";
import DashboardHeader from "./DashboardHeader";

import UserStatsPanel from "../panels/UserStatisticsPanel";
import PerformanceSection from "../panels/PerformanceSection";
import SystemHealthMonitor from "../panels/SystemHealthMonitor";
import RecentActivityPanel from "../panels/RecentActivityPanel";
import FeasibilityAnalyticsPanel from "../panels/FeasibilityAnalyticsPanel";
import PeakUsagePanel from "../panels/PeakUsagePanel";
import ErrorLogsPanel from "../panels/ErrorLogsPanel";

import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import PanelErrorFallback from "../../../../components/ui/PanelErrorFallback";

interface DashboardLayoutProps {
  showAllUsersData?: boolean; // true = show all users' data (Analytics), false/undefined = show user's data (Dashboard)
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  showAllUsersData = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  // Custom hook handles all data fetching and state
  const {
    metrics,
    loading,
    autoRefresh,
    lastRefresh,
    userStats,
    userStatsLoading,
    performanceData,
    performanceLoading,
    performanceError,
    selectedPerfTimeRange,
    totalRegions,
    setAutoRefresh,
    handleRefresh,
    setSelectedPerfTimeRange,
    fetchPerformanceData,
    recentActivities,
    activitiesLoading,
    usageTrendsData,
    usageTrendsLoading,
    usageTrendsError,
    selectedUsageTimeRange,
    setSelectedUsageTimeRange,
    fetchUsageTrends,
    feasibilityStats,
    feasibilityLoading,
    feasibilityError,
    peakUsage,
    peakUsageLoading,
    peakUsageError,
    errorLogs,
    errorLogsLoading,
    errorLogsError,
  } = useDashboardData(showAllUsersData);

  // Monitor session validity - automatically logs out if session is terminated
  useSessionValidator({
    interval: 10000, // Check every 10 seconds
    enabled: !!user, // Only check if user is logged in
  });

  // Transform data for charts
  const perfChartData = transformPerfChartData(
    performanceData?.latencyOverTime,
    selectedPerfTimeRange,
  );

  const usageTotals = React.useMemo(
    () => getGrandTotal(usageTrendsData),
    [usageTrendsData]
  );

  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, [setAutoRefresh]);

  return (
    <PageContainer>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <DashboardHeader
          autoRefresh={autoRefresh}
          loading={loading}
          lastRefresh={lastRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          onRefresh={handleRefresh}
          totalRegions={totalRegions}
          showAllUsersData={showAllUsersData}
        />

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* User & Tool Analytics */}
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2.5">
                  <div className="h-6 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-600 rounded-full"></div>
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
                  >
                    User & Tool Analytics
                  </span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
                  User statistics and tool usage patterns
                </p>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: User Stats (2/3 width) */}
                  <div className="lg:col-span-2">
                    <ErrorBoundary
                      fallback={<PanelErrorFallback title="User Statistics" />}
                    >
                      <UserStatsPanel
                        statistics={userStats}
                        loading={userStatsLoading || loading}
                      />
                    </ErrorBoundary>
                  </div>
                  
                  {/* Right Column: Recent Activity (1/3 width) */}
                  <div className="lg:col-span-1">
                    <ErrorBoundary
                      fallback={<PanelErrorFallback title="Recent Activity" />}
                    >
                      <RecentActivityPanel
                        activities={recentActivities}
                        loading={activitiesLoading || loading}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </section>

            {/* API Performance */}
            <ErrorBoundary
              fallback={<PanelErrorFallback title="API Performance" />}
            >
              <PerformanceSection
                performanceData={performanceData}
                performanceLoading={performanceLoading}
                performanceError={performanceError}
                selectedPerfTimeRange={selectedPerfTimeRange}
                perfChartData={perfChartData}
                onTimeRangeChange={setSelectedPerfTimeRange}
                onRetry={fetchPerformanceData}
              />
            </ErrorBoundary>

            {/* Advanced Analytics & Diagnostics Section */}
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2.5">
                  <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
                  >
                    Advanced Analytics & Diagnostics
                  </span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
                  Feasibility checks, peak usage periods, and system error logs
                </p>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <ErrorBoundary fallback={<PanelErrorFallback title="Feasibility Analytics" />}>
                      <FeasibilityAnalyticsPanel
                        data={feasibilityStats}
                        loading={feasibilityLoading || loading}
                        error={feasibilityError}
                      />
                    </ErrorBoundary>
                  </div>
                  <div className="lg:col-span-1">
                    <ErrorBoundary fallback={<PanelErrorFallback title="Peak Usage" />}>
                      <PeakUsagePanel
                        data={peakUsage}
                        loading={peakUsageLoading || loading}
                        error={peakUsageError}
                      />
                    </ErrorBoundary>
                  </div>
                  <div className="lg:col-span-1">
                    <ErrorBoundary fallback={<PanelErrorFallback title="Error Logs" />}>
                      <ErrorLogsPanel
                        logs={errorLogs}
                        loading={errorLogsLoading || loading}
                        error={errorLogsError}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </section>

            {/* System Health Section */}
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2.5">
                  <div className="h-6 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #0d9488)' }}
                  >
                    System Health Monitor
                  </span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 ml-4">
                  Real-time status of system APIs and services
                </p>
              </div>
              <div className="w-full">
                <ErrorBoundary
                  fallback={<PanelErrorFallback title="System Health" />}
                >
                  <SystemHealthMonitor
                    health={metrics?.systemHealth || null}
                    loading={loading}
                    autoRefresh={autoRefresh}
                    onRefresh={handleRefresh}
                  />
                </ErrorBoundary>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardLayout;

