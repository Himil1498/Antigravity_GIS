import { advancedAuthService } from '../services/advancedAuth/index';
import type { User } from '../types/auth/index';

export type SessionEndReason =
  | 'idle_timeout'
  | 'token_expired'
  | 'manual_logout'
  | 'cross_tab_logout'
  | 'server_invalidation'
  | 'refresh_failed'
  | 'focus_validation_failed'
  | 'forced'
  | 'session_expired'
  | 'admin_forced'
  | 'logout_error'
  | string;

export type SessionEndNotification = {
  type: 'success' | 'error';
  message: string;
};

export const getSessionEndNotification = (
  reason: SessionEndReason
): SessionEndNotification => {
  switch (reason) {
    case 'idle_timeout':
      return {
        type: 'error',
        message: 'Session expired due to inactivity. Please login again.',
      };
    case 'token_expired':
      return {
        type: 'error',
        message: 'Your session has expired. Please login again.',
      };
    case 'manual_logout':
      return {
        type: 'success',
        message: 'Logged out successfully',
      };
    case 'cross_tab_logout':
      return {
        type: 'error',
        message: 'You have been logged out from another tab',
      };
    case 'server_invalidation':
      return {
        type: 'error',
        message: 'Session invalidated by server. Please login again.',
      };
    case 'refresh_failed':
      return {
        type: 'error',
        message: 'Unable to refresh session. Please login again.',
      };
    case 'focus_validation_failed':
      return {
        type: 'error',
        message: 'Session validation failed. Please login again.',
      };
    case 'forced':
      return {
        type: 'error',
        message: 'Session terminated. Please login again.',
      };
    default:
      return {
        type: 'error',
        message: 'Session ended. Please login again.',
      };
  }
};

export type SessionDebugContext = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  user: User | null;
  sessionInfo: any;
};

export const buildSessionDebugInfo = (context: SessionDebugContext): any => {
  const { isAuthenticated, isLoading, error, isOnline, user, sessionInfo } =
    context;

  return {
    authServiceInfo: advancedAuthService.getSessionInfo(),
    contextState: {
      isAuthenticated,
      isLoading,
      hasError: !!error,
      isOnline,
      userEmail: user?.email,
      sessionExists: !!sessionInfo,
    },
    preferences: advancedAuthService.getUserPreferences(),
    browserInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    },
    timestamp: new Date().toISOString(),
  };
};



