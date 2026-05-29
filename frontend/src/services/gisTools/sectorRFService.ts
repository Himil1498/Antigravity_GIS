import { apiService } from '../api/index';
import { SectorRF, GISToolsFilters } from './types';

export class SectorRFService {
  async getAll(filters?: GISToolsFilters): Promise<SectorRF[]> {
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

      const response = await apiService.get<{ success: boolean; sectors: any[] }>(
        '/rf/sectors',
        { params }
      );

      const raw = response.data.sectors || [];
      const sectors: SectorRF[] = raw.map((s: any) => ({
        ...s,
        tower_lat: Number(s.tower_lat),
        tower_lng: Number(s.tower_lng),
        azimuth: Number(s.azimuth),
        beamwidth: Number(s.beamwidth),
        radius: Number(s.radius),
        frequency: s.frequency !== null && s.frequency !== undefined ? Number(s.frequency) : s.frequency,
      }));

      return sectors;
    } catch (error) {
      console.error('Error fetching RF sectors:', error);
      return [];
    }
  }

  async getById(id: number): Promise<SectorRF | null> {
    try {
      const response = await apiService.get<{ success: boolean; sector: SectorRF }>(
        `/rf/sectors/${id}`
      );
      return response.data.sector || null;
    } catch (error) {
      console.error('Error fetching RF sector:', error);
      return null;
    }
  }

  async create(data: Partial<SectorRF>): Promise<SectorRF | null> {
    try {
      const response = await apiService.post<{ success: boolean; sector: SectorRF }>(
        '/rf/sectors',
        {
          sector_name: data.sector_name,
          tower_lat: data.tower_lat,
          tower_lng: data.tower_lng,
          azimuth: data.azimuth,
          beamwidth: data.beamwidth,
          radius: data.radius,
          frequency: data.frequency,
          power: data.power,
          antenna_height: data.antenna_height,
          antenna_type: data.antenna_type,
          fill_color: data.fill_color,
          stroke_color: data.stroke_color,
          opacity: data.opacity,
          region_id: data.region_id,
          properties: data.properties,
          notes: data.notes,
          is_saved: true
        }
      );
      return response.data.sector || null;
    } catch (error) {
      console.error('Error creating RF sector:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<SectorRF>): Promise<boolean> {
    try {
      await apiService.put(`/rf/sectors/${id}`, data);
      return true;
    } catch (error) {
      console.error('Error updating RF sector:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/rf/sectors/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting RF sector:', error);
      return false;
    }
  }

  async calculateCoverage(id: number): Promise<any> {
    try {
      const response = await apiService.post(`/rf/sectors/${id}/calculate`);
      return response.data;
    } catch (error) {
      console.error('Error calculating RF coverage:', error);
      return null;
    }
  }
}

