
export interface TelecomTower {
  id: string;
  name: string;
  type: 'cell_tower' | 'fiber_node' | 'base_station' | 'repeater';
  position: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  company: string;
  height: number;
  frequency: string[];
  coverage_radius: number;
  installation_date: string;
  last_maintenance: string;
  technical_specs: Record<string, any>;
  metadata: Record<string, any>;
}

export interface NetworkCoverage {
  id: string;
  tower_id: string;
  type: '2G' | '3G' | '4G' | '5G' | 'fiber';
  signal_strength: number;
  coverage_area: google.maps.LatLng[];
  quality_metrics: {
    latency: number;
    bandwidth: number;
    reliability: number;
  };
}

export interface DataFilter {
  companies: string[];
  towerTypes: string[];
  statusFilters: string[];
  dateRange: { start: string; end: string } | null;
  signalStrengthRange: { min: number; max: number };
  geoBounds: google.maps.LatLngBounds | null;
}

export interface ImportJob {
  id: string;
  type: 'towers' | 'coverage' | 'analytics';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string;
  total_records: number;
  processed_records: number;
  errors: string[];
  started_at: string;
  completed_at?: string;
}

export interface DataState {
  // Infrastructure Data
  towers: TelecomTower[];
  coverage: NetworkCoverage[];

  // Data Management
  isLoading: boolean;
  loadingMessage: string;
  lastSync: string | null;

  // Filtering and Search
  filters: DataFilter;
  searchQuery: string;
  filteredTowerIds: string[];

  // Data Import/Export
  importJobs: ImportJob[];
  activeImportId: string | null;

  // Caching and Performance
  dataCacheExpiry: number;
  isDataStale: boolean;

  // Statistics
  stats: {
    totalTowers: number;
    activeTowers: number;
    companyCounts: Record<string, number>;
    typeCounts: Record<string, number>;
    coverageStats: Record<string, number>;
  };

  // Error Handling
  errors: Array<{
    id: string;
    message: string;
    timestamp: number;
    type: 'load' | 'filter' | 'import' | 'export';
  }>;
}

