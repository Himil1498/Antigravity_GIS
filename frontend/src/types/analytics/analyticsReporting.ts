
import type { BaseEntity, DateRange, TelecomCompany, NetworkTechnology } from '../common/index';
import type {
  ReportType,
  ReportCategory,
  ReportFormat,
  ReportStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  DataExportType,
  DataExportFormat,
  DataExportStatus,
  AggregationType
} from './analyticsEnums';

import type { ChartConfiguration, TableConfiguration } from './analyticsVisuals';


// Reporting
export interface Report extends BaseEntity {
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  schedule: ReportSchedule;
  recipients: string[];
  filters: ReportFilters;
  charts: ChartConfiguration[];
  tables: TableConfiguration[];
  status: ReportStatus;
  file_url?: string;
  file_size?: number;
  generation_time?: number; // seconds
  last_generated?: string;
  next_generation?: string;
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number; // 0-6
  day_of_month?: number; // 1-31
  time: string; // HH:mm
  timezone: string;
  auto_send: boolean;
  retention_days: number;
}

export interface ReportFilters {
  date_range: DateRange;
  companies?: TelecomCompany[];
  technologies?: NetworkTechnology[];
  regions?: string[];
  tower_types?: string[];
  custom_filters?: Record<string, any>;
}

// Alerts and Monitoring
export interface Alert extends BaseEntity {
  name: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  condition: AlertCondition;
  notifications: AlertNotification[];
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  metadata: Record<string, any>;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'between' | 'not_between';
  threshold: number | number[];
  duration: number; // minutes
  aggregation: AggregationType;
  filters?: Record<string, any>;
}

export interface AlertNotification {
  channel: 'email' | 'sms' | 'slack' | 'webhook' | 'push';
  recipients: string[];
  template: string;
  delay: number; // minutes
  repeat_interval?: number; // minutes
  max_repeats?: number;
}

// Data Export
export interface DataExport extends BaseEntity {
  name: string;
  type: DataExportType;
  format: DataExportFormat;
  filters: Record<string, any>;
  status: DataExportStatus;
  progress: number; // percentage
  file_url?: string;
  file_size?: number;
  download_count: number;
  expires_at: string;
  requested_by: string;
}


