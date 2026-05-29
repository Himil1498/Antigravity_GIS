/**
 * Region Request API Client
 * Configured Axios instance with interceptors
 */

import axios from "axios";
import { BACKEND_API_URL } from "./constants";

// Create axios instance for region request APIs
export const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

