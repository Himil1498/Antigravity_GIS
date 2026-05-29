/**
 * Analytics API Service
 * System analytics and performance data retrieval
 */

import { apiClient } from "./client";
import type { ApiResponse } from "./types";
import type { AnalyticsMetric, PerformanceData } from "../../store/slices/analytics/index";

// Re-export analytics types
export type { AnalyticsMetric, PerformanceData };

export const analyticsApiService = {
  async getAnalytics(timeRange: {
    start: string;
    end: string;
  }): Promise<AnalyticsMetric[]> {
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    const response = await apiClient.get<ApiResponse<AnalyticsMetric[]>>(
      "/analytics",
      { params: timeRange }
    );
    return response.data.data;
  },

  async getPerformanceData(timeRange: {
    start: string;
    end: string;
  }): Promise<PerformanceData[]> {
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    const response = await apiClient.get<ApiResponse<PerformanceData[]>>(
      "/analytics/performance",
      { params: timeRange }
    );
    return response.data.data;
  },
};

