/**
 * Search Service
 * Search and data retrieval operations
 */

import { apiClient } from "./client";

export const searchService = {
  async searchSavedData(
    query: string,
    userId?: number
  ): Promise<{
    success: boolean;
    results: {
      infrastructure: any[];
      measurements: any[];
      polygons: any[];
      circles: any[];
      elevations: any[];
      sectors: any[];
    };
    searchedUser?: any;
    totalResults: number;
  }> {
    const params: any = { q: query };
    if (userId) {
      params.userId = userId;
    }

    const response = await apiClient.get<{
      success: boolean;
      results: {
        infrastructure: any[];
        measurements: any[];
        polygons: any[];
        circles: any[];
        elevations: any[];
        sectors: any[];
      };
      searchedUser?: any;
      totalResults: number;
    }>("/search/saved-data", { params });

    return response.data;
  },

  async getSearchHistory(limit: number = 20): Promise<{
    success: boolean;
    history: Array<{
      id: number;
      query: string;
      created_at: string;
    }>;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      history: Array<{
        id: number;
        query: string;
        created_at: string;
      }>;
    }>("/search/history", { params: { limit } });

    return response.data;
  },

  async deleteSearchHistory(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/search/history/${id}`);

    return response.data;
  },

  async deleteSingleData(
    type: string,
    id: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/datahub/delete/${type}/${id}`);
    return response.data;
  },

  async deleteBulkData(
    type: string,
    userId?: number
  ): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    const response: any = await apiClient.request({
      method: "DELETE",
      url: `/datahub/delete-bulk/${type}`,
      data: userId ? { userId } : undefined,
    });
    return response.data;
  },

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }> {
    try {
      const response = await apiClient.get<{
        status: string;
        timestamp: string;
        version: string;
      }>("/health");
      return response.data;
    } catch {
      return {
        status:
          process.env.NODE_ENV === "development" ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }
  },
};

