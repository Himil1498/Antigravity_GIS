
import { apiService } from '../api/index';

export interface UserMapPreferences {
  id?: number;
  user_id?: number;
  default_map_type?: string;
  default_zoom?: number;
  default_center?: { lat: number; lng: number } | null;
  default_region_id?: number | null;
  theme?: 'light' | 'dark' | 'auto';
  measurement_unit?: 'metric' | 'imperial';
  show_coordinates?: boolean;
  show_scale?: boolean;
  auto_save_enabled?: boolean;
  notifications_enabled?: boolean;
  mapType?: string; // Perspective field for map type (Network Planning)
  visibleFileIds?: number[]; // Managed by Network Layers hook
  preferences?: any; // JSON field for additional custom preferences
  created_at?: string;
  updated_at?: string;
}

class UserMapPreferencesService {
  private baseUrl = '/preferences';

  /**
   * Get user's map preferences
   */
  async getUserPreferences(): Promise<UserMapPreferences> {
    try {
      const response = await apiService.get(this.baseUrl);

      if (response.data.success) {
        const prefs = response.data.preferences;

        // Parse JSON fields if they are strings
        if (prefs.default_center && typeof prefs.default_center === 'string') {
          prefs.default_center = JSON.parse(prefs.default_center);
        }
        if (prefs.preferences && typeof prefs.preferences === 'string') {
          prefs.preferences = JSON.parse(prefs.preferences);
        }

        return prefs;
      }

      throw new Error(response.data.message || 'Failed to fetch preferences');
    } catch (error: any) {
      console.error('Error fetching user map preferences:', error);
      throw error;
    }
  }

  /**
   * Save or update user's map preferences
   */
  async saveUserPreferences(preferences: Partial<UserMapPreferences>): Promise<UserMapPreferences> {
    try {
      const response = await apiService.post(this.baseUrl, preferences);

      if (response.data.success) {
        const prefs = response.data.preferences;

        // Parse JSON fields if they are strings
        if (prefs.default_center && typeof prefs.default_center === 'string') {
          prefs.default_center = JSON.parse(prefs.default_center);
        }
        if (prefs.preferences && typeof prefs.preferences === 'string') {
          prefs.preferences = JSON.parse(prefs.preferences);
        }

        return prefs;
      }

      throw new Error(response.data.message || 'Failed to save preferences');
    } catch (error: any) {
      console.error('Error saving user map preferences:', error);
      throw error;
    }
  }

  /**
   * Reset user's map preferences to default
   */
  async resetUserPreferences(): Promise<void> {
    try {
      const response = await apiService.delete(this.baseUrl);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset preferences');
      }
    } catch (error: any) {
      console.error('Error resetting user map preferences:', error);
      throw error;
    }
  }

  /**
   * Get default preferences (used as fallback)
   */
  getDefaultPreferences(): UserMapPreferences {
    return {
      default_map_type: 'satellite',
      default_zoom: 10,
      default_center: null,
      default_region_id: null,
      theme: 'auto',
      measurement_unit: 'metric',
      show_coordinates: true,
      show_scale: true,
      auto_save_enabled: true,
      notifications_enabled: true,
      preferences: {}
    };
  }

  /**
   * Merge user preferences with defaults
   */
  mergeWithDefaults(userPrefs: Partial<UserMapPreferences>): UserMapPreferences {
    return {
      ...this.getDefaultPreferences(),
      ...userPrefs
    };
  }
}

export const userMapPreferencesService = new UserMapPreferencesService();
export default userMapPreferencesService;

