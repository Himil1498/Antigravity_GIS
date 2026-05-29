
import axios from 'axios';
import { BACKEND_API_URL, DEFAULT_TIMEOUT } from './constants';

const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

