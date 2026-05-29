import apiClient from './api';
import type { ApiResponse, BackupData, BackupStats } from './types';

// ========== Database Backup ==========

/**
 * Create database backup
 */
export const createBackup = async (
  params: { description?: string; includeData?: boolean; tables?: string[] }
): Promise<ApiResponse<BackupData>> => {
  const response = await apiClient.post<ApiResponse<BackupData>>('/dev-tools/backup/create', params);
  return response.data;
};

/**
 * Get backup list
 */
export const getBackupList = async (): Promise<ApiResponse<BackupData[]>> => {
  const response = await apiClient.get<ApiResponse<BackupData[]>>('/dev-tools/backup/list');
  return response.data;
};

/**
 * Download backup file
 */
export const downloadBackup = async (backupId: number, filename: string): Promise<void> => {
  const response = await apiClient.get<Blob>(
    `/dev-tools/backup/${backupId}/download`,
    { responseType: 'blob' }
  );

  // Create download link
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Restore database from backup
 */
export const restoreBackup = async (backupId: number): Promise<ApiResponse<{ filename: string; duration: string }>> => {
  const response = await apiClient.post<ApiResponse<{ filename: string; duration: string }>>(`/dev-tools/backup/${backupId}/restore`, {
    confirmRestore: true
  });
  return response.data;
};

/**
 * Delete backup
 */
export const deleteBackup = async (
  backupId: number,
  deleteFile: boolean = true
): Promise<ApiResponse<{ filename: string; fileDeleted: boolean }>> => {
  // Use request method to send body with DELETE request
  const response = await apiClient.delete<ApiResponse<{ filename: string; fileDeleted: boolean }>>(
    `/dev-tools/backup/${backupId}`,
    {
      data: { deleteFile }
    } as any
  );
  return response.data;
};

/**
 * Get backup statistics
 */
export const getBackupStats = async (): Promise<ApiResponse<{ stats: BackupStats; recentBackups: BackupData[] }>> => {
  const response = await apiClient.get<ApiResponse<{ stats: BackupStats; recentBackups: BackupData[] }>>('/dev-tools/backup/stats');
  return response.data;
};

/**
 * Verify backup integrity
 */
export const verifyBackup = async (
  backupId: number
): Promise<ApiResponse<{ valid: boolean; errors: string[]; checks: any }>> => {
  const response = await apiClient.get<ApiResponse<{ valid: boolean; errors: string[]; checks: any }>>(`/dev-tools/backup/${backupId}/verify`);
  return response.data;
};

