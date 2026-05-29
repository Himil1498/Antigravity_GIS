// RecentActivity moved to types.ts

export interface LatencyDataPoint {
  time_bucket: string;
  avg_latency: number;
  min_latency: number;
  max_latency: number;
  request_count: number;
}

export interface PerformanceData {
  timeRange: string;
  latencyOverTime: LatencyDataPoint[];
  topEndpoints: any[];
  statusCodeDistribution: any[];
  overall: {
    total_requests: number;
    avg_latency: number;
    min_latency: number;
    max_latency: number;
    successful_requests: number;
    failed_requests: number;
  };
  health?: {
    cpu: number;
    memory: number;
    latency: number;
    uptime: number;
    errorRate: number;
    apiStatus: 'healthy' | 'degraded' | 'down';
  };
}

export interface TrendDataPoint {
  date: string;
  distance: number;
  polygon: number;
  elevation: number;
  circle: number;
  sector_rf: number;
}

export interface UsageTrendsData {
  timeRange: string;
  trends: TrendDataPoint[];
}

export interface PerfChartDataPoint {
  time: string;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  requests: number;
}

export interface UsageTotals {
  distance: number;
  polygon: number;
  elevation: number;
  circle: number;
  sector_rf: number;
  total: number;
}

export type TimeRange = "1h" | "24h" | "7d" | "30d";
export type UsageTimeRange = "7d" | "30d" | "90d";

