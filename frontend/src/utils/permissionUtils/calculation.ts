
import type { User } from '../../types/auth/index';
import type { EffectivePermissions } from '../../types/permissions/permissionsAccess';
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/permissions/defaults/index';


/**
 * Get user's effective permissions (role + direct + groups)
 */
export function getEffectivePermissions(user: User | null): EffectivePermissions {
  if (!user) {
    return {
      direct: [],
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
        capPermissions.forEach((p: string) => allPermissions.add(p));
     }
  }

  rolePermissions.forEach((p: string) => allPermissions.add(p));

  // 3. Get direct user permissions
  const directPermissions = user.directPermissions || [];
  directPermissions.forEach((p: string) => allPermissions.add(p));

  // 4. Legacy permissions field support
  const legacyPermissions = user.permissions || [];
  legacyPermissions.forEach((p: string) => allPermissions.add(p));

  return {
    direct: [...rolePermissions, ...directPermissions, ...legacyPermissions],
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

