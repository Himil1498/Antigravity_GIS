
import apiClient from './apiClient';
import {
  Region,
  RegionsResponse,
  RegionResponse
} from './types';

// ========================================
// Region CRUD APIs
// ========================================

/**
 * Get all regions
 */
export const getAllRegions = async (): Promise<RegionsResponse> => {
  const response = await apiClient.get<RegionsResponse>('/regions');
  return response.data;
};

/**
 * Get region hierarchy
 */
export const getRegionHierarchy = async (): Promise<any> => {
  const response = await apiClient.get('/regions/hierarchy');
  return response.data;
};

/**
 * Get region by ID
 */
export const getRegionById = async (id: number): Promise<RegionResponse> => {
  const response = await apiClient.get<RegionResponse>(`/regions/${id}`);
  return response.data;
};

/**
 * Create new region (admin only)
 */
export const createRegion = async (data: Partial<Region>): Promise<RegionResponse> => {
  const response = await apiClient.post<RegionResponse>('/regions', data);
  return response.data;
};

/**
 * Update region (admin only)
 */
export const updateRegion = async (id: number, data: Partial<Region>): Promise<RegionResponse> => {
  const response = await apiClient.put<RegionResponse>(`/regions/${id}`, data);
  return response.data;
};

/**
 * Delete region (admin only)
 */
export const deleteRegion = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/regions/${id}`);
  return response.data;
};

/**
 * Get child regions
 */
export const getChildRegions = async (id: number): Promise<RegionsResponse> => {
  const response = await apiClient.get<RegionsResponse>(`/regions/${id}/children`);
  return response.data;
};

/**
 * Get users in region (admin/manager only)
 */
export const getRegionUsers = async (id: number): Promise<any> => {
  const response = await apiClient.get(`/regions/${id}/users`);
  return response.data;
};

