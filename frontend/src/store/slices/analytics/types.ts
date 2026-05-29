
export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'performance' | 'usage' | 'network' | 'business';
  metadata?: Record<string, any>;
}

export interface PerformanceData {
  response_time: number;
  data_load_time: number;
  map_render_time: number;
  memory_usage: number;
  cpu_usage: number;
  fps: number;
  timestamp: string;
}

export interface UsageStats {
  daily_active_users: number;
  session_duration: number;
  page_views: number;
  feature_usage: Record<string, number>;
  timestamp: string;
}

export interface NetworkAnalytics {
  coverage_percentage: number;
  signal_quality_avg: number;
  tower_utilization: number;
  network_downtime: number;
  data_throughput: number;
  timestamp: string;
}

export interface BusinessMetrics {
  cost_per_tower: number;
  roi_percentage: number;
  expansion_opportunities: number;
  maintenance_costs: number;
  revenue_impact: number;
  timestamp: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'performance' | 'usage' | 'network' | 'business' | 'custom';
  metrics: string[];
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'json';
  isActive: boolean;
  lastGenerated?: string;
}

export interface AnalyticsState {
  // Real-time Metrics
  currentMetrics: AnalyticsMetric[];
  performanceData: PerformanceData[];
  usageStats: UsageStats[];
  networkAnalytics: NetworkAnalytics[];
  businessMetrics: BusinessMetrics[];

  // Time Range for Analytics
  timeRange: {
    start: string;
    end: string;
    period: '1h' | '24h' | '7d' | '30d' | '90d' | 'custom';
  };

  // Data Loading
  isLoading: boolean;
  lastUpdate: string | null;

  // Reports
  reports: ReportConfig[];
  generatedReports: Array<{
    id: string;
    reportId: string;
    name: string;
    generatedAt: string;
    downloadUrl: string;
    status: 'generating' | 'ready' | 'expired';
  }>;

  // Alerts and Thresholds
  alerts: Array<{
    id: string;
    type: 'performance' | 'network' | 'usage';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    acknowledged: boolean;
    resolvedAt?: string;
  }>;

  thresholds: Record<string, {
    min?: number;
    max?: number;
    enabled: boolean;
  }>;

  // Dashboard Configuration
  dashboardLayout: Array<{
    id: string;
    type: 'chart' | 'metric' | 'map' | 'table';
    position: { x: number; y: number };
    size: { width: number; height: number };
    config: Record<string, any>;
  }>;

  // Export/Import
  isExporting: boolean;
  exportProgress: number;
}

