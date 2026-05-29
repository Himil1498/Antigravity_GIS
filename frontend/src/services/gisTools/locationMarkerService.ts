import api from "../api";

export interface MarkedLocation {
  id: number;
  name: string;
  notes: string | null;
  lat: number;
  lng: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  feasibility_data?: any;
  is_feasibility?: boolean;
  linked_file_id?: number | null;
  remarks?: string;
}

const parseFeasibilityData = (data: any) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse feasibility_data string:', e);
      return null;
    }
  }
  return data;
};

class LocationMarkerService {
  async getMarkers(onlyFeasibility = false): Promise<MarkedLocation[]> {
    const ts = Date.now();
    const response = await api.get(`/location-markers?t=${ts}${onlyFeasibility ? "&onlyFeasibility=true" : ""}`);
    const data = response.data.data;
    if (Array.isArray(data)) {
        return data.map((item: any) => ({
            ...item,
            lat: Number(item.lat),
            lng: Number(item.lng),
            feasibility_data: parseFeasibilityData(item.feasibility_data)
        }));
    }
    return [];
  }

  async saveMarker(data: { name: string; notes?: string; lat: number; lng: number, is_feasibility?: boolean, feasibility_data?: any, remarks?: string }): Promise<MarkedLocation> {
    const response = await api.post("/location-markers", data);
    const item = response.data.data;
    if (item) {
        return {
            ...item,
            lat: Number(item.lat),
            lng: Number(item.lng),
            feasibility_data: parseFeasibilityData(item.feasibility_data)
        };
    }
    return item;
  }

  async saveBulkMarkers(markers: { name: string; notes?: string; lat: number; lng: number, is_feasibility?: boolean, feasibility_data?: any, remarks?: string }[]): Promise<MarkedLocation[]> {
    const response = await api.post("/location-markers/bulk", { markers });
    const items = response.data.data;
    if (Array.isArray(items)) {
        return items.map((item: any) => ({
            ...item,
            lat: Number(item.lat),
            lng: Number(item.lng),
            feasibility_data: parseFeasibilityData(item.feasibility_data)
        }));
    }
    return [];
  }

  async updateMarker(id: number, data: { name: string; remarks?: string }): Promise<MarkedLocation> {
    const response = await api.put(`/location-markers/${id}`, data);
    const item = response.data.data;
    if (item) {
        return {
            ...item,
            lat: Number(item.lat),
            lng: Number(item.lng),
            feasibility_data: parseFeasibilityData(item.feasibility_data)
        };
    }
    return item;
  }

  async updateFeasibility(id: number, feasibilityData: any, linkedFileId?: number): Promise<MarkedLocation> {
    const response = await api.put(`/location-markers/${id}/feasibility`, { 
      feasibilityData, 
      linkedFileId 
    });
    const item = response.data.data;
    return {
        ...item,
        lat: Number(item.lat),
        lng: Number(item.lng),
        feasibility_data: parseFeasibilityData(item.feasibility_data)
    };
  }

  async deleteMarker(id: number): Promise<void> {
    await api.delete(`/location-markers/${id}`);
  }

  async deleteBulkMarkers(ids: number[]): Promise<void> {
    await api.delete(`/location-markers`, { data: { ids } });
  }
}

export const locationMarkerService = new LocationMarkerService();
