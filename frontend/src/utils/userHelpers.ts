/**
 * Utility functions for user data handling
 */

/**
 * Parse user ID to number
 * Handles both string IDs (e.g., "OCGID123") and numeric IDs (e.g., 123)
 *
 * @param userId - User ID as string or number
 * @returns Numeric user ID
 */
export const parseUserId = (userId: string | number | undefined): number => {
  if (userId === undefined || userId === null) {
    return 0;
  }

  if (typeof userId === 'number') {
    return userId;
  }

  if (typeof userId === 'string') {
    // Remove "OCGID" prefix if present
    const numericPart = userId.replace(/OCGID/gi, '');
    return parseInt(numericPart, 10) || 0;
  }

  return 0;
};

/**
 * Compare user roles in a case-insensitive manner
 *
 * @param userRole - User's role (e.g., "admin", "Admin")
 * @param allowedRoles - Array of allowed roles
 * @returns True if user role is in allowed roles
 */
export const hasRole = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) return false;

  const userRoleLower = userRole.toLowerCase();
  const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());

  return allowedRolesLower.includes(userRoleLower);
};

/**
 * Check if two roles match (case-insensitive)
 *
 * @param role1 - First role
 * @param role2 - Second role
 * @returns True if roles match
 */
export const rolesMatch = (role1: string | undefined, role2: string | undefined): boolean => {
  if (!role1 || !role2) return false;
  return role1.toLowerCase() === role2.toLowerCase();
};

