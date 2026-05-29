import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useAppSelector, useAppDispatch, persistor } from "../store/index";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from "../store/slices/authSlice";
import type { User, LoginCredentials } from "../types/auth/index";
import { apiService } from "../services/api/index";
import { sessionManager } from "../services/sessionManager";
import { showToast, toastMessages } from "../utils/toastUtils";
import { websocketService } from "../services/websocket/index";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, token } = useAppSelector(
    (state) => state.auth,
  );
  const wsConnectedRef = useRef(false);

  // Initialize session manager for auto-logout on browser close
  useEffect(() => {
    if (isAuthenticated) {
      // Start session tracking
      sessionManager.initSession();

      // Register logout callback
      sessionManager.onLogout(() => {
        handleLogout();
      });

      return () => {
        // Cleanup on unmount (but session continues in other tabs)
        sessionManager.destroy();
      };
    }
  }, [isAuthenticated]);

  // GLOBAL WebSocket connection - connects on ANY page when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !wsConnectedRef.current) {
      wsConnectedRef.current = true;
      websocketService.connect().then((connected: boolean) => {
        if (connected) {
          console.log("✅ [AuthContext] Global WebSocket connected for force-logout monitoring");
        } else {
          console.warn("⚠️ [AuthContext] WebSocket connection failed");
          wsConnectedRef.current = false;
        }
      }).catch((err: any) => {
        console.warn("⚠️ [AuthContext] WebSocket connection error:", err);
        wsConnectedRef.current = false;
      });
    }

    if (!isAuthenticated) {
      wsConnectedRef.current = false;
    }
  }, [isAuthenticated, token]);

  // Check session validity on mount
  useEffect(() => {
    if (isAuthenticated && !sessionManager.isSessionValid()) {
      console.warn("⚠️ Session invalid - logging out");
      handleLogout();
    }
  }, []);

  // Listen for WebSocket force_logout & session_expired events
  useEffect(() => {
    const immediateForceLogout = () => {
      // 1. Synchronously dispatch Redux logout (clears isAuthenticated)
      dispatch(logout());

      // 2. Nuke ALL auth tokens from browser storage
      sessionStorage.removeItem("opti_connect_token");
      sessionStorage.removeItem("opti_connect_user");
      sessionStorage.removeItem("opti_connect_session_start");
      sessionStorage.removeItem("opti_access_token");
      localStorage.removeItem("opti_connect_token");
      localStorage.removeItem("opti_connect_user");
      localStorage.removeItem("opti_refresh_token");
      localStorage.removeItem("opti_remember_me");
      localStorage.removeItem("opti_connect_session_start");

      // 3. Purge redux-persist so REHYDRATE won't restore stale state
      persistor.purge();

      // 4. Disconnect WebSocket
      websocketService.disconnect();
      wsConnectedRef.current = false;
    };

    const forceLogoutHandler = (event: any) => {
      console.error("🔒 FORCE LOGOUT: Session terminated by administrator!");
      showToast.error("Your session has been terminated by an administrator");
      immediateForceLogout();
      // Hard redirect to login after a brief delay for the toast to show
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    };

    const sessionExpiredHandler = (event: any) => {
      console.error("⏳ SESSION EXPIRED: Please login again!");
      showToast.error("Your session has expired. Please login again.");
      immediateForceLogout();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    };

    window.addEventListener("auth:force_logout", forceLogoutHandler);
    window.addEventListener("auth:session_expired", sessionExpiredHandler);
    
    return () => {
      window.removeEventListener("auth:force_logout", forceLogoutHandler);
      window.removeEventListener("auth:session_expired", sessionExpiredHandler);
    };
  }, [dispatch]);

  // Background token verification - DISABLED for now to ensure session persistence
  // Token is only invalidated on explicit logout or 401/403 from API
  useEffect(() => {
    // Optional: Verify token in background but NEVER logout automatically
    // This can be used for logging/monitoring only
    const verifyAuth = async () => {
      if (isAuthenticated && token) {
        try {
          const isValid = await apiService.verifyToken(token);
          if (!isValid) {
            console.warn(
              "⚠️ Token verification failed, but session remains active",
            );
            // IMPORTANT: Do NOT logout here - session stays active until explicit logout
          }
        } catch (error) {
          console.warn("Token verification error (ignoring):", error);
          // IMPORTANT: Do NOT logout on network errors
        }
      }
    };

    // Comment out to completely disable background verification
    // verifyAuth();
  }, [isAuthenticated, token]);

  // Set up token refresh interval - DISABLED to prevent auto-logout
  useEffect(() => {
    if (isAuthenticated && token) {
      const refreshInterval = setInterval(
        async () => {
          try {
            const refreshedToken = await apiService.refreshToken(token);
            if (refreshedToken && user) {
              dispatch(loginSuccess({ user, token: refreshedToken }));
            }
          } catch (error) {
            console.warn("Token refresh failed (non-critical):", error);
            // IMPORTANT: Do NOT logout on refresh failure
            // Session remains active until explicit logout
          }
        },
        15 * 60 * 1000,
      ); // Refresh every 15 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, token, user, dispatch]);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    dispatch(loginStart());

    try {
      // Always use real backend - mock mode is disabled

      const response = await apiService.login(credentials);

      // Check if 2FA is required (type guard)
      if ("require2FA" in response && response.require2FA) {
        // Throw error with 2FA data so LoginPage can handle it
        const error: any = new Error("2FA Required");
        error.response = {
          data: {
            require2FA: true,
            userId: response.userId,
            email: response.email,
            expiresIn: response.expiresIn || 600,
          },
        };
        throw error;
      }

      // At this point, TypeScript knows it's a LoginSuccessResponse
      // Use type assertion for safety
      const successResponse =
        response as import("../types/auth").LoginSuccessResponse;
      dispatch(
        loginSuccess({
          user: successResponse.user,
          token: successResponse.token,
        }),
      );
      showToast.success(toastMessages.auth.loginSuccess);
    } catch (error: any) {
      // If it's a 2FA requirement, re-throw without dispatching failure
      if (error.response?.data?.require2FA) {
        throw error;
      }

      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      throw error; // Re-throw to allow login form to handle it
    }
  };

  const handleLogout = async (): Promise<void> => {
    // Notify the backend first to update is_online status (BEFORE clearing token)
    if (token) {
      try {
        await apiService.logout(token);
      } catch (error) {
        console.error("⚠️ Failed to notify backend of logout:", error);
        // Continue with logout anyway
      }
    }

    // Disconnect WebSocket
    websocketService.disconnect();
    wsConnectedRef.current = false;

    // Then clear local state
    dispatch(logout());
    showToast.success(toastMessages.auth.logoutSuccess);
  };

  const handleClearError = (): void => {
    dispatch(clearError());
  };

  const checkAuthStatus = async (): Promise<void> => {
    if (token) {
      try {
        const isValid = await apiService.verifyToken(token);
        if (!isValid) {
          handleLogout();
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
        handleLogout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
    checkAuthStatus,
  };

  // No loading screen needed - Redux restores state synchronously from localStorage
  // This provides instant access to authenticated routes on refresh
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
