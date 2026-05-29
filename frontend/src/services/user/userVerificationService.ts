
import apiClient from './userApiClient';
import { extractNumericId } from './utils';

/**
 * Manually verify user's email (Admin only)
 */
export async function manualVerifyUserEmail(userId: string): Promise<{ success: boolean; message: string; user: any; verifiedBy: string }> {
  try {
    const numericId = parseInt(extractNumericId(userId));
    const response = await apiClient.post<{ success: boolean; message: string; user: any; verifiedBy: string }>(`/users/${numericId}/verify-email-manual`);

    if (!response.data.success) {
      throw new Error((response.data as any).error || 'Failed to verify email');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error manually verifying email:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to verify email');
  }
}

/**
 * Resend verification email to user (Admin only)
 */
export async function resendVerificationEmail(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const numericId = parseInt(extractNumericId(userId));
    const response = await apiClient.post<{ success: boolean; message: string }>(`/users/${numericId}/resend-verification`);

    if (!response.data.success) {
      throw new Error((response.data as any).error || 'Failed to resend verification email');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to resend verification email');
  }
}

/**
 * Force enable 2FA for a user (Admin only)
 */
export async function adminForce2FA(userId: number): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string; user?: any }>(`/mfa/admin/force-enable/${userId}`);

    if (!response.data.success) {
      throw new Error((response.data as any).error || 'Failed to enable 2FA');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error forcing 2FA:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to enable 2FA');
  }
}

/**
 * Disable 2FA for a user (Admin only)
 */
export async function adminDisable2FA(userId: number): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string; user?: any }>(`/mfa/admin/disable/${userId}`);

    if (!response.data.success) {
      throw new Error((response.data as any).error || 'Failed to disable 2FA');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to disable 2FA');
  }
}

