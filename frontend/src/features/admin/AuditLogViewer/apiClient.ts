/**
 * API Client for Audit Log operations
 * Configured axios instance with authentication
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

export const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

