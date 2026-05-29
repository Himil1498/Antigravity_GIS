
import { apiService } from '../api/index';

const api = {
  get: (url: string) => apiService.get(url),
  post: (url: string, data?: any) => apiService.post(url, data),
  put: (url: string, data?: any) => apiService.put(url, data),
  delete: (url: string, config?: any) => apiService.delete(url, config)
};

/**
 * User Permission API Service
 * Manages individual user permissions (direct permissions)
 * Admin/Manager can assign permissions to specific users
 */

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface UserPermissionDetail {
  permission_id: string;
  granted_at: string;
  granted_by: number | null;
}

export interface GroupPermissionDetail {
  permission_id: string;
  group_name: string;
  granted_at: string;
}

export interface EffectivePermissions {
  direct: string[];
  directDetails: UserPermissionDetail[];
  fromGroups: string[];
  groupDetails: GroupPermissionDetail[];
  isAdmin: boolean;
}

// ============================================
// USER PERMISSION OPERATIONS
// ============================================

/**
 * Get user's effective permissions (direct + from groups)
 * @param userId - User ID to get permissions for
 */
export const getUserPermissionsAPI = async (
  userId: string | number
): Promise<EffectivePermissions> => {
  const response = await api.get(`/users/${userId}/permissions`);
  return response.data.permissions;
};

/**
 * Update user's direct permissions (replaces all existing)
 * @param userId - User ID to update permissions for
 * @param permissions - Array of permission IDs to assign
 */
export const updateUserPermissionsAPI = async (
  userId: string | number,
  permissions: string[]
): Promise<void> => {
  await api.put(`/users/${userId}/permissions`, { permissions });
};

/**
 * Add specific permissions to user (keeps existing)
 * @param userId - User ID to add permissions to
 * @param permissions - Array of permission IDs to add
 */
export const addUserPermissionsAPI = async (
  userId: string | number,
  permissions: string[]
): Promise<void> => {
  await api.post(`/users/${userId}/permissions/add`, { permissions });
};

/**
 * Remove specific permissions from user
 * @param userId - User ID to remove permissions from
 * @param permissions - Array of permission IDs to remove
 */
export const removeUserPermissionsAPI = async (
  userId: string | number,
  permissions: string[]
): Promise<void> => {
  await api.delete(`/users/${userId}/permissions/remove`, {
    data: { permissions }
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user has a specific permission
 * @param userId - User ID to check
 * @param permissionId - Permission ID to check for
 */
export const userHasPermissionAPI = async (
  userId: string | number,
  permissionId: string
): Promise<boolean> => {
  try {
    const perms = await getUserPermissionsAPI(userId);

    // Admin has all permissions
    if (perms.isAdmin) return true;

    // Check direct permissions
    if (perms.direct.includes(permissionId)) return true;

    // Check group permissions
    if (perms.fromGroups.includes(permissionId)) return true;

    // Check wildcard permissions
    if (perms.direct.includes('*') || perms.fromGroups.includes('*')) return true;

    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

/**
 * Get all permission IDs for a user (combined direct + groups)
 * @param userId - User ID to get all permissions for
 */
export const getAllUserPermissionIdsAPI = async (
  userId: string | number
): Promise<string[]> => {
  const perms = await getUserPermissionsAPI(userId);

  // Admin gets wildcard
  if (perms.isAdmin) return ['*'];

  // Combine direct and group permissions (remove duplicates)
  return Array.from(new Set([...perms.direct, ...perms.fromGroups]));
};

export default {
  getUserPermissionsAPI,
  updateUserPermissionsAPI,
  addUserPermissionsAPI,
  removeUserPermissionsAPI,
  userHasPermissionAPI,
  getAllUserPermissionIdsAPI
};

