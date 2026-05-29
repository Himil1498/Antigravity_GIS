import { logAuditEvent } from "../audit/index";
import { getTemporaryAccess } from "./accessQueryService";
import { saveGrants } from "./utils";
import { TemporaryRegionAccess, User } from "./types";

export {
  deleteTemporaryGrant,
  grantTemporaryAccess,
  revokeTemporaryAccess
} from "./accessControlApiService";

/**
 * Clean up expired grants (mark as inactive)
 */
export const cleanupExpiredGrants = async (): Promise<number> => {
  const grants = await getTemporaryAccess();
  const now = new Date();
  let cleanedCount = 0;

  grants.forEach((grant) => {
    if (grant.isActive && grant.expiresAt < now && !grant.revokedAt) {
      grant.isActive = false;
      cleanedCount++;
    }
  });

  if (cleanedCount > 0) {
    saveGrants(grants);
  }

  return cleanedCount;
};

/**
 * Extend temporary access expiration
 */
export const extendTemporaryAccess = async (
  grantId: string,
  newExpirationDate: Date,
  extendedBy: User
): Promise<TemporaryRegionAccess | null> => {
  const grants = await getTemporaryAccess();
  const grant = grants.find((g) => g.id === grantId);

  if (!grant || !grant.isActive || grant.revokedAt) {
    return null;
  }

  const oldExpiration = grant.expiresAt;
  grant.expiresAt = newExpirationDate;

  // Save updated grants
  saveGrants(grants);

  // Log audit event
  logAuditEvent(
    extendedBy,
    "REGION_ASSIGNED",
    `Extended temporary access to ${grant.region} for ${grant.userName}`,
    {
      severity: "info",
      region: grant.region,
      details: {
        targetUserId: grant.userId,
        targetUserName: grant.userName,
        grantId,
        oldExpiration: oldExpiration.toISOString(),
        newExpiration: newExpirationDate.toISOString()
      },
      success: true
    }
  );

  return grant;
};

