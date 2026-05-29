/**
 * Enhanced API Service with Batch Requests and Field Selection
 * Extends the base apiService with performance optimizations
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';
const TIMEOUT = process.env.NODE_ENV === 'production' ? 30000 : 10000;

// Create axios instance with same config as apiService
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Batch request function
 * Combines multiple API calls into a single request
 * 
 * @param requests - Array of request objects
 * @returns Promise with array of results
 */
export async function batchRequest(requests: Array<{
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: any;
  body?: any;
}>) {
  try {
    const response = await apiClient.post<{ results: any[] }>('/batch', { requests });
    return response.data.results;
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
}

/**
 * Get infrastructure by viewport with field selection
 * 
 * @param bounds - Viewport bounds
 * @param filters - Additional filters
 * @param fields - Comma-separated list of fields to return
 * @returns Promise with infrastructure data
 */
export async function getInfrastructureByViewport(
  bounds: { north: number; south: number; east: number; west: number },
  filters?: any,
  fields?: string
) {
  const params = {
    north: bounds.north,
    south: bounds.south,
    east: bounds.east,
    west: bounds.west,
    ...filters,
    // Default to minimal fields for map markers
    fields: fields || 'id,item_name,latitude,longitude,item_type,status'
  };

  const response = await apiClient.get<any>('/infrastructure/viewport', { params });
  return response.data;
}

/**
 * Load initial map data using batch request
 * Reduces 3 API calls to 1
 */
export async function loadInitialMapData() {
  const results = await batchRequest([
    { endpoint: '/api/regions', method: 'GET' },
    { endpoint: '/api/infrastructure/categories', method: 'GET' },
    { endpoint: '/api/infrastructure/stats', method: 'GET' }
  ]);

  return {
    regions: results[0].success ? results[0].data : null,
    categories: results[1].success ? results[1].data : null,
    stats: results[2].success ? results[2].data : null
  };
}

