import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/index";

// Protected Route Component with Role-Based Access Control (INDUSTRY STANDARD)
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
}> = ({ children, allowedRoles, requiredPermission }) => {
  // Use Redux selector to get real-time auth state
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 1. Admin Bypass (Always allow admin/superadmin)
  if (user?.role === "superadmin" || String(user?.role).toLowerCase() === "admin") {
    return <>{children}</>;
  }

  // 2. Permission Check (Priority)
  if (requiredPermission && user) {
    // Check for "all" wildcard
    if (
      user.directPermissions?.includes("all") ||
      user.permissions?.includes("all" as any) ||
      user.directPermissions?.includes("*") ||
      user.permissions?.includes("*" as any)
    ) {
      return <>{children}</>;
    }

    // Check specific permission
    const hasDirectPermission =
      user.directPermissions?.includes(requiredPermission);
    const hasLegacyPermission = user.permissions?.includes(
      requiredPermission as any,
    );

    if (hasDirectPermission || hasLegacyPermission) {
      return <>{children}</>;
    } else {
      // User does not have permission - Redirect to login or unauthorized
      // Avoid redirecting to dashboard if we are already there to prevent loop
      return <Navigate to="/login" replace />;
    }
  }

  // 3. Role Check (Fallback)
  // If allowedRoles is specified, check if user has the required role (case-insensitive)
  if (allowedRoles && user?.role) {
    const userRoleLower = user.role.toLowerCase();
    const allowedRolesLower = allowedRoles.map((r) => r.toLowerCase());

    if (allowedRolesLower.includes(userRoleLower)) {
      return <>{children}</>;
    } else {
       return <Navigate to="/login" replace />;
    }
  }

  // If authenticated but no specific restrictions passed, allow access
  return <>{children}</>;
};

export default ProtectedRoute;

