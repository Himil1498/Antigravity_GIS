import React, { useState, useEffect, useRef, useCallback } from "react";
import type { AuditLogEntry, AuditLogFilter } from "../../../types/audit.types";
import { useAppSelector } from "../../../store/index";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import NotificationDialog from "../../../components/ui/NotificationDialog";
import PasswordConfirmDialog from "../../../components/ui/PasswordConfirmDialog";
import { rolesMatch } from "../../../utils/userHelpers";
import { usePermission } from "../../../hooks/usePermission";
import { useAuditLogs } from "./hooks/useAuditLogs";
import { exportToCSV } from "./utils";
import type { DeleteConfirmState } from "./types";
import { authService } from "../../../services/api/authService"; // Import authService
import * as userService from "../../../services/user/index"; // Import userService
import EnhancedSelect from "../../../components/ui/EnhancedSelect";
import { EventCategoryMap } from "../../../types/audit.types";

// Components
import AccessDenied from "./components/AccessDenied";
import Header from "./components/Header";
import LogsTable from "./components/LogsTable";
import LogDetailsModal from "./components/LogDetailsModal";

const AuditLogViewer: React.FC = () => {
  const { can, isAdmin } = usePermission();
  const { user } = useAppSelector((state) => state.auth); // Get current user for email

  const canViewLogs = isAdmin || can("admin:audit_logs");
  const canDeleteLogs = isAdmin || can("admin:audit_logs:delete");
  const canExportLogs = isAdmin || can("admin:audit_logs:export");
  const canClearLogs = isAdmin || can("admin:audit_logs:clear");

  const {
    logs,
    pagination,
    isLoading,
    notification,
    setNotification,
    loadLogs,
    deleteLog,
    clearAllLogs,
  } = useAuditLogs(canViewLogs);

  const [filter, setFilter] = useState<AuditLogFilter>({ limit: 25 });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh every 30s when enabled
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        loadLogs(filter);
      }, 30000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [autoRefresh, filter, loadLogs]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Fetch users for dropdown
  useEffect(() => {
    if (canViewLogs) {
      userService.getAllUsers()
        .then(setUsersList)
        .catch(err => console.error("Failed to fetch users for filter", err));
    }
  }, [canViewLogs]);

  const userOptions = [
    { value: "", label: "All Users" },
    ...usersList.map((u) => {
      // The backend expects an integer ID, so we strip the OCGID formatting
      const rawId = String(u.id).replace(/OCGID/gi, "").replace(/^0+/, "") || "0";
      return {
        value: rawId,
        label: u.full_name || u.username || String(u.email),
      };
    }),
  ];

  // Category Options
  const categories = Array.from(new Set(Object.values(EventCategoryMap)));
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  // Password Confirmation State
  const [passwordConfirm, setPasswordConfirm] = useState<{
    isOpen: boolean;
    action: "delete" | "clear" | null;
    logId?: string;
    isVerifying: boolean;
  }>({
    isOpen: false,
    action: null,
    isVerifying: false,
  });

  // Trigger loadLogs when filter changes
  useEffect(() => {
    loadLogs(filter);
  }, [filter, loadLogs]);

  const handleExportCSV = async () => {
    try {
      if (logs.length > 0) {
        // Record the export event
        const { apiClient } = await import("./apiClient");
        await apiClient.post("/audit/logs", {
          action: "Exported Audit Logs to CSV",
          resource_type: "AUDIT_LOG_EXPORTED",
          resource_id: "ALL",
          details: { count: logs.length, format: "CSV" },
        });
      }
    } catch (e) {
      console.error("Failed to log export event", e);
    }
    exportToCSV(logs);
  };

  // Open Password Dialog for Single Delete
  const requestDeleteLog = (logId: string) => {
    setPasswordConfirm({
      isOpen: true,
      action: "delete",
      logId,
      isVerifying: false,
    });
  };

  // Open Password Dialog for Clear All
  const requestClearAll = () => {
    setPasswordConfirm({
      isOpen: true,
      action: "clear",
      isVerifying: false,
    });
  };

  // Verify Password and Execute Action
  const handlePasswordVerify = async (password: string) => {
    if (!user?.email) {
      throw new Error("User email not found. Please refresh.");
    }

    setPasswordConfirm((prev) => ({ ...prev, isVerifying: true }));

    try {
      // client-side check by attempting login
      // NOTE: This assumes the backend allows login with same credentials to verify
      await authService.verifyPassword(password);

      // Verification Success - Proceed with Action
      if (passwordConfirm.action === "delete" && passwordConfirm.logId) {
        await deleteLog(passwordConfirm.logId);
      } else if (passwordConfirm.action === "clear") {
        await clearAllLogs();
      }

      // Close Dialog on success
      setPasswordConfirm({
        isOpen: false,
        action: null,
        isVerifying: false,
      });
    } catch (error: any) {
      setPasswordConfirm((prev) => ({ ...prev, isVerifying: false }));
      // Re-throw to display error in the dialog
      throw new Error(error.message || "Incorrect password");
    }
  };

  if (!canViewLogs) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <Header
        logsCount={logs.length}
        isLoading={isLoading}
        onRefresh={loadLogs}
        onExport={canExportLogs ? handleExportCSV : undefined}
        onClearAll={canClearLogs ? requestClearAll : undefined}
      />

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search user, action, details..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
            value={filter.search || ""}
          />
        </div>
        
        {/* User Filter Dropdown */}
        <div className="w-64">
          <EnhancedSelect
            value={filter.userId || ""}
            onChange={(val) =>
              setFilter((prev) => ({
                ...prev,
                userId: val ? val : undefined,
                page: 1,
              }))
            }
            options={userOptions}
            placeholder="All Users"
            searchable
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="w-56">
          <EnhancedSelect
            value={filter.category || ""}
            onChange={(val) =>
              setFilter((prev) => ({
                ...prev,
                category: val ? (val as any) : undefined,
                page: 1,
              }))
            }
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                startDate: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
                page: 1,
              }))
            }
          />
          <span className="self-center text-gray-400">-</span>
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                endDate: e.target.value ? new Date(e.target.value) : undefined,
                page: 1,
              }))
            }
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading audit logs...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No audit logs found
            </p>
          </div>
        ) : (
          <>
            <LogsTable
              logs={logs}
              onViewDetails={setSelectedLog}
              onDeleteLog={requestDeleteLog}
            />
            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Per page:</label>
                  <select
                    value={filter.limit || 25}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
                    }
                    className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                {/* Auto-refresh toggle */}
                <button
                  onClick={() => setAutoRefresh(p => !p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                    autoRefresh
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={autoRefresh ? "Auto-refresh ON (every 30s)" : "Enable auto-refresh"}
                >
                  <svg className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {autoRefresh ? 'Live' : 'Auto'}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilter((prev) => ({
                      ...prev,
                      page: pagination.page - 1,
                    }))
                  }
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilter((prev) => ({
                      ...prev,
                      page: pagination.page + 1,
                    }))
                  }
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Details Modal */}
      <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />

      {/* Password Confirmation Dialog */}
      <PasswordConfirmDialog
        isOpen={passwordConfirm.isOpen}
        title={
          passwordConfirm.action === "clear"
            ? "Clear All Logs"
            : "Delete Audit Log"
        }
        message={
          passwordConfirm.action === "clear"
            ? "Are you sure you want to clear all audit logs? This action cannot be undone. Please enter your password to confirm."
            : "Are you sure you want to delete this log? This action cannot be undone. Please enter your password to confirm."
        }
        onClose={() =>
          setPasswordConfirm({
            isOpen: false,
            action: null,
            isVerifying: false,
          })
        }
        onConfirm={handlePasswordVerify}
        isLoading={passwordConfirm.isVerifying}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
};

export default AuditLogViewer;
