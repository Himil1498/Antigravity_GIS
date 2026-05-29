
// ============================================================================
// User Activity
// ============================================================================

export interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  tool?: string;
  region?: string;
  timestamp: Date;
  duration?: number;  // Seconds
  status: 'success' | 'failed' | 'in-progress';
  metadata?: any;
}

// ============================================================================
// Activity Log Entry
// ============================================================================

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'tool_used' | 'data_saved' | 'data_deleted' | 'settings_changed' | 'report_generated';
  details: string;
  tool?: string;
  region?: string;
  success: boolean;
  duration?: number;  // Seconds
  ipAddress?: string;
  userAgent?: string;
}

