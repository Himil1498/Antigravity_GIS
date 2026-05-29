
import { DashboardMetrics } from './dashboardAnalytics';

// ============================================================================
// KPI Report
// ============================================================================

export interface KPIReport {
  id: string;
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: DashboardMetrics;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'csv' | 'json' | 'excel';
  filePath?: string;
}

// ============================================================================
// KPI Thresholds
// ============================================================================

export interface KPIThreshold {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  comparison: 'greater' | 'less' | 'equal';
}

// ============================================================================
// Filter & Date Range
// ============================================================================

export interface DateRangeFilter {
  start: Date;
  end: Date;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}

export interface DashboardFilters {
  dateRange: DateRangeFilter;
  regions: string[];
  tools: string[];
  users: string[];
  status: ('success' | 'failed' | 'in-progress')[];
}

// ============================================================================
// Export Options
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'excel' | 'png';
  includeCharts: boolean;
  includeRawData: boolean;
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter' | 'Legal';
}

