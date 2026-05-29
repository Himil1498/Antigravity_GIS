
import type { User } from '../auth/index';

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
  company?: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  reset_token_sent: boolean;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

