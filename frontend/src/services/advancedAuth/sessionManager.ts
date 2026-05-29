/**
 * Advanced Auth Session Manager
 * Handles login, logout, token refresh, and session validation
 */

import type { LoginCredentials, User, LoginSuccessResponse } from "../../types/auth/index";
import type { AuthSession } from "./types";
import { apiService } from "../api/index";
import { websocketService } from "../websocket/index";
import { AUTH_CONFIG } from "./constants";
import { generateSessionId, getDeviceInfo } from "./utils";

export class SessionManager {
  private session: AuthSession | null = null;

  /**
   * Login user with enhanced session management
   */
  async login(
    credentials: LoginCredentials,
    onSuccess: (user: User, token: string) => void
  ): Promise<{ user: User; accessToken: string }> {
    try {
      // Perform login via API
      const response = await apiService.login(credentials);

      // Check if 2FA is required
      if ("require2FA" in response && response.require2FA) {
        throw new Error("2FA Required");
      }

      const successResponse = response as LoginSuccessResponse;

      // Create new session
      const sessionId = generateSessionId();
      const now = Date.now();
      const deviceInfo = getDeviceInfo();

      this.session = {
        sessionId,
        accessToken: successResponse.token,
        refreshToken: successResponse.refreshToken || successResponse.token,
        user: successResponse.user,
        expiresAt: now + AUTH_CONFIG.ACCESS_TOKEN_LIFETIME,
        refreshExpiresAt: now + AUTH_CONFIG.REFRESH_TOKEN_LIFETIME,
        lastActivity: now,
        deviceInfo,
      };

      // Connect WebSocket
      console.log(
        "🔌 Attempting WebSocket connection for user:",
        successResponse.user.username
      );
      websocketService
        .connect()
        .then((connected) => {
          if (connected) {
            console.log(
              "✅ WebSocket connected for user:",
              successResponse.user.username
            );
          } else {
            console.error(
              "❌ WebSocket connection FAILED for user:",
              successResponse.user.username
            );
          }
        })
        .catch((error) => {
          console.error("❌ WebSocket connection error:", error);
        });

      // Notify success
      onSuccess(successResponse.user, successResponse.token);

      return {
        user: successResponse.user,
        accessToken: successResponse.token,
      };
    } catch (error) {
      console.error("❌ Advanced login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user with complete cleanup
   */
  async logout(
    notifyServer: boolean,
    onComplete: () => void
  ): Promise<void> {
    try {
      // Notify server if requested
      if (notifyServer && this.session?.accessToken) {
        try {
          await apiService.logout(this.session.accessToken);
        } catch (error) {
          console.warn("Failed to notify server of logout:", error);
        }
      }

      // Disconnect WebSocket
      websocketService.disconnect();

      // Clear session
      this.session = null;

      // Notify completion
      onComplete();
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still clear local data even if server notification fails
      websocketService.disconnect();
      this.session = null;
      onComplete();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(
    onExpiry: (reason: string) => void,
    refreshToken: () => Promise<void>
  ): boolean {
    if (!this.session) return false;

    const now = Date.now();

    // Check if access token is expired and refresh token is still valid
    if (now > this.session.expiresAt) {
      if (now < this.session.refreshExpiresAt) {
        // Access token expired but refresh token is valid - try refresh
        refreshToken();
        return true; // Optimistically return true while refresh is in progress
      } else {
        // Both tokens expired
        onExpiry("token_expired");
        return false;
      }
    }

    // Check for idle timeout
    if (now - this.session.lastActivity > AUTH_CONFIG.MAX_IDLE_TIME) {
      onExpiry("idle_timeout");
      return false;
    }

    return true;
  }

  /**
   * Refresh access token silently
   */
  async refreshTokenSilently(
    onSuccess: (newToken: string) => void,
    onFailure: (reason: string) => void
  ): Promise<void> {
    if (!this.session?.refreshToken) return;

    try {
      const newToken = await apiService.refreshToken(this.session.refreshToken);

      if (newToken && this.session) {
        this.session.accessToken = newToken;
        this.session.expiresAt = Date.now() + AUTH_CONFIG.ACCESS_TOKEN_LIFETIME;
        onSuccess(newToken);
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      onFailure("refresh_failed");
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.session?.user || null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.session?.accessToken || null;
  }

  /**
   * Get current session
   */
  getSession(): AuthSession | null {
    return this.session;
  }

  /**
   * Set session (used for restoration)
   */
  setSession(session: AuthSession | null): void {
    this.session = session;
  }

  /**
   * Update last activity
   */
  updateActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
    }
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo(): any {
    if (!this.session) return null;

    return {
      sessionId: this.session.sessionId,
      isValid: true, // Caller should validate separately
      expiresAt: new Date(this.session.expiresAt).toISOString(),
      refreshExpiresAt: new Date(this.session.refreshExpiresAt).toISOString(),
      lastActivity: new Date(this.session.lastActivity).toISOString(),
      deviceInfo: this.session.deviceInfo,
      user: {
        id: this.session.user.id,
        email: this.session.user.email,
        role: this.session.user.role,
      },
    };
  }
}


