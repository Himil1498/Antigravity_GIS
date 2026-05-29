import { apiService } from "./api/index";

const api = {
  get: (url: string) => apiService.get(url),
  post: (url: string, data?: any) => apiService.post(url, data),
  put: (url: string, data?: any) => apiService.put(url, data),
  delete: (url: string, config?: any) => apiService.delete(url, config),
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
  map_preferences: Record<string, any>;
}

// ============================================
// USER PERMISSION OPERATIONS
// ============================================

/**
 * Get user's effective permissions (direct + from groups)
 * @param userId - User ID to get permissions for
 */
export const getUserPermissionsAPI = async (
  userId: string | number,
): Promise<EffectivePermissions> => {
  const response = await api.get(`/users/${userId}/permissions`);
  const data = response.data.data;

  // Map backend response to frontend interface
  return {
    direct: data.direct || [],
    directDetails: [], // Backend doesn't return this yet
    fromGroups: data.group || [], // Map 'group' to 'fromGroups'
    groupDetails: [], // Backend doesn't return this yet
    isAdmin: data.role === "admin",
    map_preferences: data.map_preferences || {},
  };
};

/**
 * Update user's direct permissions (replaces all existing)
 * @param userId - User ID to update permissions for
 * @param permissions - Array of permission IDs to assign
 */
export const updateUserPermissionsAPI = async (
  userId: string | number,
  permissions: string[],
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
  permissions: string[],
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
  permissions: string[],
): Promise<void> => {
  await api.delete(`/users/${userId}/permissions/remove`, {
    data: { permissions },
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// ============================================
// NEW TYPES
// ============================================

export interface PermissionCatalogItem {
  category: string;
  code: string;
  name: string;
  description: string;
}

export type PermissionCatalog = Record<string, PermissionCatalogItem[]>;

export interface FolderAccessAssignment {
  id: number;
  user_id: number;
  folder_id: number;
  folder_name: string;
  parent_id?: number | null;
  can_read: boolean;
  can_write: boolean;
  can_edit: boolean;
  can_delete: boolean;
  granted_at: string;
}

// ============================================
// CATALOG OPERATIONS
// ============================================

/**
 * Get the full system permission catalog (grouped by category)
 */
export const getPermissionCatalogAPI = async (): Promise<PermissionCatalog> => {
  const response = await api.get("/users/permissions/catalog");
  return response.data.data; // Backend structure: { success: true, data: { category: [...] } }
};

// ============================================
// FOLDER ACCESS OPERATIONS
// ============================================

/**
 * Get folder access assignments for a user
 */
export const getUserFolderAccessAPI = async (
  userId: string | number,
): Promise<FolderAccessAssignment[]> => {
  const response = await api.get(`/users/${userId}/folders`);
  return response.data.data;
};

/**
 * Assign or Update Folder Access
 * @param access - Object defining rights. If null, use revokeUserFolderAccessAPI
 */
export const assignUserFolderAccessAPI = async (
  userId: string | number,
  folderId: number,
  access: Partial<FolderAccessAssignment>,
): Promise<void> => {
  await api.post(`/users/${userId}/folders`, {
    folderId,
    access,
  });
};

/**
 * Revoke Folder Access
 */
export const revokeUserFolderAccessAPI = async (
  userId: string | number,
  folderId: number,
): Promise<void> => {
  await api.post(`/users/${userId}/folders`, {
    folderId,
    access: null, // Null implies revoke in backend controller
  });
};

// ============================================
// Add New Inventory FOLDER ACCESS OPERATIONS
// ============================================

/**
 * Get folder add access assignments for a user
 */
export const getUserFolderAddAccessAPI = async (
  userId: string | number,
): Promise<FolderAccessAssignment[]> => {
  const response = await api.get(`/users/${userId}/folders/add`);
  return response.data.data;
};

/**
 * Assign or Update Folder Add Access
 */
export const assignUserFolderAddAccessAPI = async (
  userId: string | number,
  folderId: number,
  access: Partial<FolderAccessAssignment>,
): Promise<void> => {
  await api.post(`/users/${userId}/folders/add`, {
    folderId,
    access,
  });
};

/**
 * Revoke Folder Add Access
 */
export const revokeUserFolderAddAccessAPI = async (
  userId: string | number,
  folderId: number,
): Promise<void> => {
  await api.post(`/users/${userId}/folders/add`, {
    folderId,
    access: null,
  });
};

/**
 * Bulk Assign Folder Add Access
 */
export const bulkAssignUserFolderAddAccessAPI = async (
  userId: string | number,
  assignments: {
    folderId: number;
    access: Partial<FolderAccessAssignment> | null;
  }[],
): Promise<void> => {
  await api.post(`/users/${userId}/folders/add`, {
    assignments,
  });
};

// ============================================
// EXISTING HELPERS (Unchanged)
// ============================================
/**
 * Check if user has a specific permission
 * @param userId - User ID to check
 * @param permissionId - Permission ID to check for
 */
export const userHasPermissionAPI = async (
  userId: string | number,
  permissionId: string,
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
    if (perms.direct.includes("*") || perms.fromGroups.includes("*"))
      return true;

    return false;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
};

/**
 * Get all permission IDs for a user (combined direct + groups)
 * @param userId - User ID to get all permissions for
 */
export const getAllUserPermissionIdsAPI = async (
  userId: string | number,
): Promise<string[]> => {
  const perms = await getUserPermissionsAPI(userId);

  // Admin gets wildcard
  if (perms.isAdmin) return ["*"];

  // Combine direct and group permissions (remove duplicates)
  return Array.from(new Set([...perms.direct, ...perms.fromGroups]));
};

/**
 * Bulk Assign Folder Access
 * Helper to update multiple folder permissions in parallel
 */
export const bulkAssignUserFolderAccessAPI = async (
  userId: string | number,
  assignments: {
    folderId: number;
    access: Partial<FolderAccessAssignment> | null;
  }[],
): Promise<void> => {
  // Send all as one batch request
  await api.post(`/users/${userId}/folders`, {
    assignments,
  });
};

