
import apiClient from './apiClient';
import {
  BoundaryResponse,
  BoundaryHistoryResponse
} from './types';

// ========================================
// Region Boundary APIs
// ========================================

/**
 * Get current active boundary for a region
 */
export const getRegionBoundary = async (regionId: number): Promise<BoundaryResponse> => {
  const response = await apiClient.get<BoundaryResponse>(`/regions/${regionId}/boundary`);
  return response.data;
};

/**
 * Get all boundary versions (history) for a region (admin/manager only)
 */
export const getRegionBoundaryHistory = async (regionId: number): Promise<BoundaryHistoryResponse> => {
  const response = await apiClient.get<BoundaryHistoryResponse>(`/regions/${regionId}/boundaries`);
  return response.data;
};

/**
 * Update region boundary (creates new version) (admin/manager only)
 */
export const updateRegionBoundary = async (
  regionId: number,
  boundaryGeojson: any,
  changeReason?: string
): Promise<BoundaryResponse> => {
  const response = await apiClient.put<BoundaryResponse>(`/regions/${regionId}/boundary`, {
    boundaryGeoJSON: boundaryGeojson, // Backend expects capital JSON
    changeReason,
    source: 'Manual Edit',
  });
  return response.data;
};

/**
 * Get boundary change history (admin/manager only)
 */
export const getBoundaryChangeHistory = async (regionId: number): Promise<any> => {
  const response = await apiClient.get(`/regions/${regionId}/boundary-changes`);
  return response.data;
};

/**
 * Revert boundary to a previous version (admin only)
 */
export const revertBoundaryToVersion = async (
  regionId: number,
  version: number,
  reason?: string
): Promise<BoundaryResponse> => {
  const response = await apiClient.post<BoundaryResponse>(
    `/regions/${regionId}/boundary/revert/${version}`,
    { reason }
  );
  return response.data;
};

/**
 * Get overall boundary statistics (Published vs Draft counts)
 */
export const getBoundaryStats = async (): Promise<{ success: boolean; stats: { publishedCount: number; draftCount: number; totalRegions: number } }> => {
  const response = await apiClient.get<{ success: boolean; stats: { publishedCount: number; draftCount: number; totalRegions: number } }>('/regions/boundary-stats');
  return response.data;
};

