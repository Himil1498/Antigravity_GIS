
import axios from 'axios';
import { store, persistor } from '../../store/index';
import { logout } from '../../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use(
  (config) => {
    // IMPORTANT: Use 'opti_connect_token' to match authSlice.ts storage key
    const token = sessionStorage.getItem('opti_connect_token') ||
                  localStorage.getItem('opti_connect_token') ||
                  sessionStorage.getItem('token') || // Fallback for backward compatibility
                  localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear all tokens and redirect to login
      
      // CRITICAL FIX: Dispatch Redux logout so it updates the in-memory state
      // and prevents redux-persist from writing stale data back to localStorage on page unload!
      store.dispatch(logout());
      persistor.purge();

      sessionStorage.removeItem('opti_connect_token');
      localStorage.removeItem('opti_connect_token');
      sessionStorage.removeItem('token'); // Backward compatibility
      localStorage.removeItem('token');
      
      localStorage.removeItem('persist:root');
      sessionStorage.removeItem('persist:root');

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

