import { apiService } from './api/index';

const api = {
  get: (url: string) => apiService.get(url),
  post: (url: string, data?: any) => apiService.post(url, data),
  put: (url: string, data?: any) => apiService.put(url, data),
  patch: (url: string, data?: any) => apiService.put(url, data),
  delete: (url: string, config?: any) => apiService.delete(url, config)
};

/**
 * Group API Service
 * Connects frontend to backend group management endpoints
 */

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member';
  added_by: number | null;
  added_at: string;
  username?: string;
  full_name?: string;
  email?: string;
}

export interface GroupPermission {
  id: number;
  group_id: number;
  permission_id: string;
  granted_by: number | null;
  granted_at: string;
  granted_by_username?: string;
}

export interface GroupRegion {
  id: number;
  group_id: number;
  region_id: number;
  assigned_by: number | null;
  assigned_at: string;
  name?: string;
  code?: string;
  type?: string;
}

export interface ApiGroup {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_role?: 'owner' | 'admin' | 'member';
}

// ============================================
// GROUP CRUD OPERATIONS
// ============================================

/**
 * Get all groups where user is a member
 */
export const getAllGroupsAPI = async (): Promise<ApiGroup[]> => {
  const response = await api.get('/groups');
  return response.data.groups;
};

/**
 * Get single group by ID
 */
export const getGroupByIdAPI = async (groupId: number): Promise<ApiGroup> => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data.group;
};

/**
 * Create new group
 */
export const createGroupAPI = async (groupData: {
  name: string;
  description?: string;
  is_active?: boolean;
}): Promise<ApiGroup> => {
  const response = await api.post('/groups', groupData);
  return response.data.group;
};

/**
 * Update existing group
 */
export const updateGroupAPI = async (
  groupId: number,
  updates: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }
): Promise<void> => {
  await api.put(`/groups/${groupId}`, updates);
};

/**
 * Delete group
 */
export const deleteGroupAPI = async (groupId: number): Promise<void> => {
  await api.delete(`/groups/${groupId}`);
};

// ============================================
// GROUP MEMBERS
// ============================================

/**
 * Get all members of a group
 */
export const getGroupMembersAPI = async (
  groupId: number
): Promise<GroupMember[]> => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data.members;
};

/**
 * Add member to group
 */
export const addGroupMemberAPI = async (
  groupId: number,
  userId: number,
  role: 'member' | 'admin' = 'member'
): Promise<void> => {
  await api.post(`/groups/${groupId}/members`, { user_id: userId, role });
};

/**
 * Remove member from group
 */
export const removeGroupMemberAPI = async (
  groupId: number,
  userId: number
): Promise<void> => {
  await api.delete(`/groups/${groupId}/members/${userId}`);
};

/**
 * Update member role
 */
export const updateMemberRoleAPI = async (
  groupId: number,
  userId: number,
  role: 'member' | 'admin'
): Promise<void> => {
  await api.patch(`/groups/${groupId}/members/${userId}`, { role });
};

// ============================================
// GROUP PERMISSIONS
// ============================================

/**
 * Get permissions assigned to a group
 */
export const getGroupPermissionsAPI = async (
  groupId: number
): Promise<{ permissions: string[]; details: GroupPermission[] }> => {
  const response = await api.get(`/groups/${groupId}/permissions`);
  return response.data;
};

/**
 * Update group permissions
 */
export const updateGroupPermissionsAPI = async (
  groupId: number,
  permissions: string[]
): Promise<void> => {
  await api.put(`/groups/${groupId}/permissions`, { permissions });
};

// ============================================
// GROUP REGIONS
// ============================================

/**
 * Get regions assigned to a group
 */
export const getGroupRegionsAPI = async (
  groupId: number
): Promise<GroupRegion[]> => {
  const response = await api.get(`/groups/${groupId}/regions`);
  return response.data.regions;
};

/**
 * Update group region assignments
 */
export const updateGroupRegionsAPI = async (
  groupId: number,
  regionIds: number[]
): Promise<void> => {
  await api.put(`/groups/${groupId}/regions`, { regionIds });
};

