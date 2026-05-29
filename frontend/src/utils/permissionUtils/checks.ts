import type { User } from "../../types/auth/index";
import type { PermissionCheckResult } from "../../types/permissions/index";
import { getEffectivePermissions } from "./calculation";

/**
 * Check if user has a specific permission
 * Supports wildcards: gis.*, gis.distance.*, *
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  const effectivePerms = getEffectivePermissions(user);

  // Admin has all permissions
  if (effectivePerms.all.has("*")) return true;

  // Exact match (or normalized match)
  if (effectivePerms.all.has(permission)) return true;
  if (effectivePerms.all.has(permission.replace(/:/g, "."))) return true;
  if (effectivePerms.all.has(permission.replace(/\./g, ":"))) return true;

  // Check wildcards
  // Split by both dot and colon to handle "map:tools:distance" or "map.tools.distance"
  const parts = permission.split(/[:.]/);

  // Check each wildcard level
  // Example: "gis:distance:use" checks:
  // - gis:* / gis.*
  // - gis:distance:* / gis.distance.*
  for (let i = 1; i < parts.length; i++) {
    const prefixParts = parts.slice(0, i);
    
    // Check dot version
    const dotWildcard = prefixParts.join(".") + ".*";
    if (effectivePerms.all.has(dotWildcard)) return true;

    // Check colon version
    const colonWildcard = prefixParts.join(":") + ":*";
    if (effectivePerms.all.has(colonWildcard)) return true;
  }

  return false;
}

/**
 * Check permission with ownership validation
 * Used for operations like delete.own vs delete.any
 */
export function checkPermissionWithOwnership(
  user: User | null,
  basePermission: string, // e.g., "gis.distance.delete"
  resourceOwnerId?: string,
  options?: {
    allowTeam?: boolean;
    teamMemberIds?: string[];
  },
): PermissionCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: "User not authenticated",
      missingPermission: basePermission,
    };
  }

  // Check if user has .any permission (can act on any resource)
  const anyPermission = `${basePermission}.any`;
  if (hasPermission(user, anyPermission)) {
    return { allowed: true };
  }

  // Check if user has .own permission and owns the resource
  const ownPermission = `${basePermission}.own`;
  if (hasPermission(user, ownPermission)) {
    // If no owner specified, assume user owns it (for creating new resources)
    if (!resourceOwnerId) {
      return { allowed: true };
    }

    // Check ownership
    if (resourceOwnerId === user.id) {
      return { allowed: true };
    }

    // Check team membership (if enabled)
    if (options?.allowTeam && options?.teamMemberIds) {
      if (options.teamMemberIds.includes(user.id)) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: "You can only perform this action on your own resources",
      missingPermission: anyPermission,
    };
  }

  return {
    allowed: false,
    reason: `Missing permission: ${basePermission}`,
    missingPermission: anyPermission,
  };
}

/**
 * Check multiple permissions (user must have ALL)
 */
export function hasAllPermissions(
  user: User | null,
  permissions: string[],
): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Check multiple permissions (user must have AT LEAST ONE)
 */
export function hasAnyPermission(
  user: User | null,
  permissions: string[],
): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Check if a permission ID is valid (exists in system or follows pattern)
 */
export function isValidPermissionId(permissionId: string): boolean {
  // Check format: module.resource.action or module:resource:action
  const parts = permissionId.split(/[:.]/);

  // Must have at least 2 parts (module.action) or wildcard
  if (parts.length < 2 && permissionId !== "*") {
    return false;
  }

  // Check for invalid characters
  const validPattern = /^[a-z0-9_:.*]+$/i;
  return validPattern.test(permissionId);
}

/**
 * Expand wildcard permissions to actual permission list
 * Example: "gis.*" expands to all gis.* permissions
 */
export function expandWildcardPermission(
  wildcardPerm: string,
  availablePermissions: string[],
): string[] {
  if (wildcardPerm === "*") {
    return availablePermissions;
  }

  // Check for both .* and :*
  if (wildcardPerm.endsWith(".*")) {
    const prefix = wildcardPerm.slice(0, -2); // Remove .*
    return availablePermissions.filter(
      (p) => p.startsWith(prefix + ".") || p.startsWith(prefix + ":"),
    );
  }

  if (wildcardPerm.endsWith(":*")) {
    const prefix = wildcardPerm.slice(0, -2); // Remove :*
    return availablePermissions.filter(
      (p) => p.startsWith(prefix + ":") || p.startsWith(prefix + "."),
    );
  }

  return [wildcardPerm];
}

