
// ===== Permission Check Result =====
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  missingPermission?: string;
}

// ===== Effective Permissions =====
export interface EffectivePermissions {
  direct: string[];              // Direct user permissions
  fromGroups: string[];          // Permissions from groups
  all: Set<string>;              // Combined (for fast lookup)
}

