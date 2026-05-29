
// ============================================================================
// System Health
// ============================================================================

export interface SystemHealth {
  cpu: number;          // Percentage (0-100)
  memory: number;       // Percentage (0-100)
  latency: number;      // Milliseconds
  uptime: number;       // Seconds
  errorRate: number;    // Percentage (0-100)
  apiStatus: 'healthy' | 'degraded' | 'down';
}

// ============================================================================
// System Performance
// ============================================================================

export interface SystemStatus {
    health: SystemHealth;
    history: SystemHealthSnapshot[];
    alerts: SystemAlert[];
    uptime: number;  // Seconds
    downtimeEvents: DowntimeEvent[];
}

// Renamed from SystemPerformance to SystemStatus to avoid conflicts if needed, 
// or keep as SystemPerformance if it was unique. Based on original file it was SystemPerformance.
// Let's keep it consistent with the original name to minimize breaking changes where possible, 
// but if I see a conflict I'll handle it. Original was SystemPerformance.
export interface SystemPerformance {
  health: SystemHealth;
  history: SystemHealthSnapshot[];
  alerts: SystemAlert[];
  uptime: number;  // Seconds
  downtimeEvents: DowntimeEvent[];
}

export interface SystemHealthSnapshot {
  timestamp: Date;
  cpu: number;
  memory: number;
  latency: number;
}

export interface SystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'latency' | 'error' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface DowntimeEvent {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;  // Seconds
  reason: string;
  impact: 'minor' | 'major' | 'critical';
  active: boolean;
}

