
import { INDIAN_STATES, INDIAN_STATES_MAP } from './constants';

/**
 * Filter features based on user regions
 */
export const filterFeaturesByUserRegions = (
  features: any[],
  userRegions: string[]
): any[] => {
  // If user is admin (has all regions), return all features
  if (userRegions.length === INDIAN_STATES.length) {
    return features;
  }

  // Filter features to only show assigned regions
  return features.filter(feature => {
    const stateName = feature.properties?.NAME_1 ||
                     feature.properties?.ST_NM ||
                     feature.properties?.st_nm ||  // Lowercase variant
                     feature.properties?.name;

    if (!stateName) return false;

    // Check if this state is in user's assigned regions
    return userRegions.some(region => {
      const mappedRegion = INDIAN_STATES_MAP[region];
      return stateName.includes(mappedRegion) ||
             mappedRegion.includes(stateName) ||
             stateName === region;
    });
  });
};

/**
 * Get bounds for assigned regions
 */
export const getAssignedRegionsBounds = (
  assignedRegions: string[]
): google.maps.LatLngBounds | null => {
  // Approximate coordinates for major Indian states
  const stateCoordinates: Record<string, { lat: number; lng: number }> = {
    'Maharashtra': { lat: 19.7515, lng: 75.7139 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Karnataka': { lat: 15.3173, lng: 75.7139 },
    'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
    'Gujarat': { lat: 22.2587, lng: 71.1924 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179 },
    'West Bengal': { lat: 22.9868, lng: 87.8550 },
    'Telangana': { lat: 18.1124, lng: 79.0193 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Haryana': { lat: 29.0588, lng: 76.0856 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
    'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
    'Assam': { lat: 26.2006, lng: 92.9376 },
    'Jharkhand': { lat: 23.6102, lng: 85.2799 },
    'Odisha': { lat: 20.9517, lng: 85.0985 },
    'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
  };

  if (assignedRegions.length === 0) return null;

  const bounds = new google.maps.LatLngBounds();

  assignedRegions.forEach(region => {
    const coords = stateCoordinates[region];
    if (coords) {
      bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
    }
  });

  return bounds;
};

/**
 * Detect which Indian state/UT contains a point using GeoJSON polygon data
 * Uses a more robust point-in-polygon check with fallback to nearest state
 * @param lat Latitude
 * @param lng Longitude
 * @returns State/UT name or null if not found
 */
export const detectStateFromCoordinates = (lat: number, lng: number): string | null => {
  // Check if india.json is loaded in window
  if (!(window as any).indiaGeoJson || !(window as any).indiaGeoJson.features) {
    console.error('❌ India GeoJSON not loaded yet. Make sure loadIndiaBoundary() completed successfully.');
    return null;
  }

  const geoJson = (window as any).indiaGeoJson;
  const point = new google.maps.LatLng(lat, lng);

  let nearestState: { name: string; distance: number } | null = null;
  let checkedStates: string[] = [];

  // Check each state/UT polygon
  for (const feature of geoJson.features) {
    const stateName = feature.properties?.NAME_1 ||
                     feature.properties?.ST_NM ||
                     feature.properties?.st_nm ||  // Lowercase variant
                     feature.properties?.name;

    if (!stateName) {
      console.warn('⚠️ Found feature without name property:', feature.properties);
      continue;
    }

    checkedStates.push(stateName);

    // Handle Polygon geometry
    if (feature.geometry.type === 'Polygon') {
      // Get all rings (outer + holes)
      const rings = feature.geometry.coordinates;

      // For point-in-polygon, we only need the outer ring (first one)
      const outerRing = rings[0];
      const coordinates = outerRing.map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      const polygon = new google.maps.Polygon({ paths: coordinates });

      if (google.maps.geometry.poly.containsLocation(point, polygon)) {
        return stateName;
      }

      // Calculate distance to polygon center for fallback
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord: { lat: number; lng: number }) => bounds.extend(new google.maps.LatLng(coord.lat, coord.lng)));
      const center = bounds.getCenter();
      const distance = google.maps.geometry.spherical.computeDistanceBetween(point, center);

      if (!nearestState || distance < nearestState.distance) {
        nearestState = { name: stateName, distance };
      }
    }

    // Handle MultiPolygon geometry (states with multiple regions)
    else if (feature.geometry.type === 'MultiPolygon') {
      for (const polygonRings of feature.geometry.coordinates) {
        // Get outer ring of this polygon
        const outerRing = polygonRings[0];
        const coordinates = outerRing.map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const polygon = new google.maps.Polygon({ paths: coordinates });

        if (google.maps.geometry.poly.containsLocation(point, polygon)) {
          return stateName;
        }

        // Calculate distance to polygon center for fallback
        const bounds = new google.maps.LatLngBounds();
        coordinates.forEach((coord: { lat: number; lng: number }) => bounds.extend(new google.maps.LatLng(coord.lat, coord.lng)));
        const center = bounds.getCenter();
        const distance = google.maps.geometry.spherical.computeDistanceBetween(point, center);

        if (!nearestState || distance < nearestState.distance) {
          nearestState = { name: stateName, distance };
        }
      }
    }
  }

  // If no exact match found, use nearest state as fallback (if within reasonable distance)
  if (nearestState) {
    if (nearestState.distance < 50000) { // Within 50km
      console.warn('No exact match found. Using nearest state: ' + nearestState.name + ' (' + Math.round(nearestState.distance / 1000) + 'km away)');
      return nearestState.name;
    }
  }

  console.error('No state found for coordinates (' + lat + ', ' + lng + ') - might be outside India');
  console.error('   Checked ' + checkedStates.length + ' states, nearest was ' + (nearestState ? nearestState.name + ' (' + Math.round(nearestState.distance / 1000) + 'km)' : 'none'));
  return null;
};

