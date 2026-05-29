import apiClient from './api';
import type { ApiResponse, SecurityScanData, ValidationData } from './types';

// ========== Security Scanner ==========

/**
 * Run security scan
 */
export const runSecurityScan = async (
  scanType: 'full' | 'dependencies' | 'code' | 'config' = 'full'
): Promise<ApiResponse<SecurityScanData>> => {
  const response = await apiClient.post<ApiResponse<SecurityScanData>>('/dev-tools/security/scan', { scanType });
  return response.data;
};

/**
 * Get security scan history
 */
export const getSecurityScanHistory = async (): Promise<ApiResponse<SecurityScanData[]>> => {
  const response = await apiClient.get<ApiResponse<SecurityScanData[]>>('/dev-tools/security/history');
  return response.data;
};

/**
 * Get security scan details
 */
export const getSecurityScanDetails = async (scanId: number): Promise<ApiResponse<SecurityScanData>> => {
  const response = await apiClient.get<ApiResponse<SecurityScanData>>(`/dev-tools/security/scan/${scanId}`);
  return response.data;
};

/**
 * Delete security scan
 */
export const deleteSecurityScan = async (scanId: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/dev-tools/security/scan/${scanId}`);
  return response.data;
};

// ========== Environment Validator ==========

/**
 * Run environment validation
 */
export const validateEnvironment = async (): Promise<ApiResponse<ValidationData>> => {
  const response = await apiClient.post<ApiResponse<ValidationData>>('/dev-tools/environment/validate');
  return response.data;
};

/**
 * Get environment validation history
 */
export const getEnvironmentValidationHistory = async (): Promise<ApiResponse<ValidationData[]>> => {
  const response = await apiClient.get<ApiResponse<ValidationData[]>>('/dev-tools/environment/history');
  return response.data;
};

/**
 * Get environment validation details
 */
export const getEnvironmentValidationDetails = async (validationId: number): Promise<ApiResponse<ValidationData>> => {
  const response = await apiClient.get<ApiResponse<ValidationData>>(`/dev-tools/environment/validation/${validationId}`);
  return response.data;
};

/**
 * Delete environment validation
 */
export const deleteEnvironmentValidation = async (validationId: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/dev-tools/environment/validation/${validationId}`);
  return response.data;
};

