
// Environment and Deployment Types
export type Environment = "development" | "staging" | "production" | "testing";

export type AppMode = "development" | "production" | "maintenance" | "testing";

export type DeploymentMode = "cloud" | "on_premise" | "hybrid" | "edge";

// Feature Flags and Configuration
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  conditions?: Record<string, any>;
}

export interface AppConfiguration {
  features: FeatureFlag[];
  limits: {
    maxTowersPerRequest: number;
    maxExportSize: number;
    sessionTimeout: number;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
  };
}

// Performance and Monitoring
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  services: Record<
    string,
    {
      status: "up" | "down" | "unknown";
      responseTime?: number;
      lastCheck: string;
    }
  >;
  timestamp: string;
}

// Event and Audit Types
export type EventType =
  | "user_action"
  | "system_event"
  | "data_change"
  | "security_event"
  | "performance_event";

export interface AuditEvent {
  id: string;
  type: EventType;
  action: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

