import type { SearchResult, SearchType, SearchSource } from './types';

/**
 * Parsers for measurement, polygon, circle, elevation, and sector results.
 */
export const parseDistanceMeasurement = (item: any): SearchResult => {
  let points = [];
  try {
    points =
      typeof item.points === 'string'
        ? JSON.parse(item.points)
        : item.points || [];
  } catch (e) {
    console.error('Failed to parse measurement points:', e);
  }

  let elevationData = null;
  try {
    elevationData =
      typeof item.elevation_data === 'string'
        ? JSON.parse(item.elevation_data)
        : item.elevation_data || item.elevationData || null;
  } catch (e) {
    console.error('Failed to parse elevation_data:', e);
  }

  const location = points.length > 0 ? points[0] : { lat: 0, lng: 0 };
  const distanceVal = item.total_distance || item.totalDistance || 0;

  return {
    id: item.id?.toString() || `dist_${Date.now()}_${Math.random()}`,
    name: item.name || item.measurement_name || 'Distance Measurement',
    type: 'savedData' as SearchType,
    location,
    address: `Distance: ${distanceVal}m`,
    data: {
      ...item,
      type: 'Distance',
      points: points,
      totalDistance: distanceVal,
      elevation_data: elevationData,
      max_elevation:
        item.max_elevation || item.maxElevation
          ? Number(item.max_elevation || item.maxElevation)
          : undefined,
      min_elevation:
        item.min_elevation || item.minElevation
          ? Number(item.min_elevation || item.minElevation)
          : undefined,
      elevation_gain:
        item.elevation_gain || item.elevationGain
          ? Number(item.elevation_gain || item.elevationGain)
          : undefined,
      elevation_loss:
        item.elevation_loss || item.elevationLoss
          ? Number(item.elevation_loss || item.elevationLoss)
          : undefined,
    },
    source: 'saved' as SearchSource,
  };
};

export const parsePolygon = (item: any): SearchResult => {
  let vertices = [];
  try {
    vertices =
      typeof item.vertices === 'string'
        ? JSON.parse(item.vertices)
        : item.vertices || item.path || [];
  } catch (e) {
    console.error('Failed to parse polygon vertices:', e);
  }

  let location = { lat: 0, lng: 0 };
  if (vertices.length > 0) {
    let latSum = 0,
      lngSum = 0;
    vertices.forEach((v: any) => {
      latSum += v.lat;
      lngSum += v.lng;
    });
    location = {
      lat: latSum / vertices.length,
      lng: lngSum / vertices.length,
    };
  }

  return {
    id: item.id?.toString() || `poly_${Date.now()}_${Math.random()}`,
    name: item.name || item.polygon_name || 'Polygon',
    type: 'savedData' as SearchType,
    location,
    address: `Polygon: ${item.area || 0}m²`,
    data: {
      ...item,
      type: 'Polygon',
      vertices: vertices,
    },
    source: 'saved' as SearchSource,
  };
};

export const parseCircle = (item: any): SearchResult => {
  let center = { lat: 0, lng: 0 };
  try {
    center =
      typeof item.center === 'string'
        ? JSON.parse(item.center)
        : item.center || { lat: 0, lng: 0 };
  } catch (e) {
    console.error('Failed to parse circle center:', e);
  }

  return {
    id: item.id?.toString() || `circle_${Date.now()}_${Math.random()}`,
    name: item.name || item.circle_name || 'Circle',
    type: 'savedData' as SearchType,
    location: center,
    address: `Circle: ${item.radius || 0}m radius`,
    data: {
      ...item,
      type: 'Circle',
      center: center,
    },
    source: 'saved' as SearchSource,
  };
};

export const parseElevationProfile = (item: any): SearchResult => {
  let points = [];
  try {
    points =
      typeof item.points === 'string'
        ? JSON.parse(item.points)
        : item.points || [];
  } catch (e) {
    console.error('Failed to parse elevation points:', e);
  }

  let elevationData = null;
  try {
    elevationData =
      typeof item.elevation_data === 'string'
        ? JSON.parse(item.elevation_data)
        : item.elevation_data || null;
  } catch (e) {
    console.error('Failed to parse elevation_data:', e);
  }

  let startPoint = null;
  try {
    startPoint =
      typeof item.start_point === 'string'
        ? JSON.parse(item.start_point)
        : item.start_point || (points.length > 0 ? points[0] : null);
  } catch (e) {
    console.error('Failed to parse start_point:', e);
  }

  let endPoint = null;
  try {
    endPoint =
      typeof item.end_point === 'string'
        ? JSON.parse(item.end_point)
        : item.end_point ||
          (points.length > 1 ? points[points.length - 1] : null);
  } catch (e) {
    console.error('Failed to parse end_point:', e);
  }

  let highPoint = null;
  if (item.highPoint || item.high_point) {
    try {
      const highPointData = item.highPoint || item.high_point;
      highPoint =
        typeof highPointData === 'string'
          ? JSON.parse(highPointData)
          : highPointData;
    } catch (e) {
      console.error('Failed to parse highPoint:', e);
    }
  }

  let lowPoint = null;
  if (item.lowPoint || item.low_point) {
    try {
      const lowPointData = item.lowPoint || item.low_point;
      lowPoint =
        typeof lowPointData === 'string'
          ? JSON.parse(lowPointData)
          : lowPointData;
    } catch (e) {
      console.error('Failed to parse lowPoint:', e);
    }
  }

  const location =
    startPoint || (points.length > 0 ? points[0] : { lat: 0, lng: 0 });

  return {
    id: item.id?.toString() || `elev_${Date.now()}_${Math.random()}`,
    name: item.name || item.profile_name || 'Elevation Profile',
    type: 'savedData' as SearchType,
    location,
    address: 'Elevation Profile',
    data: {
      ...item,
      type: 'Elevation',
      points: points,
      elevation_data: elevationData,
      start_point: startPoint,
      end_point: endPoint,
      highPoint: highPoint,
      lowPoint: lowPoint,
    },
    source: 'saved' as SearchSource,
  };
};

export const parseSector = (item: any): SearchResult => {
  let center = { lat: 0, lng: 0 };
  try {
    center =
      typeof item.center === 'string'
        ? JSON.parse(item.center)
        : item.center || { lat: 0, lng: 0 };
  } catch (e) {
    console.error('Failed to parse sector center:', e);
  }

  return {
    id: item.id?.toString() || `sector_${Date.now()}_${Math.random()}`,
    name: item.name || item.sector_name || 'Sector',
    type: 'savedData' as SearchType,
    location: center,
    address: `Sector: ${item.radius || 0}m`,
    data: {
      ...item,
      type: 'Sector',
      center: center,
    },
    source: 'saved' as SearchSource,
  };
};



