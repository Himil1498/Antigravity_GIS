import { User, UserRole } from "../../types/auth/index";
import { BackendUser } from "./types";

/**
 * Extract numeric ID from OCGID format (OCGID001 -> 1)
 */
export function extractNumericId(id: string): string {
  if (id.startsWith("OCGID")) {
    return id.replace("OCGID", "").replace(/^0+/, "") || "0";
  }
  return id;
}

/**
 * Map backend role to frontend role
 */
export function mapBackendRole(backendRole: string): UserRole {
  const role = backendRole?.toLowerCase();
  switch (role) {
    case "superadmin":
      return "superadmin";
    case "admin":
      return "admin";
    case "manager":
      return "manager";
    case "engineer":
    case "technician":
      return "technician";
    case "developer":
      return "developer";
    case "viewer":
    case "user":
      return "user";
    default:
      // Return custom role as is (cast to UserRole which usually allows string)
      return (role || "user") as UserRole;
  }
}

/**
 * Map frontend role to backend role
 */
export function mapFrontendRole(frontendRole: UserRole): string {
  switch (frontendRole) {
    case "superadmin":
      return "superadmin";
    case "admin":
      return "admin";
    case "manager":
      return "manager";
    case "technician":
      return "technician";
    case "developer":
      return "developer";
    case "user":
      return "user";
    default:
      return frontendRole || "user";
  }
}

/**
 * Transform backend user to frontend user model
 */
export function transformBackendUser(backendUser: BackendUser): User {
  // Parse regions - handle multiple formats
  let regions: string[] = [];

  // Priority 1: Use assignedRegions if it's a simple array of strings
  if (
    backendUser.assignedRegions &&
    Array.isArray(backendUser.assignedRegions)
  ) {
    regions = backendUser.assignedRegions;
  }
  // Priority 2: Parse regions field (for backward compatibility)
  else if (backendUser.regions) {
    try {
      if (typeof backendUser.regions === "string") {
        // Parse JSON string
        regions = JSON.parse(backendUser.regions);
      } else if (Array.isArray(backendUser.regions)) {
        // Extract region names from array of objects
        regions = backendUser.regions.map((r) => r.name);
      }
    } catch (e) {
      console.error("Error parsing regions:", e);
      regions = [];
    }
  }

  // Parse temporary access if available
  const temporaryAccess =
    (backendUser as any).temporaryAccess?.map((ta: any) => ({
      id: ta.id.toString(),
      region: ta.region,
      expiresAt: new Date(ta.expiresAt),
      grantedAt: new Date(ta.grantedAt),
      grantedByName: ta.grantedByName || "",
      reason: ta.reason || "",
      secondsRemaining: ta.secondsRemaining || 0,
      timeRemaining: ta.timeRemaining || {
        expired: true,
        display: "Expired",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total_seconds: 0,
      },
    })) || [];

  // Extract active temporary regions (not expired, not revoked)
  const temporaryRegions = temporaryAccess
    .filter((ta: any) => {
      const now = new Date();
      return ta.expiresAt > now && !ta.timeRemaining.expired;
    })
    .map((ta: any) => ta.region);

  // Combine permanent and temporary regions (remove duplicates)
  const allRegions = Array.from(new Set([...regions, ...temporaryRegions]));

  return {
    id: `OCGID${String(backendUser.id).padStart(3, "0")}`, // Format numeric ID as OCGID001
    username: backendUser.username,
    name: backendUser.full_name,
    email: backendUser.email,
    password: "********", // Never expose password hash
    gender: (backendUser.gender || "Other") as "Male" | "Female" | "Other",
    phoneNumber: backendUser.phone || "",
    address: {
      street: backendUser.street || "",
      city: backendUser.city || "",
      state: backendUser.state || "",
      pincode: backendUser.pincode || "",
    },
    officeLocation: backendUser.office_location || "",
    department: backendUser.department || "", // Map department field
    assignedUnder: [], // Not directly mapped, would need additional API
    role: mapBackendRole(backendUser.role),
    assignedRegions: allRegions, // Include both permanent and temporary regions
    temporaryAccess,
    groups: [],
    status: backendUser.is_active ? "Active" : "Inactive",
    loginHistory: [],
    company: "Opti Telemedia", // Default company
    permissions: Array.isArray(backendUser.permissions)
      ? backendUser.permissions
      : typeof backendUser.permissions === "string"
        ? JSON.parse(backendUser.permissions)
        : [],
    lastLogin: backendUser.updated_at || new Date().toISOString(),
    // Email verification fields
    isEmailVerified: backendUser.is_email_verified || false,
    emailVerifiedAt: backendUser.email_verified_at,
    manualVerification: backendUser.manual_verification || false,
    emailVerifiedBy: backendUser.email_verified_by,
    lastVerificationEmailSent: backendUser.last_verification_email_sent,
  };
}

/**
 * Transform frontend user to backend user format for create/update
 */
export function transformFrontendUser(frontendUser: Partial<User>): any {
  return {
    username: frontendUser.username,
    email: frontendUser.email,
    full_name: frontendUser.name,
    gender: frontendUser.gender,
    phone: frontendUser.phoneNumber,
    department: frontendUser.department,
    office_location: frontendUser.officeLocation,
    street: frontendUser.address?.street,
    city: frontendUser.address?.city,
    state: frontendUser.address?.state,
    pincode: frontendUser.address?.pincode,
    role: frontendUser.role ? mapFrontendRole(frontendUser.role) : "user",
    is_active: frontendUser.status === "Active",
    // Send assignedRegions as array of region names (not stringified)
    assignedRegions: frontendUser.assignedRegions || [],
  };
}

