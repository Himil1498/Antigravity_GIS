
import type { UserPreferences } from './authCore';

// Audit and Security
export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  isSuccessful: boolean;
  failureReason?: string;
  location?: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  userId?: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change' | 'suspicious_activity';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  timestamp: string;
}

// Profile Management
export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  department?: string;
  avatar?: File;
  preferences?: Partial<UserPreferences>;
}

export interface AvatarUploadResponse {
  url: string;
  filename: string;
  size: number;
}

