/**
 * Advanced Auth Service - Main Orchestrator
 * Composes all manager modules into cohesive authentication service
 */

import type { LoginCredentials, User } from "../../types/auth/index";
import type { AuthStateListener, SessionEndListener, SessionInfo } from "./types";
import { websocketService } from "../websocket/index";
import { AdvancedAuthDataService } from "./advancedAuthDataService";
import { AdvancedAuthValidationService } from "./advancedAuthValidationService";
import { EventManager } from "./eventManager";
import { ListenerManager } from "./listenerManager";
import { SessionManager } from "./sessionManager";
import { StorageManager } from "./storageManager";
import { TimerManager } from "./timerManager";

class AdvancedAuthService {
  private isInitialized = false;

  private storageManager = new StorageManager();
  private sessionManager = new SessionManager();
  private listenerManager = new ListenerManager();
  private timerManager = new TimerManager();
  private eventManager = new EventManager();
  private dataService = new AdvancedAuthDataService(
    this.sessionManager,
    this.storageManager
  );
  private validationService = new AdvancedAuthValidationService(
    this.sessionManager,
    this.storageManager,
    this.listenerManager,
    this.timerManager,
    this.dataService
  );

  constructor() {
    this.initializeAuthService();
  }

  private initializeAuthService(): void {
    if (this.isInitialized) return;

    this.setupBrowserEventListeners();
    this.setupActivityTracking();
    this.restoreSession();
    this.startBackgroundProcesses();

    this.isInitialized = true;
  }

  private setupBrowserEventListeners(): void {
    const refreshSilently = () => this.refreshTokenSilently();

    this.eventManager.setupBrowserEventListeners(
      () => this.validationService.handleBeforeUnload(),
      () => this.validationService.handleUnload(),
      () => this.validationService.handleVisibilityChange(refreshSilently),
      () => this.validationService.handleWindowFocus(refreshSilently),
      () => this.validationService.handleWindowBlur(),
      (event) => this.validationService.handleStorageChange(event),
      () => this.validationService.handleOnline(),
      () => this.validationService.handleOffline()
    );
  }

  private setupActivityTracking(): void {
    this.eventManager.setupActivityTracking(() =>
      this.dataService.syncActivitySnapshot()
    );
  }

  private startBackgroundProcesses(): void {
    this.timerManager.startSessionMonitoring(() => this.isAuthenticated());
    this.timerManager.startHeartbeat(
      () => this.sessionManager.getAccessToken(),
      () => this.validationService.handleSessionExpiry("server_invalidation")
    );
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; accessToken: string }> {
    await this.logout(false);

    const result = await this.sessionManager.login(credentials, (user) => {
      this.dataService.persistFullSession();
      this.startBackgroundProcesses();
      this.listenerManager.notifyAuthStateListeners(true, user);
    });

    return result;
  }

  async logout(notifyServer: boolean = true): Promise<void> {
    await this.sessionManager.logout(notifyServer, () => {
      this.timerManager.clearTimers();
      this.dataService.clearSessionState();
      this.listenerManager.notifyAuthStateListeners(false, null);
      this.listenerManager.notifySessionEndListeners("manual_logout");
    });
  }

  isAuthenticated(): boolean {
    return this.validationService.validateAuthentication(() =>
      this.refreshTokenSilently()
    );
  }

  getCurrentUser(): User | null {
    return this.sessionManager.getCurrentUser();
  }

  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.sessionManager.getAccessToken();
  }

  private async refreshTokenSilently(): Promise<void> {
    await this.sessionManager.refreshTokenSilently(
      () => this.dataService.persistSessionSnapshot(),
      (reason) => this.validationService.handleSessionExpiry(reason)
    );
  }

  private restoreSession(): void {
    const session = this.dataService.restoreSession();

    if (session) {
      if (Date.now() > session.expiresAt) {
        this.refreshTokenSilently();
      }

      websocketService.connect().then((connected) => {
        if (connected) {
          console.log(
            "✅ WebSocket connected for restored session:",
            session.user.username
          );
        } else {
          console.warn("⚠️ WebSocket connection failed for restored session");
        }
      });

      this.listenerManager.notifyAuthStateListeners(true, session.user);
    }
  }

  addAuthStateListener(listener: AuthStateListener): void {
    this.listenerManager.addAuthStateListener(listener);
  }

  removeAuthStateListener(listener: AuthStateListener): void {
    this.listenerManager.removeAuthStateListener(listener);
  }

  addSessionEndListener(listener: SessionEndListener): void {
    this.listenerManager.addSessionEndListener(listener);
  }

  removeSessionEndListener(listener: SessionEndListener): void {
    this.listenerManager.removeSessionEndListener(listener);
  }

  getUserPreferences(): any {
    return this.dataService.getUserPreferences();
  }

  forceLogout(reason: string = "forced"): void {
    websocketService.disconnect();
    this.validationService.handleSessionExpiry(reason);
  }

  getSessionInfo(): SessionInfo | null {
    const info = this.dataService.getSessionInfo();
    if (!info) return null;

    return {
      ...info,
      isValid: this.isAuthenticated(),
    };
  }
}

export const advancedAuthService = new AdvancedAuthService();
export default advancedAuthService;


