import { apiService } from '../api/index';
import { CircleDrawing, GISToolsFilters } from './types';

export class CircleDrawingService {
  async getAll(filters?: GISToolsFilters): Promise<CircleDrawing[]> {
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

      const response = await apiService.get<{ success: boolean; circles: any[] }>(
        '/drawings/circle',
        { params }
      );

      const raw = response.data.circles || [];
      const circles: CircleDrawing[] = raw.map((c: any) => ({
        ...c,
        center_lat: Number(c.center_lat),
        center_lng: Number(c.center_lng),
        radius: Number(c.radius),
      }));

      return circles;
    } catch (error) {
      console.error('Error fetching circle drawings:', error);
      return [];
    }
  }

  async getById(id: number): Promise<CircleDrawing | null> {
    try {
      const response = await apiService.get<{ success: boolean; circle: CircleDrawing }>(
        `/drawings/circle/${id}`
      );
      return response.data.circle || null;
    } catch (error) {
      console.error('Error fetching circle drawing:', error);
      return null;
    }
  }

  async create(data: Partial<CircleDrawing>): Promise<CircleDrawing | null> {
    try {
      const response = await apiService.post<{ success: boolean; circle: CircleDrawing }>(
        '/drawings/circle',
        {
          circle_name: data.circle_name,
          center_lat: data.center_lat,
          center_lng: data.center_lng,
          radius: data.radius,
          fill_color: data.fill_color,
          stroke_color: data.stroke_color,
          opacity: data.opacity,
          region_id: data.region_id,
          properties: data.properties,
          notes: data.notes,
          is_saved: true
        }
      );
      return response.data.circle || null;
    } catch (error) {
      console.error('Error creating circle drawing:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<CircleDrawing>): Promise<boolean> {
    try {
      await apiService.put(`/drawings/circle/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating circle drawing:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/drawings/circle/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting circle drawing:', error);
      return false;
    }
  }
}

