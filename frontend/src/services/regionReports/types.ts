export type ReportType =
  | "region_usage"
  | "user_activity"
  | "access_denials"
  | "audit_logs"
  | "region_requests"
  | "zone_assignments"
  | "comprehensive"
  | "network_data";

export interface ReportOptions {
  type: ReportType;
  format: "csv" | "json" | "xlsx";
  dateFrom?: Date;
  dateTo?: Date;
  regions?: string[];
  users?: string[];
}

