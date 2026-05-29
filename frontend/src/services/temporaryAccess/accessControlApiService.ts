import { apiClient } from '../api/client';
import { logAuditEvent } from '../audit/index';
import { getTemporaryAccess } from './accessQueryService';
import { TemporaryRegionAccess, User } from './types';
import { saveGrants } from './utils';

/**
 * Backend-facing operations for temporary access control.
 */
export const grantTemporaryAccess = async (
  targetUser: User,
  region: string,
  expiresAt: Date,
  reason: string,
  grantedBy: User
): Promise<TemporaryRegionAccess> => {
  try {
    // Extract numeric ID
    const numericUserId =
      targetUser.id.replace('OCGID', '').replace(/^0+/, '') || '0';

    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      grant: any;
    }>('/temporary-access', {
      user_id: parseInt(numericUserId),
      region_name: region,
      expires_at: expiresAt.toISOString(),
      reason,
    });

    const data = response.data as {
      success: boolean;
      message?: string;
      grant: any;
    };
    if (!data.success) {
      throw new Error(data.message || 'Failed to grant temporary access');
    }

    const backendGrant = data.grant;

    // Transform backend response to frontend format
    const grant: TemporaryRegionAccess = {
      id: backendGrant.id.toString(),
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      region,
      grantedBy: grantedBy.id,
      grantedByName: grantedBy.name,
      grantedAt: new Date(backendGrant.granted_at),
      expiresAt: new Date(backendGrant.expires_at),
      reason: backendGrant.reason,
      isActive: backendGrant.status === 'active',
    };

    // Log audit event
    logAuditEvent(
      grantedBy,
      'REGION_ASSIGNED',
      `Granted temporary access to ${region} for ${targetUser.name}`,
      {
        severity: 'info',
        region,
        details: {
          targetUserId: targetUser.id,
          targetUserName: targetUser.name,
          expiresAt: expiresAt.toISOString(),
          reason,
        },
        success: true,
      }
    );

    return grant;
  } catch (error: any) {
    console.error('Error granting temporary access from backend:', error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to grant temporary access';
    throw new Error(errorMessage);
  }
};

export const revokeTemporaryAccess = async (
  grantId: string,
  revokedBy: User,
  reason?: string
): Promise<TemporaryRegionAccess | null> => {
  try {
    const response = await apiClient.request({
      method: 'DELETE',
      url: `/temporary-access/${grantId}`,
      data: { reason },
    });

    const data = response.data as unknown as {
      success: boolean;
      message?: string;
    };
    if (!data.success) {
      throw new Error(data.message || 'Failed to revoke temporary access');
    }

    // Backend only returns success message, need to fetch updated grant
    const allGrants = await getTemporaryAccess();
    const updatedGrant = allGrants.find((g) => g.id === grantId);

    if (updatedGrant) {
      logAuditEvent(
        revokedBy,
        'REGION_REVOKED',
        `Revoked temporary access to ${updatedGrant.region} for ${updatedGrant.userName}`,
        {
          severity: 'warning',
          region: updatedGrant.region,
          details: {
            targetUserId: updatedGrant.userId,
            targetUserName: updatedGrant.userName,
            grantId,
            reason,
          },
          success: true,
        }
      );

      return updatedGrant;
    }

    return null;
  } catch (error: any) {
    console.error('Error revoking temporary access from backend:', error);
    throw error;
  }
};

export const deleteTemporaryGrant = async (
  grantId: string,
  user: User
): Promise<boolean> => {
  try {
    if (user.role !== 'admin') {
      throw new Error('Only administrators can delete temporary access grants');
    }

    const grants = await getTemporaryAccess();
    const grant = grants.find((g) => g.id === grantId);

    if (!grant) {
      throw new Error('Temporary access grant not found');
    }

    const response = await apiClient.delete<{
      success: boolean;
      message?: string;
    }>(`/temporary-access/${grantId}`);

    const data = response.data;
    if (!data.success) {
      throw new Error(
        data.message || 'Failed to delete temporary access grant'
      );
    }

    logAuditEvent(
      user,
      'REGION_REVOKED',
      `Deleted temporary access grant for ${grant.userName}`,
      {
        severity: 'warning',
        region: grant.region,
        details: {
          targetUserId: grant.userId,
          targetUserName: grant.userName,
          grantId,
        },
        success: true,
      }
    );

    return true;
  } catch (error: any) {
    console.error('Error deleting temporary access grant:', error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Failed to delete temporary access grant'
    );
  }
};



