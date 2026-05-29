import apiClient from './api';
import type { DevToolSettings } from './types';

/**
 * Get user settings
 */
export const getUserSettings = async (): Promise<DevToolSettings> => {
  const response = await apiClient.get<{ settings: DevToolSettings }>('/dev-tools/settings');
  return response.data.settings;
};

/**
 * Update user settings
 */
export const updateUserSettings = async (settings: Partial<DevToolSettings>) => {
  const response = await apiClient.put('/dev-tools/settings', settings);
  return response.data;
};

