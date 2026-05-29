import { useCallback, useEffect } from "react";
import { apiService } from '../../../services/api/index';
import { getDashboardMetrics } from '../../../services/metrics/index';
import {
  getToolUsageStats,
  getUserStatistics,
  initializeAnalyticsSession,
} from '../../../services/analytics/index';
import { DashboardMetrics } from '../../../types/dashboard/index';
import type { RecentActivity } from '../types/types';
import type {
  PerformanceData,
  TimeRange,
  UsageTimeRange,
  UsageTrendsData,
} from '../types/dashboardTypes';

export const useDashboardDataHelpers = (userEmail?: string, userName?: string, userRole?: string, showAllUsersData = false) => {
  const createMockUsers = useCallback((): any[] => {
    const currentUser = {
      id: "1",
      username: userEmail?.split("@")[0] || "admin",
      name: userName || "Admin User",
      email: userEmail || "admin@example.com",
      password: "********",
      gender: "Other",
      phoneNumber: "+91-9876543210",
      address: {
        street: "123 Main Street",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
      },
      officeLocation: "Head Office",
      assignedUnder: [],
      role: (userRole || "Admin") as "Admin" | "Manager" | "Technician" | "User",
      assignedRegions: ["Delhi", "Mumbai", "Bangalore"],
      status: "Active" as const,
      loginHistory: [{ timestamp: new Date(), location: "Delhi" }],
    };

    const additionalUsers = Array.from({ length: 124 }, (_, i) => ({
      id: `user-${i + 2}`,
      username: `user${i + 2}`,
      name: `User ${i + 2}`,
      email: `user${i + 2}@example.com`,
      password: "********",
      gender: i % 2 === 0 ? "Male" : "Female",
      phoneNumber: `+91-98765${43210 + i}`,
      address: {
        street: `${i + 1} Street`,
        city: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"][i % 5],
        state: ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal"][i % 5],
        pincode: `${110001 + i}`,
      },
      officeLocation: ["Delhi Office", "Mumbai Office", "Bangalore Office"][i % 3],
      assignedUnder: ["1"],
      role: "user" as const,
      assignedRegions: [["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"][i % 5]],
      status: "Active" as const,
      loginHistory: [],
    }));

    return [currentUser, ...additionalUsers];
  }, [userEmail, userName, userRole]);

  const fetchRecentActivities = useCallback(
    async (setLoading: (v: boolean) => void, setData: (v: RecentActivity[]) => void) => {
      try {
        setLoading(true);
        const response = await apiService.get(`/analytics/recent-activity?limit=10&global=${showAllUsersData}`);
        if (response.data && response.data.success) {
          setData(response.data.data.activities);
        }
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUserStats = useCallback(
    async (
      setLoading: (v: boolean) => void,
      setData: (v: any) => void
    ) => {
      try {
        setLoading(true);
        const response = await apiService.get(`/analytics/user-stats?global=${showAllUsersData}`);
        if (response.data && response.data.success) {
          const data = response.data.data;
          const transformedStats = {
            total: data.total,
            active: data.active,
            inactive: data.total - data.active,
            newThisWeek: data.newThisWeek,
            loggedIn: data.onlineUsers || [],
            trend: {
              daily: data.activityTrend?.map((t: any) => t.activeUsers) || [0, 0, 0, 0, 0, 0, 0],
            },
            currentlyOnline: data.currentlyOnline,
          };
          setData(transformedStats);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPerformanceData = useCallback(
    async (
      timeRange: TimeRange,
      setData: (v: PerformanceData | null) => void,
      setLoading: (v: boolean) => void,
      setError: (v: string | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/analytics/performance?timeRange=${timeRange}&global=${showAllUsersData}`);
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to load performance data");
        }
      } catch (err: any) {
        console.error("Error fetching performance data:", err);
        setError(err.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUsageTrends = useCallback(
    async (
      timeRange: UsageTimeRange,
      setData: (v: UsageTrendsData | null) => void,
      setLoading: (v: boolean) => void,
      setError: (v: string | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/analytics/usage-trends?timeRange=${timeRange}&global=${showAllUsersData}`);
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to load usage trends");
        }
      } catch (err: any) {
        console.error("Error fetching usage trends:", err);
        setError(err.message || "Failed to load usage trends");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadDashboardData = useCallback(
    async (
      setLoading: (v: boolean) => void,
      setRealUsers: (v: any[]) => void,
      setMetrics: (v: DashboardMetrics | null) => void,
      setLastRefresh: (v: Date) => void,
      fetchRecent: () => Promise<void>,
      fetchPerf: () => Promise<void>,
      fetchUsage: () => Promise<void>,
      fetchUsers: () => Promise<void>,
      mockUsers: () => any[]
    ) => {
      try {
        setLoading(true);
        // We NO LONGER fetch 1000 users from the backend via getAllUsers() 
        // because it executes a massive unoptimized SQL JOIN query that slows down the entire dashboard.
        // We use mockUsers instantly for the mock getDashboardMetrics to preserve structure.
        // The real user statistics (active/inactive/total) are already fetched properly via fetchUserStats (/analytics/user-stats).
        const usersData = mockUsers();
        setRealUsers(usersData);

        // Run metrics and parallel fetches independently so a metrics
        // failure never blocks performance/health data from loading
        const metricsPromise = getDashboardMetrics(usersData)
          .then((m) => setMetrics(m))
          .catch((err) => console.error("Error loading dashboard metrics:", err));

        const panelPromise = Promise.all([
          fetchRecent(),
          fetchPerf(),
          fetchUsage(),
          fetchUsers(),
        ]).catch((err) => console.error("Error loading dashboard panels:", err));

        await Promise.all([metricsPromise, panelPromise]);
        setLastRefresh(new Date());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toolStats = getToolUsageStats();
  const computeUserStats = (realUsers: any[], metrics: DashboardMetrics | null) =>
    metrics ? getUserStatistics(realUsers.length > 0 ? realUsers : createMockUsers()) : null;

  useEffect(() => {
    initializeAnalyticsSession();
  }, []);

  const fetchDashboardAnalytics = useCallback(async () => {
    try {
      const response = await apiService.get(`/analytics/dashboard`);
      if (response.data && response.data.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      return null;
    }
  }, []);

  const fetchFeasibilityStats = useCallback(
    async (
      setData: (v: any | null) => void,
      setLoading: (v: boolean) => void,
      setError: (v: string | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/analytics/feasibility`);
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to load feasibility stats");
        }
      } catch (err: any) {
        console.error("Error fetching feasibility stats:", err);
        setError(err.message || "Failed to load feasibility stats");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPeakUsage = useCallback(
    async (
      setData: (v: any[]) => void,
      setLoading: (v: boolean) => void,
      setError: (v: string | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/analytics/peak-usage`);
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to load peak usage data");
        }
      } catch (err: any) {
        console.error("Error fetching peak usage:", err);
        setError(err.message || "Failed to load peak usage data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchErrorLogs = useCallback(
    async (
      setData: (v: any[]) => void,
      setLoading: (v: boolean) => void,
      setError: (v: string | null) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/analytics/error-logs?limit=50`);
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to load error logs");
        }
      } catch (err: any) {
        console.error("Error fetching error logs:", err);
        setError(err.message || "Failed to load error logs");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
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
  };
};


