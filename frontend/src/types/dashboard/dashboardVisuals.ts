
// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend: boolean;
  showGrid: boolean;
  animated: boolean;
  colors: string[];
}

// ============================================================================
// Dashboard Widget
// ============================================================================

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'map' | 'timeline';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
  refreshInterval?: number;  // Seconds
  visible: boolean;
}

// ============================================================================
// Dashboard Configuration
// ============================================================================

export interface DashboardConfig {
  autoRefresh: boolean;
  refreshInterval: number;  // Seconds
  widgets: DashboardWidget[];
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'flex' | 'masonry';
  notifications: boolean;
}

