/**
 * Advanced Auth Listener Manager
 * Manages auth state and session end listeners
 */

import type { User } from "../../types/auth/index";
import type { AuthStateListener, SessionEndListener } from "./types";

export class ListenerManager {
  private authStateListeners: AuthStateListener[] = [];
  private sessionEndListeners: SessionEndListener[] = [];

  /**
   * Add auth state listener
   */
  addAuthStateListener(listener: AuthStateListener): void {
    this.authStateListeners.push(listener);
  }

  /**
   * Remove auth state listener
   */
  removeAuthStateListener(listener: AuthStateListener): void {
    const index = this.authStateListeners.indexOf(listener);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  /**
   * Add session end listener
   */
  addSessionEndListener(listener: SessionEndListener): void {
    this.sessionEndListeners.push(listener);
  }

  /**
   * Remove session end listener
   */
  removeSessionEndListener(listener: SessionEndListener): void {
    const index = this.sessionEndListeners.indexOf(listener);
    if (index > -1) {
      this.sessionEndListeners.splice(index, 1);
    }
  }

  /**
   * Notify all auth state listeners
   */
  notifyAuthStateListeners(isAuthenticated: boolean, user: User | null): void {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(isAuthenticated, user);
      } catch (error) {
        console.error("Auth state listener error:", error);
      }
    });
  }

  /**
   * Notify all session end listeners
   */
  notifySessionEndListeners(reason: string): void {
    this.sessionEndListeners.forEach((listener) => {
      try {
        listener(reason);
      } catch (error) {
        console.error("Session end listener error:", error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clearAll(): void {
    this.authStateListeners = [];
    this.sessionEndListeners = [];
  }
}


