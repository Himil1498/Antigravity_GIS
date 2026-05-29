
// Data Quality and Validation
export interface DataQuality {
  completeness: number; // 0-100%
  accuracy: number; // 0-100%
  consistency: number; // 0-100%
  timeliness: number; // 0-100%
  validity: number; // 0-100%
  lastUpdated: string;
}

export interface ValidationRule {
  field: string;
  type: "required" | "format" | "range" | "custom";
  rule: string | RegExp | ((value: any) => boolean);
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// File and Data Import/Export
export type FileFormat =
  | "csv"
  | "excel"
  | "json"
  | "xml"
  | "kml"
  | "geojson"
  | "shp"
  | "pdf";

export type ExportFormat = "csv" | "excel" | "json" | "pdf" | "png" | "svg";

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  checksum?: string;
}

export interface ImportConfig {
  format: FileFormat;
  hasHeader: boolean;
  delimiter?: string;
  encoding?: string;
  mapping: Record<string, string>;
  validation: ValidationRule[];
}

