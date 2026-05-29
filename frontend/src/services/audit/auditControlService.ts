import axios from 'axios';
import { BACKEND_API_URL, MAX_LOGS, STORAGE_KEY } from './constants';
import type { AuditEventType, AuditLogEntry, AuditLogFilter, AuditSeverity } from './types';
import type { User } from '../../types/auth/index';

// Create axios instance for audit logging
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get all audit logs
 */
export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const logs = JSON.parse(data);
    // Convert timestamp strings back to Date objects
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load audit logs:', error);
    return [];
  }
};

/**
 * Log an audit event
 */
export const logAuditEvent = async (
  user: User | null,
  eventType: AuditEventType,
  action: string,
  options: {
    severity?: AuditSeverity;
    region?: string;
    toolName?: string;
    details?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Promise<AuditLogEntry> => {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId: user?.id || 'anonymous',
    userName: user?.name || 'Anonymous',
    userEmail: user?.email || 'unknown',
    userRole: user?.role || 'Unknown',
    eventType,
    severity: options.severity || 'info',
    region: options.region,
    toolName: options.toolName,
    action,
    details: options.details || {},
    success: options.success !== undefined ? options.success : true,
    errorMessage: options.errorMessage
  };

  // Save to backend
  try {
    await apiClient.post('/audit/logs', {
      action: action,
      resource_type: eventType,
      resource_id: options.region || null,
      details: {
        severity: options.severity || 'info',
        toolName: options.toolName,
        success: options.success !== undefined ? options.success : true,
        errorMessage: options.errorMessage,
        ...options.details
      }
    });
    
  } catch (error) {
    console.error('Failed to save audit log to backend:', error);
    // Continue to save to localStorage even if backend fails
  }

  // Get existing logs from localStorage
  const logs = getAuditLogs();

  // Add new entry at the beginning
  logs.unshift(entry);

  // Keep only the last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save audit log to localStorage:', error);
  }

  return entry;
};

/**
 * Get filtered audit logs
 */
export const getFilteredAuditLogs = (filter: AuditLogFilter): AuditLogEntry[] => {
  const logs = getAuditLogs();

  return logs.filter(log => {
    // Filter by user ID
    if (filter.userId && log.userId !== filter.userId) {
      return false;
    }

    // Filter by region
    if (filter.region && log.region !== filter.region) {
      return false;
    }

    // Filter by event type
    if (filter.eventType && log.eventType !== filter.eventType) {
      return false;
    }

    // Filter by severity
    if (filter.severity && log.severity !== filter.severity) {
      return false;
    }

    // Filter by success
    if (filter.success !== undefined && log.success !== filter.success) {
      return false;
    }

    // Filter by date range
    if (filter.startDate && log.timestamp < filter.startDate) {
      return false;
    }

    if (filter.endDate && log.timestamp > filter.endDate) {
      return false;
    }

    return true;
  });
};

/**
 * Clear all audit logs (admin only)
 */
export const clearAuditLogs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear audit logs:', error);
  }
};


