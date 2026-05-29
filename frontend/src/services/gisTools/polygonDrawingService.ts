import { apiService } from '../api/index';
import { PolygonDrawing, GISToolsFilters } from './types';

export class PolygonDrawingService {
  async getAll(filters?: GISToolsFilters): Promise<PolygonDrawing[]> {
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

      const response = await apiService.get<{ success: boolean; polygons: any[] }>(
        '/drawings/polygon',
        { params }
      );

      const raw = response.data.polygons || [];
      const polygons: PolygonDrawing[] = raw.map((p: any) => ({
        ...p,
        coordinates: typeof p.coordinates === 'string' ? JSON.parse(p.coordinates) : p.coordinates,
        area: p.area !== null && p.area !== undefined ? Number(p.area) : undefined,
        perimeter: p.perimeter !== null && p.perimeter !== undefined ? Number(p.perimeter) : undefined,
      }));

      return polygons;
    } catch (error) {
      console.error('Error fetching polygon drawings:', error);
      return [];
    }
  }

  async getById(id: number): Promise<PolygonDrawing | null> {
    try {
      const response = await apiService.get<{ success: boolean; polygon: PolygonDrawing }>(
        `/drawings/polygon/${id}`
      );
      return response.data.polygon || null;
    } catch (error) {
      console.error('Error fetching polygon drawing:', error);
      return null;
    }
  }

  async create(data: Partial<PolygonDrawing>): Promise<PolygonDrawing | null> {
    try {
      const response = await apiService.post<{ success: boolean; polygon: PolygonDrawing }>(
        '/drawings/polygon',
        {
          polygon_name: data.polygon_name,
          coordinates: data.coordinates,
          area: data.area,
          perimeter: data.perimeter,
          fill_color: data.fill_color,
          stroke_color: data.stroke_color,
          opacity: data.opacity,
          region_id: data.region_id,
          properties: data.properties,
          notes: data.notes,
          is_saved: true
        }
      );
      return response.data.polygon || null;
    } catch (error) {
      console.error('Error creating polygon drawing:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<PolygonDrawing>): Promise<boolean> {
    try {
      await apiService.put(`/drawings/polygon/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating polygon drawing:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/drawings/polygon/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting polygon drawing:', error);
      return false;
    }
  }
}

