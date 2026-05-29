
import type { TimeSeriesData } from './analyticsCore';
import type { TelecomCompany, NetworkTechnology } from '../common/index';

// Performance Analytics
export interface PerformanceMetrics {
  timestamp: string;
  system: SystemPerformance;
  application: ApplicationPerformance;
  network: NetworkPerformance;
  user_experience: UserExperienceMetrics;
}

export interface SystemPerformance {
  cpu_usage: number; // percentage
  memory_usage: number; // percentage
  disk_usage: number; // percentage
  disk_io: {
    read_ops: number;
    write_ops: number;
    read_bytes: number;
    write_bytes: number;
  };
  network_io: {
    bytes_in: number;
    bytes_out: number;
    packets_in: number;
    packets_out: number;
  };
  load_average: number[];
  uptime: number; // seconds
}

export interface ApplicationPerformance {
  response_time: number; // milliseconds
  throughput: number; // requests per second
  error_rate: number; // percentage
  active_sessions: number;
  concurrent_users: number;
  database: {
    query_time: number;
    connections: number;
    slow_queries: number;
  };
  cache: {
    hit_rate: number;
    miss_rate: number;
    evictions: number;
  };
  gc_metrics: {
    collections: number;
    time_spent: number;
    heap_size: number;
  };
}

export interface NetworkPerformance {
  latency: number; // milliseconds
  bandwidth_utilization: number; // percentage
  packet_loss: number; // percentage
  jitter: number; // milliseconds
  connection_count: number;
  failed_connections: number;
  ssl_handshake_time: number;
  dns_resolution_time: number;
}

export interface UserExperienceMetrics {
  page_load_time: number;
  time_to_interactive: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
  session_duration: number;
  bounce_rate: number;
  user_satisfaction_score: number;
}

// Network Analytics
export interface NetworkAnalytics {
  timestamp: string;
  coverage: CoverageAnalytics;
  quality: QualityAnalytics;
  capacity: CapacityAnalytics;
  utilization: UtilizationAnalytics;
  incidents: IncidentAnalytics;
}

export interface CoverageAnalytics {
  total_coverage_area: number; // sq km
  population_covered: number;
  coverage_percentage: number;
  indoor_coverage: number;
  outdoor_coverage: number;
  rural_coverage: number;
  urban_coverage: number;
  coverage_gaps: CoverageGap[];
  redundancy_level: number;
  by_technology: Record<NetworkTechnology, number>;
  by_company: Record<TelecomCompany, number>;
}

export interface CoverageGap {
  id: string;
  location: { lat: number; lng: number };
  area: number; // sq km
  population_affected: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
  expected_revenue: number;
  timeline: string;
}

export interface QualityAnalytics {
  overall_quality_score: number;
  signal_strength_avg: number;
  call_success_rate: number;
  call_drop_rate: number;
  handover_success_rate: number;
  data_session_success_rate: number;
  voice_quality_score: number;
  data_throughput_avg: number;
  latency_avg: number;
  quality_issues: QualityIssue[];
  sla_compliance: number;
}

export interface QualityIssue {
  id: string;
  type: 'coverage' | 'interference' | 'capacity' | 'equipment' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_towers: string[];
  impact_area: number; // sq km
  customers_affected: number;
  duration: number; // minutes
  root_cause?: string;
  resolution_time?: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface CapacityAnalytics {
  total_capacity: number; // Mbps
  used_capacity: number; // Mbps
  utilization_percentage: number;
  peak_utilization: number;
  capacity_per_tower: number;
  capacity_growth_rate: number;
  bottlenecks: CapacityBottleneck[];
  expansion_needs: ExpansionNeed[];
  efficiency_score: number;
}

export interface CapacityBottleneck {
  tower_id: string;
  utilization: number;
  max_capacity: number;
  peak_demand: number;
  time_periods: string[];
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
}

export interface ExpansionNeed {
  location: { lat: number; lng: number };
  projected_demand: number;
  current_capacity: number;
  capacity_gap: number;
  priority_score: number;
  investment_required: number;
  expected_roi: number;
  timeline: string;
}

export interface UtilizationAnalytics {
  average_utilization: number;
  peak_utilization: number;
  off_peak_utilization: number;
  utilization_trends: TimeSeriesData[];
  utilization_by_hour: Record<string, number>;
  utilization_by_day: Record<string, number>;
  utilization_by_location: Record<string, number>;
  efficiency_opportunities: EfficiencyOpportunity[];
}

export interface EfficiencyOpportunity {
  type: 'load_balancing' | 'capacity_upgrade' | 'configuration_optimization' | 'equipment_upgrade';
  description: string;
  affected_towers: string[];
  potential_improvement: number; // percentage
  implementation_cost: number;
  implementation_time: number; // days
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IncidentAnalytics {
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  average_resolution_time: number; // hours
  incident_types: Record<string, number>;
  incident_severity: Record<string, number>;
  mttr: number; // mean time to repair
  mtbf: number; // mean time between failures
  availability: number; // percentage
  sla_breaches: number;
  incident_trends: TimeSeriesData[];
}


