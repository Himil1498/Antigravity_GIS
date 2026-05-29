
import type { User } from '../../types/auth/index';
import type { EffectivePermissions, UserGroup } from '../../types/permissions/index';
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/permissions/index';
import { rolesMatch } from '../userHelpers';

/**
 * Get all groups a user belongs to
 */
function getUserGroups(user: User): UserGroup[] {
  if (!user.groups || user.groups.length === 0) {
    return [];
  }

  try {
    const storedGroups = localStorage.getItem('user_groups');
    if (!storedGroups) return [];

    const allGroups: UserGroup[] = JSON.parse(storedGroups);
    return allGroups.filter(group => user.groups.includes(group.id));
  } catch (error) {
    console.error('Failed to load user groups:', error);
    return [];
  }
}

/**
 * Get permissions from all user groups
 */
function getGroupPermissions(user: User): string[] {
  const groups = getUserGroups(user);
  const permissions = new Set<string>();

  groups.forEach(group => {
    if (group.isActive) {
      group.permissions.forEach(p => permissions.add(p));
    }
  });

  return Array.from(permissions);
}

/**
 * Get user's effective permissions (role + direct + groups)
 */
export function getEffectivePermissions(user: User | null): EffectivePermissions {
  if (!user) {
    return {
      direct: [],
      fromGroups: [],
      all: new Set()
    };
  }

  const allPermissions = new Set<string>();

  // 1. Admin has ALL permissions
  // 2. Get role-based default permissions
  // Normalize role to lowercase to match keys in roles.ts (e.g. 'admin', 'manager', 'developer')
  const roleKey = (user.role || '').toLowerCase();
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
  
  // Debug fallback: if empty, try checking if roles.ts uses capitalized keys (it shouldn't, but for safety)
  if (rolePermissions.length === 0 && user.role) {
     const capitalizedKey = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
     const capPermissions = DEFAULT_ROLE_PERMISSIONS[capitalizedKey];
     if (capPermissions) {
        capPermissions.forEach(p => allPermissions.add(p));
     }
  }

  rolePermissions.forEach(p => allPermissions.add(p));

  // 3. Get direct user permissions
  const directPermissions = user.directPermissions || [];
  directPermissions.forEach(p => allPermissions.add(p));

  // 4. Legacy permissions field support
  const legacyPermissions = user.permissions || [];
  legacyPermissions.forEach(p => allPermissions.add(p));

  // 5. Get permissions from user groups
  const groupPermissions = getGroupPermissions(user);
  groupPermissions.forEach(p => allPermissions.add(p));

  return {
    direct: [...rolePermissions, ...directPermissions, ...legacyPermissions],
    fromGroups: groupPermissions,
    all: allPermissions
  };
}

/**
 * Get all permissions for a category
 */
export function getPermissionsByCategory(
  category: string,
  allPermissions: Set<string>
): string[] {
  return Array.from(allPermissions).filter(p => p.startsWith(category));
}

