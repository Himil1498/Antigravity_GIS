
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsMetric, PerformanceData, UsageStats, NetworkAnalytics, BusinessMetrics, ReportConfig } from './types';
import { initialState } from './initialState';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Metrics Management
    addMetric: (state, action: PayloadAction<AnalyticsMetric>) => {
      state.currentMetrics.push(action.payload);
      state.lastUpdate = new Date().toISOString();
    },

    updateMetric: (state, action: PayloadAction<{ id: string; value: number }>) => {
      const metric = state.currentMetrics.find(m => m.id === action.payload.id);
      if (metric) {
        metric.value = action.payload.value;
        metric.timestamp = new Date().toISOString();
      }
    },

    setMetrics: (state, action: PayloadAction<AnalyticsMetric[]>) => {
      state.currentMetrics = action.payload;
      state.lastUpdate = new Date().toISOString();
    },

    // Performance Data
    addPerformanceData: (state, action: PayloadAction<PerformanceData>) => {
      state.performanceData.push(action.payload);
      // Keep only last 1000 entries for performance
      if (state.performanceData.length > 1000) {
        state.performanceData = state.performanceData.slice(-1000);
      }
    },

    setPerformanceData: (state, action: PayloadAction<PerformanceData[]>) => {
      state.performanceData = action.payload;
    },

    // Usage Statistics
    addUsageStats: (state, action: PayloadAction<UsageStats>) => {
      state.usageStats.push(action.payload);
    },

    setUsageStats: (state, action: PayloadAction<UsageStats[]>) => {
      state.usageStats = action.payload;
    },

    // Network Analytics
    addNetworkAnalytics: (state, action: PayloadAction<NetworkAnalytics>) => {
      state.networkAnalytics.push(action.payload);
    },

    setNetworkAnalytics: (state, action: PayloadAction<NetworkAnalytics[]>) => {
      state.networkAnalytics = action.payload;
    },

    // Business Metrics
    addBusinessMetrics: (state, action: PayloadAction<BusinessMetrics>) => {
      state.businessMetrics.push(action.payload);
    },

    setBusinessMetrics: (state, action: PayloadAction<BusinessMetrics[]>) => {
      state.businessMetrics = action.payload;
    },

    // Time Range
    setTimeRange: (state, action: PayloadAction<Partial<typeof initialState.timeRange>>) => {
      state.timeRange = { ...state.timeRange, ...action.payload };
    },

    // Loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Reports
    addReport: (state, action: PayloadAction<ReportConfig>) => {
      state.reports.push(action.payload);
    },

    updateReport: (state, action: PayloadAction<{ id: string; updates: Partial<ReportConfig> }>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = { ...state.reports[index], ...action.payload.updates };
      }
    },

    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },

    addGeneratedReport: (state, action: PayloadAction<typeof initialState.generatedReports[0]>) => {
      state.generatedReports.push(action.payload);
    },

    // Alerts
    addAlert: (state, action: PayloadAction<Omit<typeof initialState.alerts[0], 'id' | 'timestamp' | 'acknowledged'>>) => {
      const alert = {
        ...action.payload,
        id: `alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      };
      state.alerts.push(alert);
    },

    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
      }
    },

    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.resolvedAt = new Date().toISOString();
      }
    },

    clearResolvedAlerts: (state) => {
      state.alerts = state.alerts.filter(alert => !alert.resolvedAt);
    },

    // Thresholds
    updateThreshold: (state, action: PayloadAction<{ metric: string; threshold: Partial<typeof initialState.thresholds[string]> }>) => {
      if (state.thresholds[action.payload.metric]) {
        state.thresholds[action.payload.metric] = {
          ...state.thresholds[action.payload.metric],
          ...action.payload.threshold,
        };
      } else {
        state.thresholds[action.payload.metric] = {
          enabled: true,
          ...action.payload.threshold,
        };
      }
    },

    // Dashboard Layout
    updateDashboardLayout: (state, action: PayloadAction<typeof initialState.dashboardLayout>) => {
      state.dashboardLayout = action.payload;
    },

    addDashboardWidget: (state, action: PayloadAction<typeof initialState.dashboardLayout[0]>) => {
      state.dashboardLayout.push(action.payload);
    },

    removeDashboardWidget: (state, action: PayloadAction<string>) => {
      state.dashboardLayout = state.dashboardLayout.filter(widget => widget.id !== action.payload);
    },

    // Export
    setExporting: (state, action: PayloadAction<{ exporting: boolean; progress?: number }>) => {
      state.isExporting = action.payload.exporting;
      if (action.payload.progress !== undefined) {
        state.exportProgress = action.payload.progress;
      }
    },
  },
});

export const {
  addMetric,
  updateMetric,
  setMetrics,
  addPerformanceData,
  setPerformanceData,
  addUsageStats,
  setUsageStats,
  addNetworkAnalytics,
  setNetworkAnalytics,
  addBusinessMetrics,
  setBusinessMetrics,
  setTimeRange,
  setLoading,
  addReport,
  updateReport,
  removeReport,
  addGeneratedReport,
  addAlert,
  acknowledgeAlert,
  resolveAlert,
  clearResolvedAlerts,
  updateThreshold,
  updateDashboardLayout,
  addDashboardWidget,
  removeDashboardWidget,
  setExporting,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

