/**
 * Advanced Auth Timer Manager  
 * Manages heartbeat and session monitoring timers
 */

import { apiService } from "../api/index";
import { AUTH_CONFIG } from "./constants";

export class TimerManager {
  private sessionCheckTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  /**
   * Start session monitoring timer
   */
  startSessionMonitoring(validateSessionFn: () => boolean): void {
    if (this.sessionCheckTimer) return;

    this.sessionCheckTimer = setInterval(() => {
      if (!validateSessionFn()) {
        this.clearTimers();
      }
    }, AUTH_CONFIG.SESSION_CHECK_INTERVAL);
  }

  /**
   * Start heartbeat timer to keep session alive
   */
  startHeartbeat(
    accessTokenGetter: () => string | null,
    onInvalidToken: () => void
  ): void {
    if (this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(async () => {
      const accessToken = accessTokenGetter();
      if (accessToken) {
        try {
          await this.sendHeartbeat(accessToken, onInvalidToken);
        } catch (error) {
          console.warn("Heartbeat failed:", error);
        }
      }
    }, AUTH_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Send heartbeat to server
   */
  private async sendHeartbeat(
    accessToken: string,
    onInvalidToken: () => void
  ): Promise<void> {
    try {
      const isValid = await apiService.verifyToken(accessToken);
      if (!isValid) {
        onInvalidToken();
      }
    } catch (error) {
      // Don't immediately logout on heartbeat failure - could be network issue
      console.warn("Heartbeat verification failed:", error);
    }
  }

  /**
   * Clear all timers
   */
  clearTimers(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Check if timers are running
   */
  isRunning(): boolean {
    return this.sessionCheckTimer !== null || this.heartbeatTimer !== null;
  }
}

