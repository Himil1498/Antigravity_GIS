/**
 * API Service - Barrel Exports
 * Unified API service combining all domain services
 */

import { authService } from "./authService";
import { mfaService } from "./mfaService";
import { towerService } from "./towerService";
import { coverageService } from "./coverageService";
import { analyticsApiService } from "./analyticsApiService";
import { userService } from "./userService";
import { fileService } from "./fileService";

import { searchService } from "./searchService";
import { apiClient } from "./client";

// Compose the unified API service
export const apiService = {
  ...authService,
  ...mfaService,
  ...towerService,
  ...coverageService,
  ...analyticsApiService,
  ...userService,
  ...fileService,

  ...searchService,

  // Generic HTTP methods
  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const response = await apiClient.get<T>(url, config);
    return { data: response.data };
  },

  async post<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    const response = await apiClient.post<T>(url, data, config);
    return { data: response.data };
  },

  async put<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    const response = await apiClient.put<T>(url, data, config);
    return { data: response.data };
  },

  async patch<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    const response = await apiClient.patch<T>(url, data, config);
    return { data: response.data };
  },

  async delete<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const response = await apiClient.delete<T>(url, config);
    return { data: response.data };
  },
};

// Default export
export default apiService;

// Export individual methods for direct import (backward compatibility)
export const {
  login,
  logout,
  changePassword,
  refreshToken,
  verifyToken,
  getCurrentUserProfile,
} = authService;

export const {
  verify2FACode,
  send2FACode,
  enable2FA,
  verifyAndEnable2FA,
  disable2FA,
  get2FAStatus,
  adminForce2FA,
  adminDisable2FA,
} = mfaService;

export const {
  getTowers,
  getTowerById,
  createTower,
  updateTower,
  deleteTower,
} = towerService;

export const { getCoverage } = coverageService;

export const { getAnalytics, getPerformanceData } = analyticsApiService;

export const { uploadFile, exportData, exportUsers, importUsers } = fileService;

export const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkUpdateUsers,
  bulkDeleteUsers,
  resetPassword,
  getUsersList,
} = userService;

export const {
  searchSavedData,
  getSearchHistory,
  deleteSearchHistory,
  deleteSingleData,
  deleteBulkData,
  healthCheck,
} = searchService;

