
import { User } from '../../types/auth/index';
import apiClient from './userApiClient';
import { BackendUserResponse, BackendUsersListResponse } from './types';
import { extractNumericId, transformBackendUser, transformFrontendUser } from './utils';

/**
 * Get all users from backend
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    // Fetch with large limit to get all users (not just 10)
    const response = await apiClient.get<BackendUsersListResponse>('/users', {
      params: {
        limit: 1000, // Fetch up to 1000 users
        page: 1
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch users');
    }

    return response.data.users.map(transformBackendUser);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const numericId = extractNumericId(id);
    const response = await apiClient.get<BackendUserResponse>(`/users/${numericId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }

    return transformBackendUser(response.data.user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
  }
}

/**
 * Create new user
 */
export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    // Transform to backend format
    const backendData = transformFrontendUser(userData);

    // Add password if provided (only for create)
    const createData = {
      ...backendData,
      password: userData.password || 'ChangeMe@123' // Default password if not provided
    };

    const response = await apiClient.post<BackendUserResponse>('/users', createData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create user');
    }

    return transformBackendUser(response.data.user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create user');
  }
}

/**
 * Update existing user
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const numericId = extractNumericId(id);
    // Transform to backend format
    const backendData = transformFrontendUser(userData);

    const response = await apiClient.put<BackendUserResponse>(`/users/${numericId}`, backendData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user');
    }

    return transformBackendUser(response.data.user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update user');
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const numericId = extractNumericId(id);
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/users/${numericId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete user');
  }
}

/**
 * Update user status (Active/Inactive)
 */
export async function updateUserStatus(id: string, status: 'Active' | 'Inactive'): Promise<User> {
  try {
    const response = await apiClient.patch<BackendUserResponse>(`/users/${id}/status`, {
      is_active: status === 'Active'
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user status');
    }

    return transformBackendUser(response.data.user);
  } catch (error: any) {
    console.error('Error updating user status:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update user status');
  }
}

/**
 * Search users (if search API exists)
 */
export async function searchUsers(query: string): Promise<User[]> {
  try {
    // If backend has search API, use it
    // Otherwise, get all and filter on frontend
    const allUsers = await getAllUsers();

    const lowerQuery = query.toLowerCase();
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery)
    );
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to search users');
  }
}

/**
 * Get user activity history
 */
export async function getUserActivity(userId: string): Promise<any[]> {
  try {
    const numericId = extractNumericId(userId);
    const response = await apiClient.get<{ success: boolean; logs: any[] }>(
      `/audit/user/${numericId}?days=30&limit=50`
    );
    return response.data.logs || [];
  } catch (error: any) {
    console.warn("Failed to fetch user activity", error);
    return [];
  }
}


