/**
 * Advanced Auth Service Types
 * Type definitions and interfaces
 */

import type { User } from "../../types/auth/index";

/**
 * Authentication session data
 */
export interface AuthSession {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
  refreshExpiresAt: number;
  lastActivity: number;
  deviceInfo: string;
}

/**
 * Session storage interface
 */
export interface SessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Persistent storage interface
 */
export interface PersistentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Auth state listener function type
 */
export type AuthStateListener = (
  isAuthenticated: boolean,
  user: User | null
) => void;

/**
 * Session end listener function type
 */
export type SessionEndListener = (reason: string) => void;

/**
 * Session info for debugging
 */
export interface SessionInfo {
  sessionId: string;
  isValid: boolean;
  expiresAt: string;
  refreshExpiresAt: string;
  lastActivity: string;
  deviceInfo: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}


