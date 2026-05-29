/**
 * Auth Service
 * Authentication operations including login, logout, and token management
 */

import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  BackendLoginResponse,
  BackendUser,
} from "./types";
import type {
  LoginSuccessResponse,
  Login2FARequiredResponse,
  User,
  UserRole,
} from "../../types/auth/index";

/**
 * Map backend user role to frontend role types
 * Preserves custom roles (e.g., "intern") instead of defaulting to "user"
 */
const mapRole = (backendRole?: string): UserRole => {
  if (!backendRole) return "user";
  return backendRole.toLowerCase() as UserRole;
};

/**
 * Transform backend user data to frontend User model
 */
export const transformBackendUser = (
  backendUser: BackendUser,
  company: string = "OptiConnect",
): User => {
  return {
    id: backendUser.id.toString(),
    email: backendUser.email,
    name: backendUser.name || backendUser.full_name || backendUser.username,
    username: backendUser.username,
    role: mapRole(backendUser.role),
    company: company,
    permissions: (backendUser.permissions ||
      backendUser.directPermissions ||
      []) as any,
    directPermissions: (backendUser.directPermissions ||
      backendUser.permissions ||
      []) as string[], // Ensure directPermissions is populated
    lastLogin: backendUser.lastLogin || backendUser.last_login,
    password: "********",
    gender: backendUser.gender || "Other",
    phoneNumber: backendUser.phoneNumber || backendUser.phone || "",
    phone: backendUser.phone || backendUser.phoneNumber || "",
    address: {
      street: backendUser.address?.street || backendUser.street || "",
      city: backendUser.address?.city || backendUser.city || "",
      state: backendUser.address?.state || backendUser.state || "",
      pincode: backendUser.address?.pincode || backendUser.pincode || "",
    },
    street: backendUser.street || backendUser.address?.street || "",
    city: backendUser.city || backendUser.address?.city || "",
    state: backendUser.state || backendUser.address?.state || "",
    pincode: backendUser.pincode || backendUser.address?.pincode || "",
    officeLocation:
      backendUser.officeLocation || backendUser.office_location || "",
    department: backendUser.department || "",
    assignedUnder: [],
    assignedRegions: backendUser.assignedRegions || backendUser.regions || [],
    groups: [],
    status:
      backendUser.status === "Active" || backendUser.status === "Inactive"
        ? backendUser.status
        : backendUser.isActive
          ? "Active"
          : "Inactive",
    isActive:
      backendUser.isActive !== undefined
        ? Boolean(backendUser.isActive)
        : backendUser.status === "Active",
    isEmailVerified: backendUser.isEmailVerified,
    emailVerifiedAt:
      backendUser.emailVerifiedAt || backendUser.email_verified_at,
    manualVerification:
      backendUser.manualVerification || backendUser.manual_verification,
    emailVerifiedBy:
      backendUser.emailVerifiedBy || backendUser.email_verified_by,
    lastVerificationEmailSent:
      backendUser.lastVerificationEmailSent ||
      backendUser.last_verification_email_sent,

    // Two-Factor Authentication fields
    mfaEnabled:
      backendUser.mfaEnabled !== undefined
        ? Boolean(backendUser.mfaEnabled)
        : Boolean(backendUser.mfa_enabled),
    mfaMethod: (backendUser.mfaMethod || backendUser.mfa_method || "email") as
      | "email"
      | "totp"
      | "sms",
    mfaEnabledAt: backendUser.mfaEnabledAt || backendUser.mfa_enabled_at,

    createdBy: backendUser.createdBy,
    createdByName: backendUser.createdByName,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    loginHistory: [],
    active_sessions: (backendUser as any).active_sessions || [],
  };
};

// Access Auth Service directly
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<BackendLoginResponse>(
        "/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
        },
      );

      const backendData = response.data;

      // Check if 2FA is required
      if (backendData.require2FA) {
        const twoFAResponse: Login2FARequiredResponse = {
          success: true,
          require2FA: true,
          userId: backendData.userId!,
          email: backendData.email!,
          expiresIn: backendData.expiresIn,
        };
        return twoFAResponse;
      }

      const user = transformBackendUser(backendData.user, credentials.company);

      const successResponse: LoginSuccessResponse = {
        success: true,
        user,
        token: backendData.token,
        refreshToken: backendData.token,
        expiresIn: 7200,
        permissions: user.permissions || [],
      };
      return successResponse;
    } catch (error: any) {
      console.error(
        "❌ Backend login failed:",
        error.response?.data || error.message,
      );
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  async verifyPassword(password: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      "/auth/verify-password",
      { password }
    );
    return response.data.success;
  },

  async logout(token: string): Promise<void> {
    await apiClient.post("/auth/logout", { token });
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async refreshToken(token: string): Promise<string> {
    try {
      const response = await apiClient.post<{ data: { token: string } }>(
        "/auth/refresh",
        { token },
      );
      return response.data.data.token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return token;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiClient.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  },

  async getCurrentUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; user: any }>(
        "/auth/me",
      );
      return transformBackendUser(response.data.user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch user profile",
      );
    }
  },

  async getMyRecentActivity(limit = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; activities: any[] }>(
        `/auth/me/recent-activity?limit=${limit}`,
      );
      return response.data.activities || [];
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      return [];
    }
  },
};

