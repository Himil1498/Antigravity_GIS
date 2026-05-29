
import type {
  TelecomCompany,
  IndianState,
  Region,
  InfrastructureType,
  NetworkTechnology,
  TowerStatus,
} from '../common/index';

// ============================================================================
// Filtering and Search Types
// ============================================================================

export interface DataFilter {
  companies: TelecomCompany[];
  states: IndianState[];
  regions: Region[];
  tower_types: InfrastructureType[];
  technologies: NetworkTechnology[];
  status_filters: TowerStatus[];
  date_range?: { start: string; end: string };
  height_range?: { min: number; max: number };
  coverage_radius_range?: { min: number; max: number };
  signal_strength_range?: { min: number; max: number };
  geographic_bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  custom_attributes?: Record<string, any>;
}

export interface SearchQuery {
  text: string;
  fields: string[];
  filters?: Partial<DataFilter>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

