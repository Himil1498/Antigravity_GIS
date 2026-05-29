import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../../store/index";
import type { RecentActivity } from "../types/types";
import type {
  PerformanceData,
  UsageTrendsData,
  TimeRange,
  UsageTimeRange,
} from "../types/dashboardTypes";
import { DashboardMetrics } from "../../../types/dashboard/index";
import { useDashboardDataHelpers } from "../utils/dashboardDataHelpers";
import { showToast } from "../../../utils/toastUtils";

export const useDashboardData = (showAllUsersData: boolean = false) => {
  const { user } = useAppSelector((state) => state.auth);
  const {
    createMockUsers,
    fetchRecentActivities,
    fetchUserStats,
    fetchPerformanceData,
    fetchUsageTrends,
    fetchDashboardAnalytics,
    fetchFeasibilityStats,
    fetchPeakUsage,
    fetchErrorLogs,
    loadDashboardData,
    toolStats,
    computeUserStats,
  } = useDashboardDataHelpers(user?.email, user?.name, user?.role, showAllUsersData);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Real user statistics states
  const [realUserStats, setRealUserStats] = useState<any>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(true);

  // API Performance states
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [selectedPerfTimeRange, setSelectedPerfTimeRange] =
    useState<TimeRange>("24h");

  // Usage Trends states
  const [usageTrendsData, setUsageTrendsData] =
    useState<UsageTrendsData | null>(null);
  const [usageTrendsLoading, setUsageTrendsLoading] = useState(true);
  const [usageTrendsError, setUsageTrendsError] = useState<string | null>(null);
  const [selectedUsageTimeRange, setSelectedUsageTimeRange] =
    useState<UsageTimeRange>("30d");

  // Advanced Analytics states
  const [feasibilityStats, setFeasibilityStats] = useState<any | null>(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(true);
  const [feasibilityError, setFeasibilityError] = useState<string | null>(null);

  const [peakUsage, setPeakUsage] = useState<any[]>([]);
  const [peakUsageLoading, setPeakUsageLoading] = useState(true);
  const [peakUsageError, setPeakUsageError] = useState<string | null>(null);

  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(true);
  const [errorLogsError, setErrorLogsError] = useState<string | null>(null);

  // Regional/Dashboard analytics
  const [totalRegions, setTotalRegions] = useState<number>(0);

  const loadRecent = (isBg = false) =>
    fetchRecentActivities(isBg ? () => {} : setActivitiesLoading, setRecentActivities);
  const loadPerformance = (isBg = false) =>
    fetchPerformanceData(
      selectedPerfTimeRange,
      setPerformanceData,
      isBg ? () => {} : setPerformanceLoading,
      setPerformanceError,
    );
  const loadUsageTrends = (isBg = false) =>
    fetchUsageTrends(
      selectedUsageTimeRange,
      setUsageTrendsData,
      isBg ? () => {} : setUsageTrendsLoading,
      setUsageTrendsError,
    );
  const loadUserStats = (isBg = false) =>
    fetchUserStats(isBg ? () => {} : setUserStatsLoading, setRealUserStats);
    
  const loadFeasibilityStats = (isBg = false) =>
    fetchFeasibilityStats(setFeasibilityStats, isBg ? () => {} : setFeasibilityLoading, setFeasibilityError);
    
  const loadPeakUsage = (isBg = false) =>
    fetchPeakUsage(setPeakUsage, isBg ? () => {} : setPeakUsageLoading, setPeakUsageError);
    
  const loadErrorLogs = (isBg = false) =>
    fetchErrorLogs(setErrorLogs, isBg ? () => {} : setErrorLogsLoading, setErrorLogsError);

  const loadDashboardAnalytics = async () => {
    // Only fetch if helper exists (added to helpers)
    if (fetchDashboardAnalytics) {
      const data = await fetchDashboardAnalytics();
      if (data && data.total_regions !== undefined) {
        setTotalRegions(data.total_regions);
      }
    }
  };

  // Compose helpers with state setters
  const loadData = (isBackgroundRefresh = false) => {
    loadDashboardAnalytics();
    loadDashboardData(
      isBackgroundRefresh ? () => {} : setLoading,
      setRealUsers,
      setMetrics,
      setLastRefresh,
      () => loadRecent(isBackgroundRefresh),
      () => loadPerformance(isBackgroundRefresh),
      () => loadUsageTrends(isBackgroundRefresh),
      () => loadUserStats(isBackgroundRefresh),
      createMockUsers,
    );
    loadFeasibilityStats(isBackgroundRefresh);
    loadPeakUsage(isBackgroundRefresh);
    loadErrorLogs(isBackgroundRefresh);
  };

  // Keep a fresh reference to loadData to avoid stale closure in setInterval
  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  });

  // Initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-refresh every 60 seconds - single unified refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDataRef.current(true); // Pass true to indicate a background refresh
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);



  // Refresh performance data when time range changes
  useEffect(() => {
    loadPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPerfTimeRange]);

  // Refresh usage trends when time range changes
  useEffect(() => {
    loadUsageTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsageTimeRange]);

  // Manual refresh
  const handleRefresh = () => {
    loadData();
    showToast.success({
      title: "Dashboard Synchronized",
      description: "Real-time infrastructure and health data updated successfully."
    });
  };

  // USES MOCK DATA - getToolUsageStats() returns mock tool usage statistics
  const userStats = realUserStats || computeUserStats(realUsers, metrics);

  return {
    // State
    metrics,
    loading,
    autoRefresh,
    lastRefresh,
    recentActivities,
    activitiesLoading,
    totalRegions,
    userStats,
    userStatsLoading,
    performanceData,
    performanceLoading,
    performanceError,
    selectedPerfTimeRange,
    usageTrendsData,
    usageTrendsLoading,
    usageTrendsError,
    selectedUsageTimeRange,
    toolStats,
    feasibilityStats,
    feasibilityLoading,
    feasibilityError,
    peakUsage,
    peakUsageLoading,
    peakUsageError,
    errorLogs,
    errorLogsLoading,
    errorLogsError,

    // Actions
    setAutoRefresh,
    handleRefresh,
    setSelectedPerfTimeRange,
    setSelectedUsageTimeRange,
    fetchPerformanceData: loadPerformance,
    fetchUsageTrends: loadUsageTrends,
  };
};

