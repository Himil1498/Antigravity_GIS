export * from "./indexCore";
export * from "./indexDomain";

// Dashboard exports with alias to avoid clashes
export type {
  SystemHealth,
  SystemStatus,
  SystemPerformance as DashboardSystemPerformance,
  SystemHealthSnapshot,
  SystemAlert,
  DowntimeEvent,
} from "./dashboard/dashboardSystem";
export * from "./dashboard/dashboardAnalytics";
export * from "./dashboard/dashboardActivity";
export * from "./dashboard/dashboardVisuals";
export * from "./dashboard/dashboardReporting";

// GIS tool types with aliases for conflicting names
export type {
  DistanceMeasurement,
  SegmentElevation,
  PolygonData,
  CircleData,
  ElevationProfile,
  SectorRFData,
  InfrastructureType as GISToolInfrastructureType,
  InfrastructureSource,
  CustomerType,
  Infrastructure,
  KMLImportResult,
  InfrastructureFilters,
  GISToolType,
  GISToolsState,
  ToolAction,
  ToolConfig,
  GisChartConfig,
  DataHubEntryType,
  DataHubSource,
  ExportFormat as GISToolsExportFormat,
  DataHubEntry,
  DataHubStats,
  DataHubFilters,
  GISToolsExport,
  GisExportOptions,
  HistoryState,
} from "./gisToolTypes/index";

export * from "./permissions/index";

