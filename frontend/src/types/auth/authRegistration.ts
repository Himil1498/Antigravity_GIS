
import type { UserRole, TelecomCompany } from '../common/index';

// Registration Types
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: TelecomCompany | string;
  phone?: string;
  department?: string;
  inviteCode?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Invitation System
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  company: string;
  invitedBy: string;
  inviteCode: string;
  expiresAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
  createdAt: string;
}


