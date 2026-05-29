export interface AnalysisReport {
  id: number;
  report_type: 'frontend' | 'fullstack' | 'architecture' | 'dependency_graph' | 'hierarchy';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_by: number;
  started_by_name?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_files?: number;
  total_lines?: number;
  unused_files?: number;
  high_complexity_files?: number;
  error_message?: string;
  download_count: number;
  last_downloaded_at?: string;
}

export interface DevToolSettings {
  auto_run_weekly: boolean;
  send_email_notifications: boolean;
  preferred_report_format: 'html' | 'json' | 'pdf';
  show_unused_files: boolean;
  show_complexity_scores: boolean;
  max_reports_to_keep: number;
}

export interface RunAnalysisResponse {
  reportId: number;
  status: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface BackupData {
  id: number;
  filename: string;
  size: string;
  size_mb: number;
  size_bytes: number;
  backup_type: string;
  tables_count: number;
  include_data: boolean;
  description: string;
  created_at: string;
  created_by: number;
  created_by_name?: string;
  restored_at?: string;
  restored_by?: number;
  restored_by_name?: string;
  fileExists?: boolean;
  canRestore?: boolean;
}

export interface BackupStats {
  total_backups: number;
  total_size_bytes: number;
  total_size_mb: number;
  avg_size_mb: number;
  last_backup_at?: string;
  restored_count: number;
}

export interface SecurityScanData {
  id: number;
  scan_type: string;
  risk_score: number;
  risk_level: string;
  vulnerabilities_count: number;
  warnings_count: number;
  results: any;
  scan_duration_ms: number;
  created_by: number;
  created_at: string;
}

export interface ValidationData {
  id: number;
  environment: string;
  overall_status: string;
  passed_checks: number;
  warning_count: number;
  error_count: number;
  results: any;
  created_by: number;
  created_at: string;
}

