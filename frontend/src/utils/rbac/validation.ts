
import type { User } from '../../types/auth/index';
import type { Permission } from '../../types/common/index';
import { rolesMatch } from '../userHelpers';
import { hasAnyRole, hasPermission } from './helpers';

/**
 * Check if a user can manage another user (based on hierarchy)
 */
export const canManageUser = (manager: User | null, targetUser: User): boolean => {
  if (!manager) return false;

  // Admin can manage everyone
  if (rolesMatch(manager.role, 'Admin')) return true;

  // Can't manage yourself
  if (manager.id === targetUser.id) return false;

  // Manager can manage users in their hierarchy
  if (rolesMatch(manager.role, 'Manager')) {
    // Check if target user is assigned under the manager
    return targetUser.assignedUnder.includes(manager.id);
  }

  return false;
};

/**
 * Check if a user can access a specific region
 */
export const canAccessRegion = (user: User | null, region: string): boolean => {
  if (!user) return false;

  // Admin can access all regions
  if (rolesMatch(user.role, 'Admin')) return true;

  // Check if user is assigned to the region
  return user.assignedRegions.includes(region);
};

/**
 * Check if a user is active
 */
export const isUserActive = (user: User | null): boolean => {
  if (!user) return false;
  return user.status === 'Active';
};

/**
 * Filter users that the current user can manage
 */
export const filterManageableUsers = (currentUser: User | null, users: User[]): User[] => {
  if (!currentUser) return [];

  // Admin can manage all users
  if (rolesMatch(currentUser.role, 'Admin')) {
    return users;
  }

  // Filter users based on management hierarchy
  return users.filter(user => canManageUser(currentUser, user));
};

/**
 * Get user's accessible regions
 */
export const getAccessibleRegions = (user: User | null, allRegions: string[]): string[] => {
  if (!user) return [];

  // Admin can access all regions
  if (rolesMatch(user.role, 'Admin')) {
    return allRegions;
  }

  return user.assignedRegions;
};

/**
 * Validate if an action is allowed for a user
 */
export const canPerformAction = (
  user: User | null,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: 'users' | 'towers' | 'analytics' | 'settings' | 'audit'
): boolean => {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(user, permission);
};

/**
 * Check if user can perform bulk operations
 */
export const canPerformBulkOperations = (user: User | null): boolean => {
  if (!user) return false;
  return hasAnyRole(user, ['Admin', 'Manager']);
};

/**
 * Check if user can export data
 */
export const canExportData = (user: User | null): boolean => {
  if (!user) return false;
  return hasPermission(user, 'analytics:export');
};

/**
 * Check if user can import data
 */
export const canImportData = (user: User | null): boolean => {
  if (!user) return false;
  return hasAnyRole(user, ['Admin', 'Manager']);
};

