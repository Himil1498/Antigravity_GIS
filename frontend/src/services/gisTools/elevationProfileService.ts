import { apiService } from '../api/index';
import { ElevationProfile, GISToolsFilters } from './types';

export class ElevationProfileService {
  async getAll(filters?: GISToolsFilters): Promise<ElevationProfile[]> {
    try {
      const params: Record<string, any> = {};

      // Handle user filtering - send explicit filter parameter to backend
      if (filters?.userId !== undefined) {
        if (filters.userId === 'all') {
          params.filter = 'all';
        } else if (filters.userId === 'me') {
          params.filter = 'me';
        } else {
          params.filter = 'user';
          params.userId = filters.userId;
        }
      }

      if (filters?.regionId) params.regionId = filters.regionId;

      const response = await apiService.get<{ success: boolean; profiles: any[] }>(
        '/elevation',
        { params }
      );

      const raw = response.data.profiles || [];
      const profiles: ElevationProfile[] = raw.map((p: any) => {
        const parsed = {
          ...p,
          start_point: typeof p.start_point === 'string' ? JSON.parse(p.start_point) : p.start_point,
          end_point: typeof p.end_point === 'string' ? JSON.parse(p.end_point) : p.end_point,
          elevation_data: typeof p.elevation_data === 'string' ? JSON.parse(p.elevation_data) : p.elevation_data,
          points: typeof p.points === 'string' ? JSON.parse(p.points) : p.points, // 🆕 Parse points array
          // ✨ LOS Analysis Fields - Parse JSON if needed
          building_data: typeof p.building_data === 'string' ? JSON.parse(p.building_data) : p.building_data,
          obstacle_data: typeof p.obstacle_data === 'string' ? JSON.parse(p.obstacle_data) : p.obstacle_data,
          los_analysis: typeof p.los_analysis === 'string' ? JSON.parse(p.los_analysis) : p.los_analysis,
          antenna_height_1: p.antenna_height_1 ? Number(p.antenna_height_1) : undefined,
          antenna_height_2: p.antenna_height_2 ? Number(p.antenna_height_2) : undefined,
          rf_frequency: p.rf_frequency ? Number(p.rf_frequency) : undefined,
          total_distance: Number(p.total_distance),
          max_elevation: Number(p.max_elevation),
          min_elevation: Number(p.min_elevation),
          elevation_gain: p.elevation_gain ? Number(p.elevation_gain) : undefined,
          elevation_loss: p.elevation_loss ? Number(p.elevation_loss) : undefined,
          bearing: p.bearing ? Number(p.bearing) : null, // 📐 Bearing A→B
          reverse_bearing: p.reverse_bearing ? Number(p.reverse_bearing) : null, // 📐 Bearing B→A
        };

        return parsed;
      });

      return profiles;
    } catch (error) {
      console.error('Error fetching elevation profiles:', error);
      return [];
    }
  }

  async getById(id: number): Promise<ElevationProfile | null> {
    try {
      const response = await apiService.get<{ success: boolean; profile: ElevationProfile }>(
        `/elevation/${id}`
      );
      return response.data.profile || null;
    } catch (error) {
      console.error('Error fetching elevation profile:', error);
      return null;
    }
  }

  async create(data: Partial<ElevationProfile>): Promise<ElevationProfile | null> {
    try {

      const response = await apiService.post<{ success: boolean; profile: ElevationProfile }>(
        '/elevation/profiles', // Try alternate endpoint path
        {
          profile_name: data.profile_name,
          start_point: data.start_point,
          end_point: data.end_point,
          elevation_data: data.elevation_data,
          total_distance: data.total_distance,
          max_elevation: data.max_elevation,
          min_elevation: data.min_elevation,
          elevation_gain: data.elevation_gain,
          elevation_loss: data.elevation_loss,
          bearing: data.bearing, // 📐 Bearing/Azimuth angle A→B
          reverse_bearing: data.reverse_bearing, // 📐 Bearing/Azimuth angle B→A
          points: data.points, // 🆕 Include points array
          region_id: data.region_id,
          notes: data.notes,
          is_saved: true,
          // ✨ LOS Analysis Fields
          building_data: data.building_data,
          obstacle_data: data.obstacle_data,
          los_analysis: data.los_analysis,
          antenna_height_1: data.antenna_height_1,
          antenna_height_2: data.antenna_height_2,
          rf_frequency: data.rf_frequency
        }
      );

      return response.data.profile || null;
    } catch (error: any) {
      console.error('❌ Error creating elevation profile:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });

      // If 404, try fallback endpoint
      if (error.response?.status === 404) {
        try {
          
          const fallbackResponse = await apiService.post<{ success: boolean; profile: ElevationProfile }>(
            '/elevation',
            {
              profile_name: data.profile_name,
              start_point: data.start_point,
              end_point: data.end_point,
              elevation_data: data.elevation_data,
              total_distance: data.total_distance,
              max_elevation: data.max_elevation,
              min_elevation: data.min_elevation,
              elevation_gain: data.elevation_gain,
              elevation_loss: data.elevation_loss,
              bearing: data.bearing, // 📐 Bearing/Azimuth angle A→B
              reverse_bearing: data.reverse_bearing, // 📐 Bearing/Azimuth angle B→A
              points: data.points, // 🆕 Include points array in fallback too
              region_id: data.region_id,
              notes: data.notes,
              is_saved: true,
              // ✨ LOS Analysis Fields
              building_data: data.building_data,
              obstacle_data: data.obstacle_data,
              los_analysis: data.los_analysis,
              antenna_height_1: data.antenna_height_1,
              antenna_height_2: data.antenna_height_2,
              rf_frequency: data.rf_frequency
            }
          );
          
          return fallbackResponse.data.profile || null;
        } catch (fallbackError: any) {
          console.error('❌ Fallback endpoint also failed:', fallbackError.response?.data || fallbackError.message);
          throw new Error(`Backend endpoint not found. Please ensure the elevation profile API is properly configured. Error: ${fallbackError.response?.data?.message || fallbackError.message}`);
        }
      }

      throw new Error(error.response?.data?.message || 'Failed to save elevation profile to database');
    }
  }

  async update(id: number, data: Partial<ElevationProfile>): Promise<boolean> {
    try {
      await apiService.put(`/elevation/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating elevation profile:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/elevation/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting elevation profile:', error);
      return false;
    }
  }
}

