/**
 * File Service
 * File upload, import/export, and processing operations
 */

import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export const fileService = {
  async uploadFile(
    file: File,
    type: "towers" | "coverage" | "analytics"
  ): Promise<{ jobId: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    if (process.env.NODE_ENV === "development") {
      return { jobId: `job_${Date.now()}` };
    }

    const response = await apiClient.post<ApiResponse<{ jobId: string }>>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },

  async exportData(
    type: "towers" | "coverage" | "analytics",
    format: "csv" | "excel" | "json",
    filters?: any
  ): Promise<Blob> {
    if (process.env.NODE_ENV === "development") {
      return new Blob(["mock,data\n1,test"], { type: "text/csv" });
    }

    const response = await apiClient.post(
      `/export/${type}`,
      { format, filters },
      { responseType: "blob" }
    );

    return response.data as Blob;
  },

  async exportUsers(
    format: "csv" | "excel" | "json",
    filters?: any
  ): Promise<Blob> {
    if (process.env.NODE_ENV === "development") {
      return new Blob(["user,email\nTest User,test@example.com"], {
        type: "text/csv",
      });
    }

    const response = await apiClient.post(
      `/users/export`,
      { format, filters },
      { responseType: "blob" }
    );

    return response.data as Blob;
  },

  async importUsers(
    file: File
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);

    if (process.env.NODE_ENV === "development") {
      return { success: 10, failed: 0, errors: [] };
    }

    const response = await apiClient.post<
      ApiResponse<{ success: number; failed: number; errors: string[] }>
    >("/users/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};

