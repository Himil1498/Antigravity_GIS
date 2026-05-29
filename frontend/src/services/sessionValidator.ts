/**
 * Session Validator
 * Utilities for validating and monitoring session status
 */

import axios from 'axios';
import { store, persistor } from '../store/index';
import { logout } from '../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

interface SessionValidationResponse {
  success: boolean;
  valid: boolean;
  error?: string;
  sessionTerminated?: boolean;
  session?: {
    loginTime: string;
    lastActivity: string;
  };
}

/**
 * Validate current session with backend
 * @returns {Promise<boolean>} True if session is valid
 */
export async function validateSession(): Promise<boolean> {
  try {
    const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');

    if (!token) {
      
      return false;
    }

    const response = await axios.get<SessionValidationResponse>(
      `${API_URL}/auth/validate-session`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      }
    );

    const isValid = response.data.valid === true;
    
    return isValid;

  } catch (error: any) {

    // If we get a 401 or session terminated error, return false
    if (error.response?.status === 401 || error.response?.data?.sessionTerminated) {
      return false;
    }

    // For other errors (network issues, etc.), assume session is still valid
    // to avoid unnecessary logouts due to temporary connection issues
    console.warn('⚠️ Session validation check failed (treating as valid):', error.message);
    return true;
  }
}

/**
 * Force logout user by clearing local storage and redirecting
 */
export function forceLogout(reason: string = 'Session terminated'): void {

  // CRITICAL FIX: Dispatch Redux logout so it updates the in-memory state
  // and prevents redux-persist from writing stale data back to localStorage on page unload!
  store.dispatch(logout());
  persistor.purge();

  // Clear all auth data from both storages
  sessionStorage.removeItem('opti_connect_token');
  sessionStorage.removeItem('opti_connect_user');
  localStorage.removeItem('opti_connect_token');
  localStorage.removeItem('opti_connect_user');
  localStorage.removeItem('opti_remember_me');
  localStorage.removeItem('opti_connect_session_start');
  
  localStorage.removeItem('persist:root');
  sessionStorage.removeItem('persist:root');

  // Show notification
  const event = new CustomEvent('session-terminated', {
    detail: { reason }
  });
  window.dispatchEvent(event);

  // Redirect to login with message
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    window.location.href = `/login?reason=session_terminated&message=${encodeURIComponent(reason)}`;
  }
}

