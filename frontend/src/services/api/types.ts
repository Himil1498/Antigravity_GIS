/**
 * API Service Types
 * Type definitions for API requests and responses
 */

import type { User, LoginResponse } from "../../types/auth/index";
import type {
  TelecomTower,
  NetworkCoverage,
} from "../../store/slices/data/index";

// Re-export auth types
export type { User, LoginResponse };
export type { TelecomTower, NetworkCoverage };

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
  company?: string;
  rememberMe?: boolean;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Backend User Structure
export interface BackendUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: string;
  phone?: string;
  phoneNumber?: string;
  department?: string;
  office_location?: string;
  officeLocation?: string;
  gender?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  is_active?: boolean;
  isActive?: boolean;
  status?: string;
  isEmailVerified?: boolean;
  is_email_verified?: boolean;
  emailVerifiedAt?: string;
  email_verified_at?: string;
  manualVerification?: boolean;
  manual_verification?: boolean;
  emailVerifiedBy?: number;
  email_verified_by?: number;
  lastVerificationEmailSent?: string;
  last_verification_email_sent?: string;
  // Two-Factor Authentication fields
  mfaEnabled?: boolean;
  mfa_enabled?: boolean;
  mfaMethod?: string;
  mfa_method?: string;
  mfaEnabledAt?: string;
  mfa_enabled_at?: string;
  createdBy?: string;
  created_by?: string;
  createdByName?: string;
  created_by_name?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  lastLogin?: string;
  last_login?: string;
  assignedRegions?: string[];
  regions?: string[];
  permissions?: string[];
  directPermissions?: string[];
}

// Backend Login Response
export interface BackendLoginResponse {
  success: boolean;
  token: string;
  user: BackendUser;
  require2FA?: boolean;
  userId?: number;
  email?: string;
  expiresIn?: number;
}

// Search Results
export interface SearchResults {
  infrastructure: any[];
  measurements: any[];
  polygons: any[];
  circles: any[];
  elevations: any[];
  sectors: any[];
}

