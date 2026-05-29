import type { User } from "../../types/auth/index";
import type { Permission, UserRole } from "../../types/common/index";
import { rolesMatch } from "../userHelpers";
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from "./constants";

export { rolesMatch };

/**
 * Normalize role name to lowercase to match dictionary keys
 * Handles case-insensitive role names (database uses lowercase)
 */
export const normalizeRole = (role: string | undefined): string => {
  if (!role) return "";
  // Convert to lowercase: 'Admin' -> 'admin', 'ADMIN' -> 'admin'
  return role.toLowerCase();
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: Permission,
): boolean => {
  if (!user) return false;

  // Admin has all permissions
  if (rolesMatch(user.role, "Admin")) return true;

  // Check explicit permissions
  if (user.permissions?.includes(permission)) return true;

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[normalizeRole(user.role)] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[],
): boolean => {
  if (!user) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[],
): boolean => {
  if (!user) return false;
  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (
  user: User | null,
  role: UserRole | string,
): boolean => {
  if (!user) return false;
  return rolesMatch(user.role, role);
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (
  user: User | null,
  roles: (UserRole | string)[],
): boolean => {
  if (!user) return false;
  return roles.some((role) => rolesMatch(user.role, role));
};

/**
 * Check if a user's role is at least the specified level
 */
export const hasMinimumRole = (
  user: User | null,
  minimumRole: UserRole | string,
): boolean => {
  if (!user) return false;

  const userLevel = ROLE_HIERARCHY[normalizeRole(user.role)] || 0;
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(minimumRole)] || 0;

  return userLevel >= requiredLevel;
};

/**
 * Get all permissions for a user
 */
export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];

  // Admin has all permissions
  if (rolesMatch(user.role, "Admin")) {
    return Object.values(ROLE_PERMISSIONS).flat() as Permission[];
  }

  // Combine role-based and explicit permissions
  const rolePermissions = ROLE_PERMISSIONS[normalizeRole(user.role)] || [];
  const userPermissions = user.permissions || [];

  // Merge and deduplicate
  return Array.from(
    new Set([...rolePermissions, ...userPermissions]),
  ) as Permission[];
};

/**
 * Get role display information
 */
export const getRoleInfo = (
  role: UserRole | string,
): {
  name: string;
  level: number;
  color: string;
  permissions: Permission[];
} => {
  const normalized = normalizeRole(role);
  return {
    name: normalized,
    level: ROLE_HIERARCHY[normalized] || 0,
    color:
      {
        admin: "purple",
        manager: "blue",
        technician: "green",
        user: "gray",
      }[normalized] || "gray",
    permissions: ROLE_PERMISSIONS[normalized] || [],
  };
};

