import { apiClient } from "../../../services/api/client";
import { FolderContents, NetworkFolder, NetworkFile } from "../types";

const API_Base = "/network-planning";

export const networkPlanningService = {
  getFolderContents: async (
    target: number | string | null | "root",
    includeApprovedOutcomes?: boolean,
    accessType?: "view" | "add",
  ): Promise<FolderContents> => {
    const params: any = {};
    if (typeof target === "number") {
      params.parentId = target;
    } else if (typeof target === "string" && target !== "root") {
      params.path = target;
    } else if (target === "root") {
      params.parentId = "root";
    }
    params._t = new Date().getTime(); // Prevent caching
    if (includeApprovedOutcomes) {
      params.includeApprovedOutcomes = "true";
    }
    if (accessType) {
      params.accessType = accessType;
    }
    const response = await apiClient.get(`${API_Base}/folders`, { params });
    return (response.data as any).data;
  },

  // Cache clearing helper
  clearCatalogCache: () => {
    networkPlanningService._catalogCache = null;
    networkPlanningService._catalogPending = null;
  },

  getWorkspaceTree: async (): Promise<{ folders: NetworkFolder[], files: NetworkFile[] }> => {
    const response = await apiClient.get(`${API_Base}/folders/tree`);
    return (response.data as any).data;
  },

  createFolder: async (
    name: string,
    parentId: number | null,
    defaultIcon?: string,
  ): Promise<NetworkFolder> => {
    const response = await apiClient.post(`${API_Base}/folders`, {
      name,
      parentId,
      defaultIcon,
    });
    networkPlanningService.clearCatalogCache();
    return (response.data as any).data;
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_Base}/folders/${id}`);
    networkPlanningService.clearCatalogCache();
  },

  renameFolder: async (id: number, name: string): Promise<NetworkFolder> => {
    const response = await apiClient.put(`${API_Base}/folders/${id}/rename`, { name });
    networkPlanningService.clearCatalogCache();
    return (response.data as any).data;
  },

  getAllFiles: async (): Promise<any[]> => {
    const response = await apiClient.get(`${API_Base}/all-files`);
    return (response.data as any).data;
  },

  getFile: async (fileId: number): Promise<any> => {
    const response = await apiClient.get(`${API_Base}/files/${fileId}`);
    return (response.data as any).data;
  },

  getMapStats: async (
    regionIds?: number[] | null,
    fileIds?: number[] | null,
  ): Promise<{ total: number }> => {
    const params = new URLSearchParams();
    if (regionIds && regionIds.length > 0) {
      params.append("regionIds", regionIds.join(","));
    }
    if (fileIds && fileIds.length > 0) {
      params.append("fileIds", fileIds.join(","));
    }
    const response = await apiClient.get(`${API_Base}/stats`, { params });
    return (response.data as any).data;
  },

  // Files
  uploadFiles: async (
    folderId: number,
    files: File[],
    iconType: string = "layer-group",
  ): Promise<any> => {
    const formData = new FormData();
    // ✅ Append text fields FIRST so they are available in req.body before files
    formData.append("iconType", iconType);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post(
      `${API_Base}/folders/${folderId}/files?iconType=${iconType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes timeout for large file uploads
      },
    );
    return (response.data as any).data;
  },

  deleteFile: async (fileId: number): Promise<any> => {
    const response = await apiClient.delete(`${API_Base}/files/${fileId}`);
    return response.data;
  },

  async exportCombinedData(options: any) {
    // Requires valid backend endpoint
    const response = await apiClient.post(
      `${API_Base}/export-combined`,
      options,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },

  getFileFeatures: async (
    fileId: number,
    page = 1,
    limit = 50,
    search = "",
    sortBy = "id",
    sortOrder = "ASC",
  ): Promise<any> => {
    const params = { page, limit, search, sortBy, sortOrder };
    const response = await apiClient.get(
      `${API_Base}/files/${fileId}/features`,
      { params },
    );
    return response.data;
  },

  // Global Search
  searchGlobalFeatures: async (searchQuery: string): Promise<any> => {
    const response = await apiClient.get(`${API_Base}/global-search?q=${encodeURIComponent(searchQuery)}`);
    return response.data;
  },

  // Get tile URL with optional filtering
  // fileIds: array of file IDs for server-side filtering (efficient for large datasets)
  // fileId: single file ID (legacy support)
  // regionIds: array of region IDs
  getTileUrl: (
    fileId?: number,
    regionIds?: number[] | null,
    fileIds?: number[],
  ): string => {
    const baseUrl = apiClient.defaults.baseURL || "";
    let url = `${baseUrl}${API_Base}/tiles/{z}/{x}/{y}`;
    const params = new URLSearchParams();

    // Server-side filtering by file IDs (most efficient)
    if (fileIds && fileIds.length > 0) {
      params.append("fileIds", fileIds.join(","));
    } else if (fileId) {
      params.append("fileId", fileId.toString());
    }

    if (regionIds && regionIds.length > 0)
      params.append("regionIds", regionIds.join(","));

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  },

  // In-memory cache for catalog to prevent repeated network calls
  _catalogCache: null as { data: any; timestamp: number; key: string } | null,
  _catalogPending: null as any,

  getUnifiedCatalog: async (
    userId: number,
    regionIds?: number[] | null,
    includeApprovedOutcomes?: boolean,
    isAdmin?: boolean,
  ): Promise<any> => {
    const cacheKey = `${userId}-${regionIds?.join(",") || ""}-${includeApprovedOutcomes || ""}-${isAdmin || ""}`;
    const now = Date.now();

    // Return cached data if fresh (60 second TTL)
    if (
      networkPlanningService._catalogCache &&
      networkPlanningService._catalogCache.key === cacheKey &&
      now - networkPlanningService._catalogCache.timestamp < 60_000
    ) {
      return networkPlanningService._catalogCache.data;
    }

    // Deduplicate in-flight requests (if already fetching, return same promise)
    if (networkPlanningService._catalogPending) {
      return networkPlanningService._catalogPending;
    }

    const params: Record<string, string> = { userId: String(userId) };
    if (regionIds && regionIds.length > 0) {
      params.regionIds = regionIds.join(",");
    }
    if (includeApprovedOutcomes) {
      params.includeApprovedOutcomes = "true";
    }
    if (isAdmin) {
      params.isAdmin = "true";
    }

    const fetchPromise = apiClient.get(`${API_Base}/catalog`, { params })
      .then((response) => {
        const data = (response.data as any).data;
        networkPlanningService._catalogCache = { data, timestamp: Date.now(), key: cacheKey };
        networkPlanningService._catalogPending = null;
        return data;
      })
      .catch((err) => {
        networkPlanningService._catalogPending = null;
        throw err;
      });

    networkPlanningService._catalogPending = fetchPromise;
    return fetchPromise;
  },


  addManualFeature: async (
    folderId: number,
    name: string,
    latitude: number,
    longitude: number,
    properties: any,
    iconType?: string,
  ): Promise<any> => {
    const response = await apiClient.post(`${API_Base}/manual-feature`, {
      folderId,
      name,
      latitude,
      longitude,
      properties,
      iconType,
    });
    networkPlanningService.clearCatalogCache();
    return (response.data as any).data;
  },

  // ============================================================
  // Infrastructure Approval Workflow
  // ============================================================

  submitForApproval: async (
    folderId: number,
    name: string,
    latitude: number,
    longitude: number,
    properties: any,
    iconType?: string,
  ): Promise<any> => {
    const response = await apiClient.post(`${API_Base}/infra-approvals`, {
      folderId,
      name,
      latitude,
      longitude,
      properties,
      iconType,
    });
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  getPendingApprovals: async (): Promise<any[]> => {
    const response = await apiClient.get(`${API_Base}/infra-approvals`);
    return response.data as any[];
  },

  getMySubmissions: async (): Promise<any[]> => {
    const response = await apiClient.get(
      `${API_Base}/infra-approvals/my-submissions`,
    );
    return response.data as any[];
  },

  approveSubmission: async (approvalId: number): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/infra-approvals/${approvalId}/approve`,
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  rejectSubmission: async (
    approvalId: number,
    reason: string,
  ): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/infra-approvals/${approvalId}/reject`,
      { reason },
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  addCircuitId: async (
    approvalId: number,
    circuitId: string,
    activationDate: string,
  ): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/infra-approvals/${approvalId}/circuit`,
      { circuitId, activationDate },
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  resubmitApproval: async (
    approvalId: number,
    updatedData: any,
  ): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/infra-approvals/${approvalId}/resubmit`,
      updatedData,
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  getApprovalHistory: async (): Promise<any[]> => {
    const response = await apiClient.get(
      `${API_Base}/infra-approvals/history`,
    );
    return response.data as any[];
  },

  deleteSubmission: async (approvalId: number): Promise<any> => {
    const response = await apiClient.delete(
      `${API_Base}/infra-approvals/${approvalId}`,
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  editSubmission: async (approvalId: number, formData: Record<string, unknown>): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/infra-approvals/${approvalId}/edit`,
      formData,
    );
    networkPlanningService.clearCatalogCache();
    return response.data;
  },

  // ============================================================
  // Feature CRUD Operations (Edit/Delete)
  // ============================================================

  getFeature: async (featureId: number): Promise<any> => {
    const response = await apiClient.get(`${API_Base}/features/${featureId}`);
    return (response.data as any).data;
  },

  updateFeature: async (featureId: number, updates: any): Promise<any> => {
    const response = await apiClient.put(
      `${API_Base}/features/${featureId}`,
      updates,
    );
    networkPlanningService.clearCatalogCache();
    return (response.data as any).data;
  },

  deleteFeature: async (
    featureId: number,
    deleteLinkedReports: boolean = false,
  ): Promise<{
    success: boolean;
  }> => {
    const response = await apiClient.delete(
      `${API_Base}/features/${featureId}`,
    );
    networkPlanningService.clearCatalogCache();
    return response.data as any;
  },



  // ============================================================
  // Recycle Bin Operations
  // ============================================================

  getRecycleBin: async (): Promise<any[]> => {
    const response = await apiClient.get(`${API_Base}/recycle-bin`);
    return (response.data as any).data;
  },

  restoreItem: async (itemId: number, itemType: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(
      `${API_Base}/recycle-bin/${itemId}/restore`,
      { type: itemType }
    );
    networkPlanningService.clearCatalogCache();
    return response.data as any;
  },

  permanentDeleteItem: async (
    itemId: number,
    itemType: string
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(
      `${API_Base}/recycle-bin/${itemId}?type=${itemType}`,
    );
    networkPlanningService.clearCatalogCache();
    return response.data as any;
  },
  
  emptyRecycleBin: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`${API_Base}/recycle-bin/empty`);
    networkPlanningService.clearCatalogCache();
    return response.data as any;
  },

  deleteRecycleBinByDate: async (dateStr: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`${API_Base}/recycle-bin/delete-by-date?date=${dateStr}`);
    networkPlanningService.clearCatalogCache();
    return response.data as any;
  },

  getPopStateFolders: async (): Promise<{id: number; name: string}[]> => {
    const response = await apiClient.get(`${API_Base}/pop-states`);
    return (response.data as any).data;
  },

  getPopList: async (folderId?: number): Promise<any[]> => {
    const url = folderId
      ? `${API_Base}/pops?folderId=${folderId}`
      : `${API_Base}/pops`;
    const response = await apiClient.get(url);
    return (response.data as any).data;
  },

  getInfraTypeFolders: async (): Promise<{id: number; name: string}[]> => {
    const response = await apiClient.get(`${API_Base}/feasibility/infra-folders`);
    return (response.data as any).data;
  },

  getInfraStateFolders: async (typeId: number): Promise<{id: number; name: string}[]> => {
    const response = await apiClient.get(`${API_Base}/infra-states?typeId=${typeId}`);
    return (response.data as any).data;
  },

  getInfraList: async (folderId: number): Promise<any[]> => {
    const url = `${API_Base}/pops?folderId=${folderId}`;
    const response = await apiClient.get(url);
    return (response.data as any).data;
  },

  checkAutoFeasibility: async (file: File, infraType: string, regionIds: number[], maxDistance?: number, infraFolderId?: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('infraType', infraType);
    if (infraFolderId) {
      formData.append('infraFolderId', infraFolderId.toString());
    }
    if (regionIds && regionIds.length > 0) {
      formData.append('regionIds', JSON.stringify(regionIds));
    }
    if (maxDistance) {
      formData.append('maxDistance', maxDistance.toString());
    }

    const response = await apiClient.post(`${API_Base}/feasibility/check`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
    return response.data;
  },
};