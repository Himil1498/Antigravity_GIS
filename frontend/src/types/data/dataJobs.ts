
// Data Jobs Types
import type {
  BaseEntity,
  TelecomCompany,
  IndianState,
  FileFormat,
  ImportConfig,
  NetworkTechnology,
  InfrastructureType,
} from '../common/index';
import type { DataFilter } from './dataSearch';

// ============================================================================
// Data Import Types
// ============================================================================

export interface DataImportJob extends BaseEntity {
  type: 'towers' | 'coverage' | 'performance' | 'maintenance';
  status: 'pending' | 'processing' | 'validating' | 'completed' | 'failed' | 'cancelled';
  file_info: {
    name: string;
    size: number;
    format: FileFormat;
    checksum: string;
    upload_url: string;
  };

  configuration: ImportConfig;

  progress: {
    total_records: number;
    processed_records: number;
    valid_records: number;
    invalid_records: number;
    percentage: number;
  };

  validation_results: {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    summary: Record<string, number>;
  };

  result: {
    imported_records: number;
    updated_records: number;
    skipped_records: number;
    error_records: number;
  };

  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;

  metadata: {
    source: string;
    imported_by: string;
    notes?: string;
  };
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error_code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  row: number;
  field: string;
  value: any;
  warning_code: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// Data Export Types
// ============================================================================

export interface DataExportJob extends BaseEntity {
  type: 'towers' | 'coverage' | 'analytics' | 'reports';
  format: 'csv' | 'excel' | 'json' | 'pdf' | 'kml' | 'geojson';
  status: 'pending' | 'processing' | 'completed' | 'failed';

  filters: {
    date_range?: { start: string; end: string };
    companies?: TelecomCompany[];
    states?: IndianState[];
    tower_types?: InfrastructureType[];
    technologies?: NetworkTechnology[];
    custom_filters?: Record<string, any>;
  };

  options: {
    include_coordinates: boolean;
    include_performance: boolean;
    include_equipment: boolean;
    include_compliance: boolean;
    coordinate_format: 'decimal' | 'dms';
    date_format: string;
  };

  result?: {
    file_url: string;
    file_size: number;
    record_count: number;
    expires_at: string;
  };

  requested_by: string;
  estimated_completion?: string;
  started_at?: string;
  completed_at?: string;
}

// ============================================================================
// Bulk Operations
// ============================================================================

export interface BulkOperation extends BaseEntity {
  type: 'update' | 'delete' | 'status_change' | 'assign_company' | 'add_tags';
  target_entity: 'towers' | 'coverage';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  selection_criteria: {
    ids?: string[];
    filters?: Partial<DataFilter>;
    query?: string;
  };

  operation_data: Record<string, any>;

  progress: {
    total_records: number;
    processed_records: number;
    successful_records: number;
    failed_records: number;
    percentage: number;
  };

  errors: Array<{
    record_id: string;
    error_message: string;
    error_code: string;
  }>;

  initiated_by: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
}

