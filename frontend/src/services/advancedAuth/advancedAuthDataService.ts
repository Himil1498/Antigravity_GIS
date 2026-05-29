/**
 * Advanced Auth Data Service
 * Coordinates session persistence and restoration
 */

import type { AuthSession, SessionInfo } from "./types";
import { SessionManager } from "./sessionManager";
import { StorageManager } from "./storageManager";

export class AdvancedAuthDataService {
  constructor(
    private sessionManager: SessionManager,
    private storageManager: StorageManager
  ) {}

  /**
   * Persist session to both sessionStorage and localStorage
   */
  persistFullSession(): void {
    const session = this.sessionManager.getSession();
    if (!session) return;

    this.storageManager.updateSessionStorage(session);
    this.storageManager.updatePersistentStorage(session);
  }

  /**
   * Persist the current session to sessionStorage only
   */
  persistSessionSnapshot(): void {
    const session = this.sessionManager.getSession();
    if (!session) return;

    this.storageManager.updateSessionStorage(session);
  }

  /**
   * Restore session from storage and hydrate the session manager
   */
  restoreSession(): AuthSession | null {
    const session = this.storageManager.restoreSession();
    if (session) {
      this.sessionManager.setSession(session);
      return session;
    }
    return null;
  }

  /**
   * Update activity and save a fresh snapshot to storage
   */
  syncActivitySnapshot(): void {
    this.sessionManager.updateActivity();
    this.persistSessionSnapshot();
  }

  /**
   * Clear all persisted session data and reset the session manager
   */
  clearSessionState(): void {
    this.sessionManager.setSession(null);
    this.storageManager.clearSessionData();
  }

  /**
   * Read user preferences from persistent storage
   */
  getUserPreferences(): any {
    return this.storageManager.getUserPreferences();
  }

  /**
   * Expose session info from the session manager
   */
  getSessionInfo(): SessionInfo | null {
    const info = this.sessionManager.getSessionInfo();
    return info || null;
  }
}


