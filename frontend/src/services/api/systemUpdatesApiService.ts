import { apiClient } from './client';

export interface SystemUpdate {
  id: string;
  title: string;
  content: string;
  type: string;
  version_tag: string | null;
  is_published: boolean;
  is_automated: boolean;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

export interface PaginatedUpdates {
  success: boolean;
  data: SystemUpdate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const updatesApi = {
  getPublishedUpdates: async (page = 1, limit = 10): Promise<PaginatedUpdates> => {
    const response = await apiClient.get(`/updates?page=${page}&limit=${limit}`);
    return response.data as PaginatedUpdates;
  },

  getAllUpdatesAdmin: async (): Promise<{ success: boolean; data: SystemUpdate[] }> => {
    const response = await apiClient.get('/updates/admin');
    return response.data as { success: boolean; data: SystemUpdate[] };
  },

  createUpdate: async (data: Partial<SystemUpdate>): Promise<{ success: boolean; data: SystemUpdate }> => {
    const response = await apiClient.post('/updates/admin', data);
    return response.data as { success: boolean; data: SystemUpdate };
  },

  updateSystemUpdate: async (id: string, data: Partial<SystemUpdate>): Promise<{ success: boolean; data: SystemUpdate }> => {
    const response = await apiClient.put(`/updates/admin/${id}`, data);
    return response.data as { success: boolean; data: SystemUpdate };
  },

  deleteUpdate: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/updates/admin/${id}`);
    return response.data as { success: boolean; message: string };
  }
};
