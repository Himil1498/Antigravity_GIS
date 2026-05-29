
import {
  DistanceMeasurement,
  PolygonData,
  CircleData,
  ElevationProfile,
  SectorRFData
} from './gisToolsModels';
import { Infrastructure } from './gisToolsImports';
import { GISToolsState } from './gisToolsConfig';

// ===================================
// Data Hub Types
// ===================================

export type DataHubEntryType = 'Distance' | 'Polygon' | 'Circle' | 'Elevation' | 'Infrastructure' | 'SectorRF' | 'Customer';
export type DataHubSource = 'Manual' | 'Import';
export type ExportFormat = 'XLSX' | 'CSV' | 'KML' | 'KMZ' | 'JSON';

export interface DataHubEntry {
  id: string;
  type: DataHubEntryType;
  name: string;
  createdAt: Date;
  savedAt: Date;
  fileSize: number; // in bytes
  source: DataHubSource;
  data: DistanceMeasurement | PolygonData | CircleData | ElevationProfile | Infrastructure | SectorRFData;
  description?: string;
  tags?: string[];
  userId?: number; // User who created this entry
  username?: string; // Username of creator
}

export interface DataHubStats {
  totalEntries: number;
  totalSize: number; // in bytes
  byType: {
    Distance: number;
    Polygon: number;
    Circle: number;
    Elevation: number;
    Infrastructure: number;
    SectorRF: number;
  };
  bySource: {
    Manual: number;
    Import: number;
  };
}

export interface DataHubFilters {
  type?: DataHubEntryType;
  source?: DataHubSource;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  tags?: string[];
}

// ===================================
// Export Configuration
// ===================================

export interface GISToolsExport {
  version: string;
  exportDate: Date;
  distanceMeasurements: DistanceMeasurement[];
  polygons: PolygonData[];
  circles: CircleData[];
  elevationProfiles: ElevationProfile[];
  infrastructures: Infrastructure[];
}

export interface GisExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  selectedIds?: string[];
}

// ===================================
// History Management
// ===================================

export interface HistoryState {
  past: GISToolsState[];
  present: GISToolsState;
  future: GISToolsState[];
}

