import { apiService } from '../api/index';
import { Infrastructure, GISToolsFilters } from './types';

export class InventoryService {
  async getAll(filters?: GISToolsFilters): Promise<Infrastructure[]> {
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

      const response = await apiService.get<{ success: boolean; items: any[] }>(
        '/infrastructure',
        { params }
      );

      const raw = response.data.items || [];
      const items: Infrastructure[] = raw.map((i: any) => ({
        ...i,
        latitude: Number(i.latitude),
        longitude: Number(i.longitude),
        properties: typeof i.properties === 'string' ? JSON.parse(i.properties) : i.properties,
      }));

      return items;
    } catch (error) {
      console.error('Error fetching infrastructure items:', error);
      return [];
    }
  }

  async getById(id: number): Promise<Infrastructure | null> {
    try {
      const response = await apiService.get<{ success: boolean; item: Infrastructure }>(
        `/infrastructure/${id}`
      );
      return response.data.item || null;
    } catch (error) {
      console.error('Error fetching infrastructure item:', error);
      return null;
    }
  }

  async create(data: Partial<Infrastructure>): Promise<Infrastructure | null> {
    try {
      const response = await apiService.post<{ success: boolean; item: Infrastructure }>(
        '/infrastructure',
        {
          item_name: data.item_name,
          item_type: data.item_type,
          latitude: data.latitude,
          longitude: data.longitude,
          region_id: data.region_id,
          properties: data.properties,
          notes: data.notes,
          is_saved: true
        }
      );
      return response.data.item || null;
    } catch (error) {
      console.error('Error creating infrastructure item:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Infrastructure>): Promise<boolean> {
    try {
      await apiService.put(`/infrastructure/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating infrastructure item:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/infrastructure/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting infrastructure item:', error);
      return false;
    }
  }
}

