/**
 * Custom hook for loading and managing audit logs
 */

import { useState, useEffect, useCallback } from "react";
import type {
  AuditLogEntry,
  AuditEventType,
  AuditLogFilter,
} from "../../../../types/audit.types";
import type { BackendAuditLog, NotificationState } from "../types";
import { apiClient } from "../apiClient";

export const useAuditLogs = (isAdmin: boolean) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const loadLogs = useCallback(
    async (filters: AuditLogFilter = {}) => {
      if (!isAdmin) return;

      setIsLoading(true);
      try {
        // Remove undefined values
        const params = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== ""),
        );

        // Translate 'category' to 'eventTypes' for backend
        if (filters.category) {
          const { EventCategoryMap } = await import("../../../../types/audit.types");
          const matchedEventTypes = Object.entries(EventCategoryMap)
            .filter(([_, cat]) => cat === filters.category)
            .map(([type, _]) => type);
          
          if (matchedEventTypes.length > 0) {
            params.eventTypes = matchedEventTypes.join(',');
          }
          delete params.category; // Backend doesn't know about 'category' directly
        }

        const response = await apiClient.get<{
          success: boolean;
          logs: BackendAuditLog[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        }>("/audit/logs", { params });

        if (response.data.success) {
          // Transform backend logs to frontend format
          const transformedLogs: AuditLogEntry[] = response.data.logs.map(
            (log) => {
              let parsedDetails = {};
              try {
                parsedDetails = log.details
                  ? typeof log.details === "string"
                    ? JSON.parse(log.details)
                    : log.details
                  : {};
              } catch (e) {
                console.error("Failed to parse log details:", e);
              }

              return {
                id: log.id.toString(),
                timestamp: new Date(log.created_at),
                userId: String(log.user_id),
                userName: log.full_name || log.username || "System",
                userEmail: log.email || "",
                userRole: log.role || "Unknown",
                eventType:
                  (log.resource_type as AuditEventType) || "USER_LOGIN",
                severity: (parsedDetails as any).severity || "info",
                region: (parsedDetails as any).resource_name || undefined,
                toolName: (parsedDetails as any).toolName || undefined,
                action: log.action,
                details: parsedDetails,
                success: (parsedDetails as any).success !== false,
                errorMessage: (parsedDetails as any).errorMessage || undefined,
              };
            },
          );

          setLogs(transformedLogs);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        }
      } catch (error: any) {
        console.error("Failed to load audit logs:", error);
        setNotification({
          isOpen: true,
          type: "error",
          title: "Failed to Load Logs",
          message: error.response?.data?.error || "Could not load audit logs",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      try {
        const response = await apiClient.delete<{
          success: boolean;
          message?: string;
        }>(`/audit/logs/${logId}`);

        if (response.data.success) {
          setNotification({
            isOpen: true,
            type: "success",
            title: "Log Deleted",
            message: "Audit log entry has been deleted",
          });
          loadLogs();
          return true;
        }
        return false;
      } catch (error: any) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Failed to Delete Log",
          message: error.response?.data?.error || "Could not delete audit log",
        });
        return false;
      }
    },
    [loadLogs],
  );

  const clearAllLogs = useCallback(async () => {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message?: string;
        deletedCount?: number;
      }>("/audit/logs");

      if (response.data.success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Logs Cleared",
          message:
            response.data.message ||
            "All audit logs have been cleared successfully",
        });
        loadLogs();
        return true;
      }
      return false;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Failed to Clear Logs",
        message: error.response?.data?.error || "Could not clear audit logs",
      });
      return false;
    }
  }, [loadLogs]);

  return {
    logs,
    pagination,
    isLoading,
    notification,
    setNotification,
    loadLogs,
    deleteLog,
    clearAllLogs,
  };
};

