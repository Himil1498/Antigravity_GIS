/**
 * Coverage Service
 * Network coverage data operations
 */

import { apiClient } from "./client";
import type { ApiResponse, NetworkCoverage } from "./types";

export const coverageService = {
  async getCoverage(towerId?: string): Promise<NetworkCoverage[]> {
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    const params = towerId ? { towerId } : {};
    const response = await apiClient.get<ApiResponse<NetworkCoverage[]>>(
      "/coverage",
      { params }
    );
    return response.data.data;
  },
};

