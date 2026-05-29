
import { AnalyticsState } from './types';

export const initialState: AnalyticsState = {
  currentMetrics: [],
  performanceData: [],
  usageStats: [],
  networkAnalytics: [],
  businessMetrics: [],

  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
    end: new Date().toISOString(),
    period: '24h',
  },

  isLoading: false,
  lastUpdate: null,

  reports: [],
  generatedReports: [],

  alerts: [],
  thresholds: {
    response_time: { max: 2000, enabled: true },
    memory_usage: { max: 80, enabled: true },
    signal_quality: { min: 70, enabled: true },
    tower_downtime: { max: 5, enabled: true },
  },

  dashboardLayout: [
    {
      id: 'performance_overview',
      type: 'chart',
      position: { x: 0, y: 0 },
      size: { width: 6, height: 4 },
      config: { chartType: 'line', metrics: ['response_time', 'memory_usage'] },
    },
    {
      id: 'network_status',
      type: 'metric',
      position: { x: 6, y: 0 },
      size: { width: 3, height: 2 },
      config: { metric: 'coverage_percentage' },
    },
    {
      id: 'active_towers',
      type: 'map',
      position: { x: 0, y: 4 },
      size: { width: 12, height: 6 },
      config: { showHeatmap: true, metric: 'signal_strength' },
    },
  ],

  isExporting: false,
  exportProgress: 0,
};

