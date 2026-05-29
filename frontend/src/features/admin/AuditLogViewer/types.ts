/**
 * Type definitions for AuditLogViewer
 */

export interface BackendAuditLog {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  email: string; // Added field
  role: string; // Added field
  action: string;
  resource_type: string;
  resource_id: number | null;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface DeleteConfirmState {
  isOpen: boolean;
  logId: string | null;
}

export interface NotificationState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

