
import type { DataImportJob, DataExportJob } from '../data/index';
import type { Report } from '../analytics/index';

// Analytics API
export interface GetAnalyticsRequest {
  metrics: string[];
  time_range: {
    start: string;
    end: string;
    granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  filters?: {
    companies?: string[];
    regions?: string[];
    tower_types?: string[];
    technologies?: string[];
  };
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  group_by?: string[];
}

export interface AnalyticsData {
  metric: string;
  value: number;
  timestamp: string;
  dimensions?: Record<string, string>;
}

export interface GetAnalyticsResponse {
  metrics: AnalyticsData[];
  summary: {
    total_data_points: number;
    time_range: {
      start: string;
      end: string;
    };
    aggregations: Record<string, number>;
  };
}

// Reporting API
export interface CreateReportRequest {
  report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
}

export interface GenerateReportRequest {
  report_id: string;
  parameters?: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv';
  delivery?: {
    method: 'download' | 'email' | 'api';
    recipients?: string[];
  };
}

export interface GenerateReportResponse {
  job_id: string;
  estimated_completion: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  download_url?: string;
}

// Data Import/Export API
export interface ImportDataRequest {
  file: File;
  type: 'towers' | 'coverage' | 'analytics';
  format: 'csv' | 'excel' | 'json' | 'kml';
  options: {
    has_header?: boolean;
    delimiter?: string;
    encoding?: string;
    mapping?: Record<string, string>;
    validation_rules?: Array<{
      field: string;
      rule: string;
      message: string;
    }>;
  };
}

export interface ImportDataResponse {
  import_job: DataImportJob;
  upload_url?: string; // for large files
}

export interface ExportDataRequest {
  type: 'towers' | 'coverage' | 'analytics' | 'reports';
  format: 'csv' | 'excel' | 'json' | 'pdf' | 'kml';
  filters?: Record<string, any>;
  options?: {
    include_headers?: boolean;
    date_format?: string;
    coordinate_format?: 'decimal' | 'dms';
    compression?: boolean;
  };
}

export interface ExportDataResponse {
  export_job: DataExportJob;
}


