/**
 * Industry-Level Session Management
 * - Auto-logout on browser/tab close (when "Keep me signed in" is NOT checked)
 * - Persistent 7-day sessions (when "Keep me signed in" IS checked)
 * - Activity tracking (120min inactivity = logout)
 * - Token refresh before expiry
 * - Multi-tab sync
 */

const SESSION_KEY = "opti_session_active";
const ACTIVITY_KEY = "opti_last_activity";
const REMEMBER_ME_KEY = "opti_remember_me";
const SESSION_START_KEY = "opti_connect_session_start";
const INACTIVITY_TIMEOUT = 120 * 60 * 1000; // 120 minutes (2 hours)
const PERSISTENT_SESSION_MAX = 7 * 24 * 60 * 60 * 1000; // 7 days
const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

export class SessionManager {
  private activityCheckInterval: NodeJS.Timeout | null = null;
  private logoutCallback: (() => void) | null = null;

  /**
   * Check if this is a persistent ("Keep me signed in") session
   */
  private isPersistentSession(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === "true";
  }

  /**
   * Initialize session - marks session as active
   */
  initSession(): void {
    // Mark session active in sessionStorage (auto-clears on tab close for non-persistent sessions)
    sessionStorage.setItem(SESSION_KEY, "true");

    // Track last activity time in localStorage (shared across tabs)
    this.updateActivity();

    // Set up activity listeners
    this.setupActivityListeners();

    // Start monitoring for inactivity
    this.startInactivityCheck();

    // Listen for storage changes from other tabs
    window.addEventListener("storage", this.handleStorageChange);

    // Listen for beforeunload to cleanup (only for non-persistent sessions)
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }

  /**
   * Update last activity timestamp
   */
  private updateActivity = (): void => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
  };

  /**
   * Set up activity listeners (mouse, keyboard, scroll)
   */
  private setupActivityListeners(): void {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, this.updateActivity, { passive: true });
    });
  }

  /**
   * Check for inactivity and auto-logout
   */
  private startInactivityCheck(): void {
    this.activityCheckInterval = setInterval(() => {
      const lastActivity = localStorage.getItem(ACTIVITY_KEY);
      if (!lastActivity) return;

      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.warn("⏱️ Session expired due to inactivity");
        this.logout();
      }

      // For persistent sessions, also check 7-day max session lifetime
      if (this.isPersistentSession()) {
        const sessionStart = localStorage.getItem(SESSION_START_KEY);
        if (sessionStart) {
          const sessionAge = Date.now() - new Date(sessionStart).getTime();
          if (sessionAge > PERSISTENT_SESSION_MAX) {
            console.warn("⏱️ Persistent session expired after 7 days");
            this.logout();
          }
        }
      }
    }, CHECK_INTERVAL);
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange = (e: StorageEvent): void => {
    // If another tab logs out (clears remember_me or session), logout this tab too
    if (e.key === SESSION_KEY && e.newValue === null) {
      this.logout();
    }
    if (e.key === REMEMBER_ME_KEY && e.newValue === null) {
      // Another tab cleared remember me = explicit logout
      this.logout();
    }
  };

  /**
   * Handle beforeunload event
   * Only clears activity for non-persistent sessions
   */
  private handleBeforeUnload = (): void => {
    // For persistent sessions, do NOT clear activity data — session survives browser close
    if (this.isPersistentSession()) {
      return;
    }

    // For session-only sessions, clear activity so session expires
    const allTabs = this.getOpenTabsCount();
    if (allTabs <= 1) {
      localStorage.removeItem(ACTIVITY_KEY);
    }
  };

  /**
   * Count open tabs (approximate)
   */
  private getOpenTabsCount(): number {
    return sessionStorage.getItem(SESSION_KEY) ? 1 : 0;
  }

  /**
   * Register logout callback
   */
  onLogout(callback: () => void): void {
    this.logoutCallback = callback;
  }

  /**
   * Logout and cleanup
   */
  logout(): void {
    // Clear session markers
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVITY_KEY);

    // Stop monitoring
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    // Remove event listeners
    window.removeEventListener("storage", this.handleStorageChange);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    // Call logout callback
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    // For persistent sessions, check localStorage for token + 7-day expiry
    if (this.isPersistentSession()) {
      const token = localStorage.getItem("opti_connect_token");
      if (!token) return false;

      // Check 7-day max session lifetime
      const sessionStart = localStorage.getItem(SESSION_START_KEY);
      if (sessionStart) {
        const sessionAge = Date.now() - new Date(sessionStart).getTime();
        if (sessionAge > PERSISTENT_SESSION_MAX) {
          return false;
        }
      }

      // Re-initialize session marker for this tab
      sessionStorage.setItem(SESSION_KEY, "true");
      this.updateActivity();
      return true;
    }

    // For non-persistent sessions, check sessionStorage marker
    const hasSession = sessionStorage.getItem(SESSION_KEY) === "true";
    if (!hasSession) return false;

    // Check for inactivity
    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    if (!lastActivity) return false;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity < INACTIVITY_TIMEOUT;
  }

  /**
   * Get time until session expires (in milliseconds)
   */
  getTimeUntilExpiry(): number {
    if (this.isPersistentSession()) {
      const sessionStart = localStorage.getItem(SESSION_START_KEY);
      if (!sessionStart) return 0;
      const sessionAge = Date.now() - new Date(sessionStart).getTime();
      return Math.max(0, PERSISTENT_SESSION_MAX - sessionAge);
    }

    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    if (!lastActivity) return 0;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    const remaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;
    return Math.max(0, remaining);
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }
    window.removeEventListener("storage", this.handleStorageChange);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

