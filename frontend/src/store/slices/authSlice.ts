import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth/index';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state - redux-persist will handle restoration
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Check if user opted for persistent session ("Keep me signed in for 7 days")
      const rememberMe = localStorage.getItem('opti_remember_me') === 'true';

      if (rememberMe) {
        // Persistent session — store in localStorage (survives browser close)
        localStorage.setItem('opti_connect_token', action.payload.token);
        localStorage.setItem('opti_connect_user', JSON.stringify(action.payload.user));
        localStorage.setItem('opti_connect_session_start', new Date().toISOString());
        // Clear any sessionStorage remnants
        sessionStorage.removeItem('opti_connect_token');
        sessionStorage.removeItem('opti_connect_user');
        sessionStorage.removeItem('opti_connect_session_start');
      } else {
        // Session-only — store in sessionStorage (clears on browser close)
        sessionStorage.setItem('opti_connect_token', action.payload.token);
        sessionStorage.setItem('opti_connect_user', JSON.stringify(action.payload.user));
        sessionStorage.setItem('opti_connect_session_start', new Date().toISOString());
        // Clear any localStorage remnants
        localStorage.removeItem('opti_connect_token');
        localStorage.removeItem('opti_connect_user');
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      // Clear both storages
      sessionStorage.removeItem('opti_connect_token');
      sessionStorage.removeItem('opti_connect_user');
      localStorage.removeItem('opti_connect_token');
      localStorage.removeItem('opti_connect_user');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      // Clear ALL auth data from both storages
      sessionStorage.removeItem('opti_connect_token');
      sessionStorage.removeItem('opti_connect_user');
      sessionStorage.removeItem('opti_connect_session_start');
      localStorage.removeItem('opti_connect_token');
      localStorage.removeItem('opti_connect_user');
      localStorage.removeItem('opti_connect_session_start');
      localStorage.removeItem('opti_remember_me');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Sync to the correct storage based on session type
        const userJson = JSON.stringify(state.user);
        if (localStorage.getItem('opti_remember_me') === 'true') {
          localStorage.setItem('opti_connect_user', userJson);
        } else {
          sessionStorage.setItem('opti_connect_user', userJson);
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;


