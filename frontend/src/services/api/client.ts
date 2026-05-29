/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios from "axios";
import { getConfig } from "./config";

const config = getConfig();

// Create axios instance
export const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: any) => {
    // Check sessionStorage first (default), then localStorage (persistent "Keep me signed in" sessions)
    const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    if (config.headers) {
      config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      config.headers["X-Request-Time"] = new Date().toISOString();
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

let lastMaintenanceTrigger = 0;
let maintenanceFailures: number[] = [];
const MAINTENANCE_THRESHOLD = 3; // Require 3 consecutive 502/503 before triggering maintenance

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - LOG ONLY, DO NOT AUTO-LOGOUT
      console.warn(
        "⚠️ 401 Unauthorized - Request failed but session remains active"
      );
      console.warn("Request URL:", error.config?.url);

      // ONLY logout on login endpoint failures (not token verify/refresh)
      if (error.config?.url?.includes("/auth/login")) {
        console.error("Login failed");
      }
    }

    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data);
      
      // TRIGGER MAINTENANCE MODE OVERLAY FOR 502/503
      // Requires 3 consecutive failures within 30s to prevent false positives
      // from transient nginx restarts or brief PM2 cold-starts
      if (error.response?.status === 502 || error.response?.status === 503) {
        const now = Date.now();
        maintenanceFailures.push(now);
        // Keep only failures within the last 30 seconds
        maintenanceFailures = maintenanceFailures.filter(t => now - t < 30000);
        
        if (maintenanceFailures.length >= MAINTENANCE_THRESHOLD && now - lastMaintenanceTrigger > 30000) {
          console.warn("⚠️ System Maintenance Detected (3+ consecutive 502/503). Triggering overlay...");
          window.dispatchEvent(new Event("system:maintenance_mode"));
          lastMaintenanceTrigger = now;
          maintenanceFailures = []; // Reset after triggering
        }
      }
    }

    return Promise.reject(error);
  }
);

