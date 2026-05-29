
// Base API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
  timestamp: string;
  request_id: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
  has_next?: boolean;
  has_previous?: boolean;
  total_pages?: number;
  filters_applied?: Record<string, any>;
  sort_applied?: {
    field: string;
    order: 'asc' | 'desc';
  };
  execution_time?: number; // milliseconds
  cache_hit?: boolean;
  version?: string;
}

// Request/Response Wrappers
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    total: number;
    page: number;
    limit: number;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  facets?: Record<string, FacetResult[]>;
  suggestions?: string[];
  query_time?: number;
}

export interface FacetResult {
  value: string;
  count: number;
  selected?: boolean;
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api_key';
    token?: string;
    username?: string;
    password?: string;
    api_key?: string;
  };
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
    max_size: number;
  };
}

// Request Options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  cache?: boolean;
  retry?: boolean;
  signal?: AbortSignal;
}

// Error Handling
export interface ApiErrorDetails {
  code: string;
  message: string;
  documentation_url?: string;
  request_id: string;
  timestamp: string;
  path: string;
  method: string;
  status: number;
  details?: Record<string, any>;
  stack_trace?: string[];
}

export interface ValidationErrorResponse extends ApiResponse {
  errors: Array<{
    field: string;
    code: string;
    message: string;
    value?: any;
  }>;
}

