/**
 * API Service Configuration
 * Environment-based configuration for API endpoints
 */

const BACKEND_API_URL =
  process.env.REACT_APP_API_URL || "http://172.16.0.148:82/api";

export const API_CONFIG = {
  development: {
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:82/api",
    timeout: 900000,
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || "http://172.16.20.11:82/api",
    timeout: 900000,
  },
};

export const getConfig = () => {
  return process.env.NODE_ENV === "production"
    ? API_CONFIG.production
    : API_CONFIG.development;
};

