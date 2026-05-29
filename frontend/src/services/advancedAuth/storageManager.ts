/**
 * Advanced Auth Storage Manager
 * Handles session and persistent storage operations
 */

import type {
  AuthSession,
  SessionStorage,
  PersistentStorage,
} from "./types";
import type { User } from "../../types/auth/index";
import { AUTH_CONFIG } from "./constants";

export class StorageManager {
  private sessionStorage: SessionStorage = window.sessionStorage;
  private persistentStorage: PersistentStorage = window.localStorage;

  /**
   * Update session storage with current session data
   */
  updateSessionStorage(session: AuthSession): void {
    try {
      // Store session metadata (no tokens in metadata object)
      const sessionMetadata = {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
        refreshExpiresAt: session.refreshExpiresAt,
        lastActivity: session.lastActivity,
        deviceInfo: session.deviceInfo,
      };

      this.sessionStorage.setItem(
        AUTH_CONFIG.SESSION_KEY,
        JSON.stringify(sessionMetadata)
      );
      this.sessionStorage.setItem(
        AUTH_CONFIG.USER_KEY,
        JSON.stringify(session.user)
      );
      this.sessionStorage.setItem(
        AUTH_CONFIG.ACCESS_TOKEN_KEY,
        session.accessToken
      );
    } catch (error) {
      console.error("Failed to update session storage:", error);
    }
  }

  /**
   * Update persistent storage (refresh token and preferences)
   */
  updatePersistentStorage(session: AuthSession): void {
    try {
      // Only store refresh token in localStorage
      this.persistentStorage.setItem(
        AUTH_CONFIG.REFRESH_TOKEN_KEY,
        session.refreshToken
      );

      // Store user preferences (non-sensitive data)
      const preferences = {
        lastUsername: session.user.email,
        theme: "auto",
        language: "en",
      };

      this.persistentStorage.setItem(
        AUTH_CONFIG.PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Failed to update persistent storage:", error);
    }
  }

  /**
   * Restore session from storage
   */
  restoreSession(): AuthSession | null {
    try {
      const sessionData = this.sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY);
      const userData = this.sessionStorage.getItem(AUTH_CONFIG.USER_KEY);
      const accessToken = this.sessionStorage.getItem(
        AUTH_CONFIG.ACCESS_TOKEN_KEY
      );
      const refreshToken = this.persistentStorage.getItem(
        AUTH_CONFIG.REFRESH_TOKEN_KEY
      );

      if (sessionData && userData && accessToken) {
        const session: AuthSession = JSON.parse(sessionData);
        session.accessToken = accessToken;
        session.refreshToken = refreshToken || accessToken;
        session.user = JSON.parse(userData);

        // Validate session expiry
        const now = Date.now();
        if (now < session.refreshExpiresAt) {
          return session;
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to restore session:", error);
      return null;
    }
  }

  /**
   * Clear all session data from storage
   */
  clearSessionData(): void {
    // Clear session storagehContext.tsx#L1-217
    this.sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    this.sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
    this.sessionStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    this.sessionStorage.removeItem('opti_connect_token');

    // Clear persistent storage (keep preferences)
    this.persistentStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    this.persistentStorage.removeItem('opti_connect_token');
  }

  /**
   * Get user preferences from persistent storage
   */
  getUserPreferences(): any {
    try {
      const prefs = this.persistentStorage.getItem(AUTH_CONFIG.PREFERENCES_KEY);
      return prefs ? JSON.parse(prefs) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Remove access token on unload (security measure)
   */
  clearAccessTokenOnUnload(): void {
    this.sessionStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    this.sessionStorage.removeItem('opti_connect_token');
  }
}


