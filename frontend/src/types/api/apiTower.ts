
import type { TelecomTower } from '../data/index';

// Tower Management API
export interface GetTowersRequest {
  filters?: {
    companies?: string[];
    states?: string[];
    types?: string[];
    status?: string[];
    technologies?: string[];
    date_range?: {
      start: string;
      end: string;
    };
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  search?: string;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  include?: string[]; // related data to include
}

export interface CreateTowerRequest {
  tower: Omit<TelecomTower, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateTowerRequest {
  tower_id: string;
  updates: Partial<TelecomTower>;
}

export interface BulkTowerOperationRequest {
  operation: 'update' | 'delete' | 'status_change' | 'assign_company';
  tower_ids?: string[];
  filters?: GetTowersRequest['filters'];
  data?: Record<string, any>;
}

export interface BulkTowerOperationResponse {
  operation_id: string;
  total_affected: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    successful: number;
    failed: number;
    errors: Array<{
      tower_id: string;
      error: string;
    }>;
  };
}

// Coverage API
export interface GetCoverageRequest {
  tower_id?: string;
  technology?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  quality_threshold?: number;
  include_predicted?: boolean;
}

export interface CoverageAnalysisRequest {
  location: { lat: number; lng: number };
  technologies: string[];
  radius?: number; // meters
}

export interface CoverageAnalysisResponse {
  location: { lat: number; lng: number };
  coverage_results: Array<{
    technology: string;
    covered: boolean;
    signal_strength: number;
    quality: string;
    serving_towers: Array<{
      tower_id: string;
      distance: number;
      signal_contribution: number;
    }>;
  }>;
  overall_score: number;
  recommendations: string[];
}


