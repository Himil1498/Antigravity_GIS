import apiClient from './api';
import type { AnalysisReport, RunAnalysisResponse, ApiResponse } from './types';

// ========== Code Analysis ==========

/**
 * Run code analysis
 */
export const runAnalysis = async (
  analysisType: 'frontend' | 'fullstack' | 'architecture' | 'dependency_graph' | 'hierarchy'
): Promise<RunAnalysisResponse> => {
  const response = await apiClient.post<RunAnalysisResponse>('/dev-tools/analyze', { analysisType });
  return response.data;
};

/**
 * Get analysis status
 */
export const getAnalysisStatus = async (reportId: number): Promise<AnalysisReport> => {
  const response = await apiClient.get<{ report: AnalysisReport }>(`/dev-tools/analyze/status/${reportId}`);
  return response.data.report;
};

/**
 * Get all reports
 */
export const getAllReports = async (): Promise<AnalysisReport[]> => {
  const response = await apiClient.get<{ reports: AnalysisReport[] }>('/dev-tools/reports');
  return response.data.reports;
};

/**
 * Download report
 */
export const downloadReport = async (reportId: number, format: 'html' | 'json' | 'md' = 'html') => {
  const response = await apiClient.get<Blob>(
    `/dev-tools/reports/${reportId}/download?format=${format}`,
    { responseType: 'blob' }
  );

  // Create download link
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `report-${reportId}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * View report (opens HTML in new tab)
 */
export const viewReport = async (reportId: number) => {
  const response = await apiClient.get<Blob>(
    `/dev-tools/reports/${reportId}/download?format=html`,
    { responseType: 'blob' }
  );

  // Create blob URL and open in new tab
  const url = window.URL.createObjectURL(response.data);
  window.open(url, '_blank');

  // Clean up after a delay
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

/**
 * Delete report
 */
export const deleteReport = async (reportId: number) => {
  const response = await apiClient.delete(`/dev-tools/reports/${reportId}`);
  return response.data;
};

// ========== Props Analysis ==========

/**
 * Run props analysis
 */
export const runPropsAnalysis = async (): Promise<{ success: boolean; reportId: number; message: string; estimatedTime: string }> => {
  const response = await apiClient.post<{ success: boolean; reportId: number; message: string; estimatedTime: string }>('/dev-tools/props-analysis');
  return response.data;
};

/**
 * Get props analysis result
 */
export const getPropsAnalysisResult = async (reportId: number): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(`/dev-tools/props-analysis/${reportId}`);
  return response.data;
};

// ========== API Performance Analysis ==========

/**
 * Run API performance analysis
 */
export const runAPIAnalysis = async (): Promise<{ success: boolean; reportId: number; message: string; estimatedTime: string }> => {
  const response = await apiClient.post<{ success: boolean; reportId: number; message: string; estimatedTime: string }>('/dev-tools/api-analysis');
  return response.data;
};

/**
 * Get API analysis result
 */
export const getAPIAnalysisResult = async (reportId: number): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(`/dev-tools/api-analysis/${reportId}`);
  return response.data;
};

