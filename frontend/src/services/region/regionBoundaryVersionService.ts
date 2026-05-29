
import apiClient from './apiClient';
import {
  BoundaryVersionsResponse,
  DraftBoundaryResponse,
  ImpactAnalysisResponse,
  PublishResponse
} from './types';

// ========================================
// Draft/Published Boundary Versioning APIs
// ========================================

/**
 * Get all boundary versions (draft + published + archived) for a region
 */
export const getRegionBoundaryVersions = async (regionId: number): Promise<BoundaryVersionsResponse> => {
  const response = await apiClient.get<BoundaryVersionsResponse>(`/regions/${regionId}/boundaries`);
  return response.data;
};

/**
 * Get current draft boundary for a region (if exists)
 */
export const getDraftBoundary = async (regionId: number): Promise<DraftBoundaryResponse> => {
  const response = await apiClient.get<DraftBoundaryResponse>(`/regions/${regionId}/boundary-version/draft`);
  return response.data;
};

/**
 * Create or update draft boundary for a region
 */
export const createOrUpdateDraft = async (
  regionId: number,
  boundaryGeoJSON: any,
  changeReason?: string,
  notes?: string,
  source?: string
): Promise<any> => {
  const response = await apiClient.post(`/regions/${regionId}/boundary-version/draft`, {
    boundaryGeoJSON,
    changeReason,
    notes,
    source
  });
  return response.data;
};

/**
 * Discard draft boundary for a region
 */
export const discardDraft = async (regionId: number): Promise<any> => {
  const response = await apiClient.delete(`/regions/${regionId}/boundary-version/draft`);
  return response.data;
};

/**
 * Create a new draft from an existing published version for editing
 */
export const createDraftFromVersion = async (regionId: number, versionId: number): Promise<any> => {
  const response = await apiClient.post(`/regions/${regionId}/boundary-version/${versionId}/edit`);
  return response.data;
};

/**
 * Delete a specific boundary version (draft or published)
 */
export const deleteBoundaryVersion = async (
  regionId: number,
  versionId: number,
  deleteReason?: string
): Promise<any> => {
  const response = await apiClient.delete(`/regions/${regionId}/boundary-version/${versionId}`, {
    data: { deleteReason }
  } as any);
  return response.data;
};

/**
 * Analyze impact of publishing draft boundary
 */
export const analyzeImpact = async (regionId: number): Promise<ImpactAnalysisResponse> => {
  const response = await apiClient.post<ImpactAnalysisResponse>(
    `/regions/${regionId}/boundary-version/draft/analyze-impact`
  );
  return response.data;
};

/**
 * Publish draft boundary and migrate all infrastructure items
 */
export const publishDraftBoundary = async (
  regionId: number,
  publishReason?: string,
  notifyUsers: boolean = true
): Promise<PublishResponse> => {
  const response = await apiClient.post<PublishResponse>(
    `/regions/${regionId}/boundary-version/draft/publish`,
    { publishReason, notifyUsers }
  );
  return response.data;
};

/**
 * Rollback to a previous boundary version (within 30 days)
 */
export const rollbackBoundaryVersion = async (
  regionId: number,
  versionId: number,
  rollbackReason?: string
): Promise<any> => {
  const response = await apiClient.post(
    `/regions/${regionId}/boundary-version/${versionId}/rollback`,
    { rollbackReason }
  );
  return response.data;
};

/**
 * Get infrastructure region change history for a region
 */
export const getInfrastructureHistory = async (
  regionId: number,
  limit: number = 50,
  offset: number = 0
): Promise<any> => {
  const response = await apiClient.get(
    `/regions/${regionId}/infrastructure-history?limit=${limit}&offset=${offset}`
  );
  return response.data;
};

/**
 * Unpublish (archive) the current published boundary
 */
export const unpublishBoundary = async (
  regionId: number,
  unpublishReason?: string
): Promise<any> => {
  const response = await apiClient.delete(
    `/regions/${regionId}/boundary`,
    { data: { unpublishReason } } as any
  );
  return response.data;
};

/**
 * Delete ALL boundary data for a region (all versions, history, etc.)
 */
export const deleteAllBoundaryData = async (
  regionId: number,
  deleteReason: string
): Promise<any> => {
  const response = await apiClient.delete(
    `/regions/${regionId}/boundary-data`,
    { data: { deleteReason } } as any
  );
  return response.data;
};

