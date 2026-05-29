import { apiService } from '../api/index';
import { DistanceMeasurementService } from './distanceMeasurementService';
import { PolygonDrawingService } from './polygonDrawingService';
import { CircleDrawingService } from './circleDrawingService';
import { SectorRFService } from './sectorRFService';
import { ElevationProfileService } from './elevationProfileService';
import { InventoryService } from './inventoryService';
import {
  GISToolsFilters,
  DistanceMeasurement,
  PolygonDrawing,
  CircleDrawing,
  SectorRF,
  ElevationProfile,
  Infrastructure
} from './types';

export class GISToolsService {
  distanceMeasurements = new DistanceMeasurementService();
  polygonDrawings = new PolygonDrawingService();
  circleDrawings = new CircleDrawingService();
  sectorRF = new SectorRFService();
  elevationProfiles = new ElevationProfileService();
  inventory = new InventoryService();

  /**
   * Get all GIS data for a user (for Data Hub)
   * Admin/Manager can specify userId to see other users' data
   */
  async getAllUserData(filters?: GISToolsFilters) {
    try {
      const [distances, polygons, circles, sectors, elevations, infrastructures] = await Promise.all([
        this.distanceMeasurements.getAll(filters),
        this.polygonDrawings.getAll(filters),
        this.circleDrawings.getAll(filters),
        this.sectorRF.getAll(filters),
        this.elevationProfiles.getAll(filters),
        this.inventory.getAll(filters)
      ]);

      return {
        distanceMeasurements: distances,
        polygonDrawings: polygons,
        circleDrawings: circles,
        sectorRF: sectors,
        elevationProfiles: elevations,
        infrastructure: infrastructures,
        total: distances.length + polygons.length + circles.length + sectors.length + elevations.length + infrastructures.length
      };
    } catch (error) {
      console.error('Error fetching all user GIS data:', error);
      return {
        distanceMeasurements: [],
        polygonDrawings: [],
        circleDrawings: [],
        sectorRF: [],
        elevationProfiles: [],
        infrastructure: [],
        total: 0
      };
    }
  }

  /**
   * Aggregated fetch via /datahub/all
   * Returns the same structure as getAllUserData but in a single request.
   */
  async getAllAggregated(filters?: GISToolsFilters) {
    try {
      const params: Record<string, any> = {};
      if (filters?.userId !== undefined) {
        if (filters.userId === 'all') {
          params.filter = 'all';
        } else if (filters.userId === 'me') {
          // no explicit filter needed; backend defaults to current user
        } else {
          params.filter = 'user';
          params.userId = filters.userId;
        }
      }
      if (filters?.regionId) params.regionId = filters.regionId;
      if (filters?.limit) params.limit = filters.limit;

      const resp = await apiService.get<{
        success: boolean;
        data: {
          distances: any[];
          polygons: any[];
          circles: any[];
          elevations: any[];
          infrastructures: any[];
          sectors: any[];
        }
      }>(
        '/datahub/all',
        { params }
      );

      const responseData = resp.data.data || {} as any;

      const safeParse = (str: any) => {
        if (typeof str !== 'string') return str;
        try {
          return JSON.parse(str);
        } catch (e) {
          console.error('JSON parse error in GIS data mapping:', e, 'Raw string:', str);
          return [];
        }
      };

      // Process distances from backend response
      const distanceMeasurements: DistanceMeasurement[] = (responseData.distances || []).map((item: any) => ({
        ...item,
        user_id: item.user_id || item.created_by, // Normalize owner ID
        points: safeParse(item.points),
        total_distance: Number(item.total_distance || item.distance_meters || 0),
        unit: item.unit || 'meters',
        elevation_data: safeParse(item.elevation_data),
        min_elevation: item.min_elevation !== null && item.min_elevation !== undefined ? Number(item.min_elevation) : undefined,
        max_elevation: item.max_elevation !== null && item.max_elevation !== undefined ? Number(item.max_elevation) : undefined,
        elevation_gain: item.elevation_gain !== null && item.elevation_gain !== undefined ? Number(item.elevation_gain) : undefined,
        elevation_loss: item.elevation_loss !== null && item.elevation_loss !== undefined ? Number(item.elevation_loss) : undefined,
      }));

      // Process polygons from backend response
      const polygonDrawings: PolygonDrawing[] = (responseData.polygons || []).map((item: any) => ({
        ...item,
        user_id: item.user_id || item.created_by, // Normalize owner ID
        coordinates: safeParse(item.coordinates),
        area: item.area !== null && item.area !== undefined ? Number(item.area) : undefined,
        perimeter: item.perimeter !== null && item.perimeter !== undefined ? Number(item.perimeter) : undefined,
      }));

      // Process circles from backend response
      const circleDrawings: CircleDrawing[] = (responseData.circles || []).map((item: any) => ({
        ...item,
        user_id: item.user_id || item.created_by, // Normalize owner ID
        center_lat: Number(item.center_lat),
        center_lng: Number(item.center_lng),
        radius: Number(item.radius || item.radius_meters || 0),
      }));

      // Process sectors from backend response
      const sectorRF: SectorRF[] = (responseData.sectors || []).map((item: any) => ({
        ...item,
        user_id: item.user_id || item.created_by, // Normalize owner ID
        tower_lat: Number(item.tower_lat || item.center_lat || 0),
        tower_lng: Number(item.tower_lng || item.center_lng || 0),
        azimuth: Number(item.azimuth || item.start_angle || 0),
        beamwidth: Number(item.beamwidth || (item.end_angle - item.start_angle) || 0),
        radius: Number(item.radius || item.radius_meters || 0),
        frequency: item.frequency !== null && item.frequency !== undefined ? Number(item.frequency) : item.frequency,
      }));



      // Process elevations from backend response
      const elevationProfiles: ElevationProfile[] = (responseData.elevations || []).map((item: any) => ({
        ...item,
        user_id: item.user_id || item.created_by, // Normalize owner ID
        start_point: safeParse(item.start_point),
        end_point: safeParse(item.end_point),
        elevation_data: safeParse(item.elevation_data),
        total_distance: Number(item.total_distance || 0),
        max_elevation: Number(item.max_elevation || 0),
        min_elevation: Number(item.min_elevation || 0),
      }));

      // Process infrastructure from backend response
      const infrastructure: Infrastructure[] = (responseData.infrastructures || []).map((item: any) => ({
        ...item,
        latitude: Number(item.latitude || 0),
        longitude: Number(item.longitude || 0),
        properties: safeParse(item.properties),
      }));

      return {
        distanceMeasurements,
        polygonDrawings,
        circleDrawings,
        sectorRF,
        elevationProfiles,
        infrastructure,
        total: distanceMeasurements.length + polygonDrawings.length + circleDrawings.length + sectorRF.length + elevationProfiles.length + infrastructure.length
      };
    } catch (error) {
      console.error('Error fetching aggregated GIS data:', error);
      return {
        distanceMeasurements: [],
        polygonDrawings: [],
        circleDrawings: [],
        sectorRF: [],
        elevationProfiles: [],
        infrastructure: [],
        total: 0
      };
    }
  }

  /**
   * Get summary statistics for Data Hub
   */
  async getStatistics(filters?: GISToolsFilters) {
    const data = await this.getAllUserData(filters);

    return {
      totalItems: data.total,
      distanceMeasurements: data.distanceMeasurements.length,
      polygonDrawings: data.polygonDrawings.length,
      circleDrawings: data.circleDrawings.length,
      sectorRF: data.sectorRF.length,
      elevationProfiles: data.elevationProfiles.length,
      infrastructure: data.infrastructure.length
    };
  }
}
