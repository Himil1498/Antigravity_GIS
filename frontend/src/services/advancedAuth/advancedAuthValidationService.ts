/**
 * Advanced Auth Validation Service
 * Centralizes validation and lifecycle handlers
 */

import { AUTH_CONFIG } from "./constants";
import { AdvancedAuthDataService } from "./advancedAuthDataService";
import { ListenerManager } from "./listenerManager";
import { SessionManager } from "./sessionManager";
import { StorageManager } from "./storageManager";
import { TimerManager } from "./timerManager";

export class AdvancedAuthValidationService {
  constructor(
    private sessionManager: SessionManager,
    private storageManager: StorageManager,
    private listenerManager: ListenerManager,
    private timerManager: TimerManager,
    private dataService: AdvancedAuthDataService
  ) {}

  /**
   * Validate authentication, performing silent refresh when needed
   */
  validateAuthentication(refreshTokenSilently: () => Promise<void>): boolean {
    return this.sessionManager.isAuthenticated(
      (reason) => this.handleSessionExpiry(reason),
      refreshTokenSilently
    );
  }

  /**
   * Standardized session expiry handling
   */
  handleSessionExpiry(reason: string): void {
    this.dataService.clearSessionState();
    this.timerManager.clearTimers();
    this.listenerManager.notifyAuthStateListeners(false, null);
    this.listenerManager.notifySessionEndListeners(reason);
  }

  handleBeforeUnload(): void {
    this.dataService.syncActivitySnapshot();
    this.storageManager.clearAccessTokenOnUnload();
  }

  handleUnload(): void {
    this.timerManager.clearTimers();
    this.storageManager.clearAccessTokenOnUnload();
  }

  handleVisibilityChange(refreshTokenSilently: () => Promise<void>): void {
    if (document.hidden) {
      this.dataService.syncActivitySnapshot();
      return;
    }

    if (!this.validateAuthentication(refreshTokenSilently)) {
      this.dataService.clearSessionState();
      this.listenerManager.notifyAuthStateListeners(false, null);
    }
  }

  handleWindowFocus(refreshTokenSilently: () => Promise<void>): void {
    if (!this.validateAuthentication(refreshTokenSilently)) {
      this.handleSessionExpiry("focus_validation_failed");
    }
  }

  handleWindowBlur(): void {
    this.dataService.syncActivitySnapshot();
  }

  handleStorageChange(event: StorageEvent): void {
    if (event.key === AUTH_CONFIG.REFRESH_TOKEN_KEY) {
      if (!event.newValue && this.sessionManager.getSession()) {
        this.handleSessionExpiry("cross_tab_logout");
      }
    }
  }

  handleOnline(): void {
    // Heartbeat will revalidate access tokens on its next interval
  }

  handleOffline(): void {
    // No-op: offline state is tolerated until timers revalidate
  }
}


