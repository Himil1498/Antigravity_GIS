
import type { ApiResponse } from './apiCommon';

// Health and Status
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: Record<string, ServiceHealth>;
  environment: string;
  uptime: number;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  response_time?: number;
  last_check: string;
  message?: string;
  dependencies?: Record<string, ServiceHealth>;
}

export interface SystemMetricsResponse {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  request_rate: number;
  error_rate: number;
  response_time_avg: number;
  timestamp: string;
}

// API Rate Limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retry_after?: number; // seconds
}

export interface RateLimitResponse extends ApiResponse {
  rate_limit: RateLimitInfo;
}

// Webhooks
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  ssl_verification: boolean;
  content_type: 'json' | 'form';
  headers?: Record<string, string>;
  timeout: number;
  retry_policy: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    base_delay: number;
  };
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature: string;
  delivery_id: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  response_code?: number;
  response_body?: string;
  created_at: string;
  delivered_at?: string;
}

// API Documentation
export interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  parameters?: ApiParameter[];
  request_body?: ApiRequestBody;
  responses: Record<string, ApiResponse>;
  security?: string[];
  tags?: string[];
  deprecated?: boolean;
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  description?: string;
  schema: any;
  example?: any;
}

export interface ApiRequestBody {
  description?: string;
  content: Record<string, {
    schema: any;
    example?: any;
  }>;
  required: boolean;
}

// Caching
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  max_size: number; // Maximum cache size in MB
  strategies: CacheStrategy[];
}

export interface CacheStrategy {
  pattern: string; // URL pattern to match
  ttl: number;
  vary?: string[]; // Headers to vary cache by
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  hit_rate: number;
  size: number; // Current cache size in MB
  entries: number;
  evictions: number;
}

