
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  message?: string;
}

