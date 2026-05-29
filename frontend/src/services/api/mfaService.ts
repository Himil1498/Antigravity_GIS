/**
 * MFA Service
 * Multi-factor authentication operations
 */

import { apiClient } from "./client";

export const mfaService = {
  async verify2FACode(
    userId: number,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
    verified: boolean;
    token?: string;
    refreshToken?: string;
    user?: any;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      verified: boolean;
      token?: string;
      refreshToken?: string;
      user?: any;
    }>("/mfa/verify", { userId, code });
    return response.data;
  },

  async send2FACode(
    userId: number
  ): Promise<{
    success: boolean;
    message: string;
    email: string;
    expiresIn: number;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      email: string;
      expiresIn: number;
    }>("/mfa/send-code", { userId });
    return response.data;
  },

  async enable2FA(
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    email: string;
    requireVerification: boolean;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      email: string;
      requireVerification: boolean;
    }>("/mfa/enable", { password });
    return response.data;
  },

  async verifyAndEnable2FA(
    code: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/mfa/verify-and-enable", { code });
    return response.data;
  },

  async disable2FA(
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/mfa/disable", { password });
    return response.data;
  },

  async get2FAStatus(): Promise<{
    success: boolean;
    mfa: {
      enabled: boolean;
      method: string;
      enabledAt: string | null;
    };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      mfa: {
        enabled: boolean;
        method: string;
        enabledAt: string | null;
      };
    }>("/mfa/status");
    return response.data;
  },

  // Admin 2FA Management
  async adminForce2FA(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/mfa/admin/force-enable/${userId}`);
    return response.data;
  },

  async adminDisable2FA(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/mfa/admin/disable/${userId}`);
    return response.data;
  },
};

