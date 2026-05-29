import type { UserRole, Permission, TelecomCompany } from "../common/index";
export type { UserRole, Permission, TelecomCompany };

// Temporary Access Info
export interface TemporaryAccessInfo {
  id: string;
  region: string;
  expiresAt: Date;
  grantedAt: Date;
  grantedByName: string;
  reason: string;
  secondsRemaining: number;
  timeRemaining: {
    expired: boolean;
    display: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total_seconds: number;
  };
}

// Enhanced User Types for Phase 2
export interface User {
  id: string; // Auto-generated (USER001, USER002...)
  username: string;
  name: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  officeLocation: string;
  assignedUnder: string[]; // Multiple managers/users
  role: UserRole;
  assignedRegions: string[]; // Indian states/UTs from india.json
  temporaryAccess?: TemporaryAccessInfo[]; // Active temporary access grants
  groups: string[]; // User group IDs
  directPermissions?: string[]; // Direct permissions assigned to user (not from groups)
  status: "Active" | "Inactive";
  loginHistory: Array<{ timestamp: Date; location: string }>;

  // Legacy fields for backward compatibility
  company?: TelecomCompany | string;
  permissions?: Permission[];
  lastLogin?: string;
  avatar?: string;
  department?: string;
  manager?: string;
  isActive?: boolean;
  is_active?: boolean; // Backend compatibility
  preferences?: UserPreferences;
  map_preferences?: any; // Stores serialized JSON preferences
  metadata?: Record<string, any>;

  // Additional fields from backend
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Email verification fields
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | Date;
  manualVerification?: boolean;
  emailVerifiedBy?: number;
  lastVerificationEmailSent?: string | Date;

  // Two-Factor Authentication fields
  mfaEnabled?: boolean;
  mfaMethod?: "email" | "totp" | "sms";
  mfaEnabledAt?: string | Date;

  createdBy?: string;
  createdByName?: string;

  // Online status tracking
  minutesSinceLogin?: number;
  isOnline?: boolean;

  // Active session tracking from backend
  active_sessions?: any[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    types: NotificationType[];
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
  map: {
    defaultZoom: number;
    defaultCenter: { lat: number; lng: number };
    defaultLayers: string[];
  };
}

export type NotificationType =
  | "system_alerts"
  | "data_updates"
  | "maintenance"
  | "performance"
  | "security";

