
import type { Permission, UserRole } from '../common/index';
import type { User } from './authCore';

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  company?: string;
  rememberMe?: boolean;
}

export interface LoginSuccessResponse {
  success: true;
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  permissions: Permission[];
}

export interface Login2FARequiredResponse {
  success: true;
  require2FA: true;
  userId: number;
  email: string;
  expiresIn?: number;
}

export type LoginResponse = LoginSuccessResponse | Login2FARequiredResponse;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: string | null;
  sessionExpiry: string | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  company: string;
  permissions: Permission[];
  iat: number;
  exp: number;
  iss: string;
}

// Session Management
export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActiveSession {
  current: Session;
  others: Session[];
}


