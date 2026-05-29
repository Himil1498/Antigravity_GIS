import { apiService } from '../api/index';
import { DistanceMeasurement, GISToolsFilters } from './types';

export class DistanceMeasurementService {
  /**
   * Get all distance measurements with optional filters
   * Admin/Manager can specify userId to see other users' data
   */
  async getAll(filters?: GISToolsFilters): Promise<DistanceMeasurement[]> {
    try {
      const params: Record<string, any> = {};

      // Handle user filtering - send explicit filter parameter to backend
      if (filters?.userId !== undefined) {
        if (filters.userId === 'all') {
          params.filter = 'all'; // Backend will return ALL users' data
        } else if (filters.userId === 'me') {
          params.filter = 'me'; // Backend will return only current user's data
        } else {
          params.filter = 'user'; // Backend will filter by specific userId
          params.userId = filters.userId;
        }
      }

      if (filters?.regionId) params.regionId = filters.regionId;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const response = await apiService.get<{ success: boolean; measurements: any[] }>(
        '/measurements/distance',
        { params }
      );

      const raw = response.data.measurements || [];
      // Normalize fields from backend (parse JSON strings)
      const measurements: DistanceMeasurement[] = raw.map((m: any) => ({
        ...m,
        points: typeof m.points === 'string' ? JSON.parse(m.points) : m.points,
        total_distance: Number(m.total_distance),
        elevation_data: m.elevation_data && typeof m.elevation_data === 'string' ? JSON.parse(m.elevation_data) : m.elevation_data,
        min_elevation: m.min_elevation !== null && m.min_elevation !== undefined ? Number(m.min_elevation) : undefined,
        max_elevation: m.max_elevation !== null && m.max_elevation !== undefined ? Number(m.max_elevation) : undefined,
        elevation_gain: m.elevation_gain !== null && m.elevation_gain !== undefined ? Number(m.elevation_gain) : undefined,
        elevation_loss: m.elevation_loss !== null && m.elevation_loss !== undefined ? Number(m.elevation_loss) : undefined,
      }));

      return measurements;
    } catch (error: any) {
      console.error('❌ Error fetching distance measurements:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  }

  /**
   * Get single distance measurement by ID
   */
  async getById(id: number): Promise<DistanceMeasurement | null> {
    try {
      const response = await apiService.get<{ success: boolean; measurement: DistanceMeasurement }>(
        `/measurements/distance/${id}`
      );
      return response.data.measurement || null;
    } catch (error) {
      console.error('Error fetching distance measurement:', error);
      return null;
    }
  }

  /**
   * Create new distance measurement
   */
  async create(data: Partial<DistanceMeasurement>): Promise<DistanceMeasurement | null> {
    try {
      const response = await apiService.post<{ success: boolean; measurement: DistanceMeasurement }>(
        '/measurements/distance',
        {
          measurement_name: data.measurement_name,
          points: data.points,
          total_distance: data.total_distance,
          unit: data.unit || 'meters',
          region_id: data.region_id,
          notes: data.notes,
          is_saved: true,
          elevation_data: data.elevation_data,
          min_elevation: data.min_elevation,
          max_elevation: data.max_elevation,
          elevation_gain: data.elevation_gain,
          elevation_loss: data.elevation_loss
        }
      );
      return response.data.measurement || null;
    } catch (error) {
      console.error('Error creating distance measurement:', error);
      throw error;
    }
  }

  /**
   * Update distance measurement
   */
  async update(id: number, data: Partial<DistanceMeasurement>): Promise<boolean> {
    try {
      await apiService.put(`/measurements/distance/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating distance measurement:', error);
      return false;
    }
  }

  /**
   * Delete distance measurement
   */
  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/measurements/distance/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting distance measurement:', error);
      return false;
    }
  }
}

