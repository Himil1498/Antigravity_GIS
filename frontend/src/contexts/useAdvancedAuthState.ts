/**
 * Advanced Auth State Hook
 * Manages authentication state, event handlers, and auth actions
 */

import { useState, useEffect, useCallback } from "react";
import { showToast } from "../utils/toastUtils";
import { advancedAuthService } from "../services/advancedAuth/index";
import type { User, LoginCredentials } from "../types/auth/index";
import {
  buildSessionDebugInfo,
  getSessionEndNotification,
} from "./useAdvancedAuthStateHelpers";

export const useAdvancedAuthState = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Session end handler
  const handleSessionEnd = useCallback((reason: string) => {
    const { type, message } = getSessionEndNotification(reason);

    if (type === "success") {
      showToast.success(message);
    } else {
      showToast.error(message);
    }

    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setSessionInfo(null);
    setIsLoading(false);

    // Redirect to login if needed
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/"
    ) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  // Auth state change handler
  const handleAuthStateChange = useCallback(
    (authenticated: boolean, userData: User | null) => {
      setIsAuthenticated(authenticated);
      setUser(userData);
      setSessionInfo(
        authenticated ? advancedAuthService.getSessionInfo() : null,
      );
      setIsLoading(false);

      if (authenticated && userData) {
        showToast.success(`Welcome back, ${userData.name || userData.email}!`);
      }
    },
    [],
  );

  // Initialize auth service listeners
  useEffect(() => {
    // Add auth state listener
    advancedAuthService.addAuthStateListener(handleAuthStateChange);

    // Add session end listener
    advancedAuthService.addSessionEndListener(handleSessionEnd);

    // Initial state check
    const initialAuth = advancedAuthService.isAuthenticated();
    const initialUser = advancedAuthService.getCurrentUser();
    const initialSessionInfo = advancedAuthService.getSessionInfo();

    setIsAuthenticated(initialAuth);
    setUser(initialUser);
    setSessionInfo(initialSessionInfo);
    setIsLoading(false);

    // Cleanup
    return () => {
      advancedAuthService.removeAuthStateListener(handleAuthStateChange);
      advancedAuthService.removeSessionEndListener(handleSessionEnd);
    };
  }, [handleAuthStateChange, handleSessionEnd]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast.success("Back online! Validating session...");
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast.error("You are offline. Some features may not work.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Force logout listener (WebSocket event)
  useEffect(() => {
    const handleForceLogout = (event: any) => {
      showToast.error("Your session has been terminated by an administrator");
      advancedAuthService.forceLogout("admin_forced");
      setUser(null);
      setIsAuthenticated(false);
      setSessionInfo(null);
      setTimeout(() => (window.location.href = "/login"), 1500);
    };

    const handleSessionExpired = (event: any) => {
      showToast.error("Your session has expired. Please login again.");
      advancedAuthService.forceLogout("session_expired");
      setUser(null);
      setIsAuthenticated(false);
      setSessionInfo(null);
      setTimeout(() => (window.location.href = "/login"), 1500);
    };

    window.addEventListener(
      "auth:force_logout",
      handleForceLogout as EventListener,
    );
    window.addEventListener(
      "auth:session_expired",
      handleSessionExpired as EventListener,
    );

    return () => {
      window.removeEventListener(
        "auth:force_logout",
        handleForceLogout as EventListener,
      );
      window.removeEventListener(
        "auth:session_expired",
        handleSessionExpired as EventListener,
      );
    };
  }, []);

  // Session info updater
  useEffect(() => {
    if (isAuthenticated) {
      const updateSessionInfo = () => {
        setSessionInfo(advancedAuthService.getSessionInfo());
      };

      const interval = setInterval(updateSessionInfo, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await advancedAuthService.login(credentials);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      setIsLoading(false);
      showToast.error(errorMessage);
      throw error;
    }
  };

  // Logout handler
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await advancedAuthService.logout(true);
    } catch (error) {
      advancedAuthService.forceLogout("logout_error");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error handler
  const handleClearError = (): void => {
    setError(null);
  };

  // Refresh session handler
  const handleRefreshSession = async (): Promise<void> => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const isValid = advancedAuthService.isAuthenticated();
        if (!isValid) throw new Error("Session is no longer valid");
        showToast.success("Session refreshed successfully");
      } else {
        throw new Error("Not authenticated");
      }
    } catch (error) {
      showToast.error("Failed to refresh session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get session debug info
  const getSessionDebugInfo = (): any => {
    return buildSessionDebugInfo({
      isAuthenticated,
      isLoading,
      error,
      isOnline,
      user,
      sessionInfo,
    });
  };

  // Force logout
  const handleForceLogout = (reason: string = "forced"): void => {
    advancedAuthService.forceLogout(reason);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionInfo,
    isOnline,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
    refreshSession: handleRefreshSession,
    getSessionDebugInfo,
    forceLogout: handleForceLogout,
  };
};
