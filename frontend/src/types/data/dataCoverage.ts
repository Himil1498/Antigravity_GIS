
import type {
  BaseEntity,
  Coordinates,
  NetworkTechnology,
  FrequencyBand,
  CoverageType,
  SignalQuality,
} from '../common/index';

// ============================================================================
// Network Coverage Types
// ============================================================================

export interface NetworkCoverage extends BaseEntity {
  tower_id: string;
  technology: NetworkTechnology;
  frequency_band: FrequencyBand;
  coverage_type: CoverageType;

  // Geographic coverage
  coverage_area: Coordinates[]; // polygon coordinates
  signal_strength: SignalQualityData[];

  // Performance metrics
  quality_metrics: CoverageQualityMetrics;
  capacity_metrics: CapacityMetrics;

  // Analysis data
  population_covered: number;
  area_covered: number; // in sq km
  predicted_vs_actual: {
    predicted_coverage: Coordinates[];
    actual_coverage: Coordinates[];
    accuracy: number; // percentage
  };

  // Interference data
  interference_sources: InterferenceSource[];

  // Testing data
  drive_test_data: DriveTestResult[];
  customer_complaints: number;

  metadata: Record<string, any>;
}

export interface SignalQualityData {
  position: Coordinates;
  rssi: number; // Received Signal Strength Indicator (dBm)
  rsrp: number; // Reference Signal Received Power (dBm)
  rsrq: number; // Reference Signal Received Quality (dB)
  sinr: number; // Signal to Interference plus Noise Ratio (dB)
  quality: SignalQuality;
  timestamp: string;
}

export interface CoverageQualityMetrics {
  average_rssi: number;
  min_rssi: number;
  max_rssi: number;
  coverage_probability: number; // percentage
  quality_distribution: Record<SignalQuality, number>;
  handover_success_rate: number; // percentage
  call_drop_rate: number; // percentage
  blocked_call_rate: number; // percentage
}

export interface CapacityMetrics {
  max_throughput: number; // in Mbps
  average_throughput: number; // in Mbps
  peak_hour_utilization: number; // percentage
  concurrent_users: number;
  data_volume: number; // in GB
  voice_minutes: number;
  sms_count: number;
}

export interface InterferenceSource {
  source_type: 'co_channel' | 'adjacent_channel' | 'intermodulation' | 'external';
  interference_level: number; // in dB
  source_location?: Coordinates;
  frequency_affected: FrequencyBand;
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation_actions: string[];
}

export interface DriveTestResult {
  id: string;
  test_date: string;
  route: Coordinates[];
  technology: NetworkTechnology;
  measurements: {
    position: Coordinates;
    timestamp: string;
    rssi: number;
    throughput_dl: number; // download throughput
    throughput_ul: number; // upload throughput
    latency: number;
    serving_cell: string;
  }[];
  summary: {
    total_distance: number; // in km
    coverage_percentage: number;
    average_throughput: number;
    worst_spots: Coordinates[];
  };
}

