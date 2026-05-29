export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  region?: string;
  toolName?: string;
  action: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOOL_USAGE'
  | 'DATA_EXPORT'
  | 'DATA_IMPORT'
  | 'USER_MANAGEMENT'
  | 'REGION_ACCESS'
  | 'REGION_ACCESS_GRANTED'
  | 'REGION_ACCESS_DENIED'
  | 'REGION_ASSIGNED'
  | 'REGION_REVOKED'
  | 'SYSTEM_CONFIG'
  | 'SECURITY_ALERT';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogFilter {
  userId?: string;
  region?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
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

