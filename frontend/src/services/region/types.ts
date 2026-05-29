
export interface Region {
  id: number;
  name: string;
  code: string;
  type: string;
  parentId: number | null;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  hasBoundary?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegionsResponse {
  success: boolean;
  regions: Region[];
  total?: number;
}

export interface RegionResponse {
  success: boolean;
  region: Region;
}

export interface Boundary {
  id: number;
  regionId: number;
  boundaryGeojson: any; // GeoJSON geometry
  boundaryGeoJSON?: any; // Alternate casing from backend
  geojson?: any; // Alias for component compatibility
  boundaryType: 'Polygon' | 'MultiPolygon';
  type?: string; // Alias for component compatibility
  version: number;
  vertexCount: number;
  areaSqkm?: number;
  createdBy: number;
  createdByName?: string; // User name who created it
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  source?: string;
  notes?: string;
}

export interface BoundaryResponse {
  success: boolean;
  boundary: Boundary | null;
}

export interface BoundaryHistoryResponse {
  success: boolean;
  boundaries: Boundary[];
}

export interface BoundaryVersion {
  id: number;
  regionId: number;
  type: string;
  vertexCount: number;
  areaSqKm?: number;
  versionNumber: number;
  status: 'draft' | 'published' | 'archived';
  createdBy: number;
  createdByName: string;
  createdAt: string;
  publishedBy?: number;
  publishedByName?: string;
  publishedAt?: string;
  notes?: string;
  changeReason?: string;
  source?: string;
  impactSummary?: any;
}

export interface BoundaryVersionsResponse {
  success: boolean;
  versions: BoundaryVersion[];
  total: number;
}

export interface DraftBoundary {
  id: number;
  regionId: number;
  geojson: any;
  type: string;
  vertexCount: number;
  areaSqKm?: number;
  versionNumber: number;
  status: 'draft';
  createdBy: number;
  createdByName: string;
  createdAt: string;
  notes?: string;
  changeReason?: string;
  source?: string;
}

export interface DraftBoundaryResponse {
  success: boolean;
  draft: DraftBoundary | null;
  message?: string;
}

export interface ImpactAnalysis {
  summary: {
    totalAffected: number;
    itemsStaying: number;
    itemsMovingOut: number;
    itemsMovingIn: number;
    itemsBecomingInvalid: number;
    affectedUsersCount: number;
  };
  itemsStaying: any[];
  itemsMovingOut: any[];
  itemsMovingIn: any[];
  itemsBecomingInvalid: any[];
  affectedUsers: any[];
  hasStaying: boolean;
  totalStaying: number;
}

export interface ImpactAnalysisResponse {
  success: boolean;
  impact: ImpactAnalysis;
}

export interface PublishResponse {
  success: boolean;
  message: string;
  published: {
    versionId: number;
    versionNumber: number;
    regionId: number;
    publishedAt: string;
    impact: {
      totalAffected: number;
      itemsUpdated: number;
      itemsBecomingInvalid: number;
    };
    rollbackExpiresAt: string;
  };
}

