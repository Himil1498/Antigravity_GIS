/**
 * useSessionValidator Hook
 * Automatically validates session and logs out user if session is terminated
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/index';
import { logout } from '../store/slices/authSlice';
import { validateSession } from '../services/sessionValidator';
import { showToast } from '../utils/toastUtils';

interface UseSessionValidatorOptions {
  /**
   * Interval in milliseconds to check session validity
   * Default: 10000 (10 seconds)
   */
  interval?: number;

  /**
   * Whether to enable session validation
   * Default: true
   */
  enabled?: boolean;

  /**
   * Callback when session is terminated
   */
  onSessionTerminated?: () => void;
}

/**
 * Hook to automatically validate session and logout user if session is terminated
 * @param options - Configuration options
 */
export function useSessionValidator(options: UseSessionValidatorOptions = {}) {
  const {
    interval = 10000, // Check every 10 seconds
    enabled = true,
    onSessionTerminated
  } = options;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Function to check session
    const checkSession = async () => {
      // Prevent concurrent checks
      if (isCheckingRef.current || hasLoggedOutRef.current) {
        return;
      }

      isCheckingRef.current = true;

      try {
        const isValid = await validateSession();

        if (!isValid && !hasLoggedOutRef.current) {
          
          hasLoggedOutRef.current = true;

          // Clear interval before logout
          if (intervalRef.current) {
            
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Call callback if provided
          if (onSessionTerminated) {
            
            onSessionTerminated();
          }

          // Show toast notification
          
          showToast.error('Your session has been terminated by an administrator. Please log in again.', {
            autoClose: 2000
          });

          // Dispatch Redux logout action
          
          dispatch(logout());

          // Navigate to login page after a short delay
          
          setTimeout(() => {
            
            navigate('/login', {
              replace: true,
              state: {
                reason: 'session_terminated',
                message: 'Your session has been terminated by an administrator'
              }
            });
          }, 1000);
        } else if (isValid) {
          
        }
      } catch (error) {
        console.error('❌ Session validation error:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Initial check after a short delay (to avoid checking on mount)
    const initialTimeout = setTimeout(checkSession, 5000);

    // Set up periodic checking
    intervalRef.current = setInterval(checkSession, interval);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, onSessionTerminated, dispatch, navigate]);
}

