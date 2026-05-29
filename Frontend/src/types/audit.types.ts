// Audit logging types for tracking user actions and region access

export type AuditEventType =
  // Access & Security
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUESTED"
  | "ACCESS_DENIED"
  | "REGION_ACCESS_DENIED"
  | "security"

  // Data Operations
  | "FILE_UPLOADED"
  | "FILE_DOWNLOADED"
  | "FILE_DELETED"
  | "FOLDER_CREATED"
  | "FOLDER_DELETED"
  | "FOLDER_RENAMED"
  | "KMZ_IMPORTED"
  | "DATA_IMPORTED"
  | "DATA_EXPORTED"
  | "DATA_RESTORED"
  | "report"

  // Network & GIS Activity
  | "INFRASTRUCTURE_ADDED"
  | "INFRASTRUCTURE_UPDATED"
  | "INFRASTRUCTURE_DELETED"
  | "MAP_SEARCHED"
  | "GIS_TOOL_USED"
  | "BOOKMARK_CREATED"
  | "BOOKMARK_DELETED"
  | "elevation_profile"
  | "distance_measurement"
  | "polygon_drawing"
  | "circle_drawing"
  | "sector_rf"
  | "infrastructure"
  | "polygon"
  | "circle"
  | "sector"

  // Administration - User Management
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ROLE_UPDATED"
  | "user"

  // Administration - Region Management
  | "REGION_ASSIGNED"
  | "REGION_REVOKED"
  | "REGION_ACCESS_GRANTED"
  | "REGION_CREATE"
  | "REGION_UPDATE"
  | "REGION_DELETE"
  | "region_request"

  // Administration - Group Management
  | "GROUP_CREATE"
  | "GROUP_UPDATE"
  | "GROUP_DELETE"
  | "GROUP_MEMBER_ADD"
  | "GROUP_MEMBER_REMOVE"
  | "GROUP_MEMBER_ROLE_UPDATE"
  | "GROUP_PERMISSION_UPDATE"

  // Administration - Infrastructure Approval
  | "infra_approval"

  // Administration - Audit & System
  | "AUDIT_LOG_CLEARED"
  | "AUDIT_LOG_EXPORTED"
  | "MAINTENANCE_MODE_TOGGLED"
  | "sys_audit_logs"

  // Notifications
  | "notification"

  // Other / Interceptor
  | "AUDIT";

export type AuditEventCategory = "Access & Security" | "Data Operations" | "Network & GIS Activity" | "Administration" | "Other";

// Helper object mapping event types to categories
export const EventCategoryMap: Record<AuditEventType, AuditEventCategory> = {
  // ── Access & Security ──
  USER_LOGIN: "Access & Security",
  USER_LOGOUT: "Access & Security",
  USER: "Access & Security",
  PASSWORD_CHANGED: "Access & Security",
  PASSWORD_RESET_REQUESTED: "Access & Security",
  ACCESS_DENIED: "Access & Security",
  REGION_ACCESS_DENIED: "Access & Security",
  security: "Access & Security",

  // ── Data Operations ──
  FILE_UPLOADED: "Data Operations",
  FILE_DOWNLOADED: "Data Operations",
  FILE_DELETED: "Data Operations",
  FOLDER_CREATED: "Data Operations",
  FOLDER_DELETED: "Data Operations",
  FOLDER_RENAMED: "Data Operations",
  KMZ_IMPORTED: "Data Operations",
  DATA_IMPORTED: "Data Operations",
  DATA_EXPORTED: "Data Operations",
  DATA_RESTORED: "Data Operations",
  report: "Data Operations",

  // ── Network & GIS Activity ──
  INFRASTRUCTURE_ADDED: "Network & GIS Activity",
  INFRASTRUCTURE_UPDATED: "Network & GIS Activity",
  INFRASTRUCTURE_DELETED: "Network & GIS Activity",
  MAP_SEARCHED: "Network & GIS Activity",
  GIS_TOOL_USED: "Network & GIS Activity",
  BOOKMARK_CREATED: "Network & GIS Activity",
  BOOKMARK_DELETED: "Network & GIS Activity",
  elevation_profile: "Network & GIS Activity",
  distance_measurement: "Network & GIS Activity",
  polygon_drawing: "Network & GIS Activity",
  circle_drawing: "Network & GIS Activity",
  sector_rf: "Network & GIS Activity",
  infrastructure: "Network & GIS Activity",
  polygon: "Network & GIS Activity",
  circle: "Network & GIS Activity",
  sector: "Network & GIS Activity",

  // ── Administration ──
  USER_CREATED: "Administration",
  USER_UPDATED: "Administration",
  USER_DELETED: "Administration",
  ROLE_UPDATED: "Administration",
  user: "Administration",
  REGION_ASSIGNED: "Administration",
  REGION_REVOKED: "Administration",
  REGION_ACCESS_GRANTED: "Administration",
  REGION_CREATE: "Administration",
  REGION_UPDATE: "Administration",
  REGION_DELETE: "Administration",
  region_request: "Administration",
  GROUP_CREATE: "Administration",
  GROUP_UPDATE: "Administration",
  GROUP_DELETE: "Administration",
  GROUP_MEMBER_ADD: "Administration",
  GROUP_MEMBER_REMOVE: "Administration",
  GROUP_MEMBER_ROLE_UPDATE: "Administration",
  GROUP_PERMISSION_UPDATE: "Administration",
  infra_approval: "Administration",
  AUDIT_LOG_CLEARED: "Administration",
  AUDIT_LOG_EXPORTED: "Administration",
  MAINTENANCE_MODE_TOGGLED: "Administration",
  sys_audit_logs: "Administration",

  // ── Other ──
  notification: "Other",
  AUDIT: "Other",
};

// Human-readable labels for event types (replaces ugly raw strings in UI)
export const EventLabelMap: Partial<Record<AuditEventType, string>> = {
  USER_LOGIN: "User Login",
  USER_LOGOUT: "User Logout",
  USER: "User Auth",
  PASSWORD_CHANGED: "Password Changed",
  PASSWORD_RESET_REQUESTED: "Password Reset",
  ACCESS_DENIED: "Access Denied",
  REGION_ACCESS_DENIED: "Region Access Denied",
  security: "Security Event",

  FILE_UPLOADED: "File Uploaded",
  FILE_DOWNLOADED: "File Downloaded",
  FILE_DELETED: "File Deleted",
  FOLDER_CREATED: "Folder Created",
  FOLDER_DELETED: "Folder Deleted",
  FOLDER_RENAMED: "Folder Renamed",
  KMZ_IMPORTED: "KMZ Import",
  DATA_IMPORTED: "Data Import",
  DATA_EXPORTED: "Data Export",
  DATA_RESTORED: "Data Restored",
  report: "Report Generated",

  INFRASTRUCTURE_ADDED: "Infrastructure Added",
  INFRASTRUCTURE_UPDATED: "Infrastructure Updated",
  INFRASTRUCTURE_DELETED: "Infrastructure Deleted",
  MAP_SEARCHED: "Map Search",
  GIS_TOOL_USED: "GIS Tool Used",
  BOOKMARK_CREATED: "Bookmark Created",
  BOOKMARK_DELETED: "Bookmark Deleted",
  elevation_profile: "Elevation Profile",
  distance_measurement: "Distance Measurement",
  polygon_drawing: "Polygon Drawing",
  circle_drawing: "Circle Drawing",
  sector_rf: "Sector RF Analysis",
  infrastructure: "Infrastructure",
  polygon: "Polygon",
  circle: "Circle",
  sector: "Sector",

  USER_CREATED: "User Created",
  USER_UPDATED: "User Updated",
  USER_DELETED: "User Deleted",
  ROLE_UPDATED: "Role Updated",
  user: "User Management",
  REGION_ASSIGNED: "Region Assigned",
  REGION_REVOKED: "Region Revoked",
  REGION_ACCESS_GRANTED: "Region Access Granted",
  REGION_CREATE: "Region Created",
  REGION_UPDATE: "Region Updated",
  REGION_DELETE: "Region Deleted",
  region_request: "Region Request",
  GROUP_CREATE: "Group Created",
  GROUP_UPDATE: "Group Updated",
  GROUP_DELETE: "Group Deleted",
  GROUP_MEMBER_ADD: "Member Added to Group",
  GROUP_MEMBER_REMOVE: "Member Removed from Group",
  GROUP_MEMBER_ROLE_UPDATE: "Group Role Updated",
  GROUP_PERMISSION_UPDATE: "Group Permission Updated",
  infra_approval: "Infrastructure Approval",
  AUDIT_LOG_CLEARED: "Audit Logs Cleared",
  AUDIT_LOG_EXPORTED: "Audit Logs Exported",
  MAINTENANCE_MODE_TOGGLED: "Maintenance Mode Toggled",
  sys_audit_logs: "System Audit",

  notification: "Notification",
  AUDIT: "System Event",
};

// Helper to get a clean, human-readable label for any event type
export const getEventLabel = (eventType: string): string => {
  return EventLabelMap[eventType as AuditEventType] || 
    eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
};

export type AuditSeverity = "info" | "warning" | "error" | "critical";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  region?: string; // Region where action occurred
  toolName?: string; // GIS tool name if applicable
  action: string; // Human-readable description
  details: Record<string, any>; // Additional metadata
  ipAddress?: string;
  userAgent?: string;
  session_id?: string;
  user_agent?: string;
  status?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogFilter {
  userId?: string;
  region?: string;
  eventType?: AuditEventType;
  category?: AuditEventCategory;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuditLogStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByRegion: Record<string, number>;
  eventsByUser: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

