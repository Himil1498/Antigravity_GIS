import axios from 'axios';

const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

