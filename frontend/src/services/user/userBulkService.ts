
import { User } from '../../types/auth/index';
import apiClient from './userApiClient';
import { BulkOperationResponse, BulkAssignRegionsResponse } from './types';
import { extractNumericId, transformFrontendUser } from './utils';

/**
 * Bulk create users
 */
export async function bulkCreateUsers(users: Partial<User>[]): Promise<BulkOperationResponse> {
  try {
    // Transform all users to backend format
    const backendUsers = users.map(user => ({
      ...transformFrontendUser(user),
      password: user.password || 'ChangeMe@123'
    }));

    const response = await apiClient.post<BulkOperationResponse>('/users/bulk-create', {
      users: backendUsers
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create users');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error bulk creating users:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create users');
  }
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(ids: string[]): Promise<BulkOperationResponse> {
  try {
    const numericIds = ids.map(id => parseInt(extractNumericId(id)));
    const response = await apiClient.request<BulkOperationResponse>({
      method: 'DELETE',
      url: '/users/bulk-delete',
      data: { user_ids: numericIds } as any
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete users');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error bulk deleting users:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete users');
  }
}

/**
 * Bulk update user status
 */
export async function bulkUpdateStatus(ids: string[], status: 'Active' | 'Inactive'): Promise<BulkOperationResponse> {
  try {
    const numericIds = ids.map(id => parseInt(extractNumericId(id)));
    const response = await apiClient.patch<BulkOperationResponse>('/users/bulk-status', {
      user_ids: numericIds,
      is_active: status === 'Active'
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user status');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error bulk updating status:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update user status');
  }
}

/**
 * Bulk assign regions to multiple users
 */
export async function bulkAssignRegions(
  userIds: string[],
  regionNames: string[],
  action: 'assign' | 'revoke' | 'replace' = 'assign'
): Promise<{ success: boolean; message: string; affectedUsers: number }> {
  try {
    const numericIds = userIds.map(id => parseInt(extractNumericId(id)));
    const response = await apiClient.post<BulkAssignRegionsResponse>('/users/bulk-assign-regions', {
      user_ids: numericIds,
      region_names: regionNames,
      action
    });

    const data = response.data as BulkAssignRegionsResponse;
    if (!data.success) {
      throw new Error(data.message || 'Failed to bulk assign regions');
    }

    return data;
  } catch (error: any) {
    console.error('Error bulk assigning regions:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to bulk assign regions');
  }
}


