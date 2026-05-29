
// ==========================================
// Metric Enums
// ==========================================

export type MetricCategory =
  | 'performance'
  | 'usage'
  | 'network'
  | 'business'
  | 'operational'
  | 'quality'
  | 'capacity'
  | 'revenue'
  | 'customer'
  | 'security';

export type MetricType =
  | 'counter'
  | 'gauge'
  | 'histogram'
  | 'timer'
  | 'rate'
  | 'percentage'
  | 'currency'
  | 'bytes'
  | 'duration';

export type AggregationType =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'distinct'
  | 'percentile'
  | 'stddev'
  | 'variance';

export type TimeGranularity =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

// ==========================================
// Report Enums
// ==========================================

export type ReportType =
  | 'dashboard'
  | 'summary'
  | 'detailed'
  | 'executive'
  | 'operational'
  | 'regulatory'
  | 'custom';

export type ReportCategory =
  | 'performance'
  | 'business'
  | 'network'
  | 'financial'
  | 'operational'
  | 'compliance'
  | 'analytics';

export type ReportFormat =
  | 'pdf'
  | 'excel'
  | 'csv'
  | 'json'
  | 'html'
  | 'powerpoint';

export type ReportStatus =
  | 'draft'
  | 'scheduled'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ==========================================
// Chart Enums
// ==========================================

export type ChartType =
  | 'line'
  | 'bar'
  | 'column'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'gauge'
  | 'funnel'
  | 'treemap'
  | 'sankey'
  | 'waterfall'
  | 'candlestick'
  | 'radar';

export type AxisType = 'category' | 'value' | 'time' | 'log';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type YAxisType = 'primary' | 'secondary';
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type TableAlignment = 'left' | 'center' | 'right';
export type TableColumnType = 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean' | 'custom';
export type SortDirection = 'asc' | 'desc';

// ==========================================
// Alert Enums
// ==========================================

export type AlertType =
  | 'threshold'
  | 'anomaly'
  | 'trend'
  | 'pattern'
  | 'composite'
  | 'external';

export type AlertSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type AlertStatus =
  | 'active'
  | 'acknowledged'
  | 'resolved'
  | 'suppressed'
  | 'expired';

export type AlertOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'between' | 'not_between';
export type AlertChannel = 'email' | 'sms' | 'slack' | 'webhook' | 'push';
export type DataExportType = 'analytics' | 'reports' | 'raw_data' | 'dashboards';
export type DataExportFormat = 'csv' | 'excel' | 'json' | 'pdf' | 'api';
export type DataExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

