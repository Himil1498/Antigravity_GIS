import type { SearchResult, SearchType, SearchSource } from './types';

/**
 * Parsers for infrastructure search results.
 */
export const parseInfrastructure = (item: any): SearchResult | null => {
  // Check for separate lat/lng fields first (backend format)
  let location: { lat: number; lng: number };

  if (item.latitude !== undefined && item.longitude !== undefined) {
    location = {
      lat: parseFloat(item.latitude.toString()),
      lng: parseFloat(item.longitude.toString()),
    };
  }
  // Fallback to coordinates object
  else if (item.coordinates && typeof item.coordinates === 'object') {
    location = {
      lat: parseFloat(item.coordinates.lat.toString()),
      lng: parseFloat(item.coordinates.lng.toString()),
    };
  }
  // Fallback to location object (localStorage sometimes)
  else if (item.location && typeof item.location === 'object') {
    location = {
      lat: parseFloat(item.location.lat.toString()),
      lng: parseFloat(item.location.lng.toString()),
    };
  } else {
    // console.warn("⚠️ Infrastructure missing coordinates:", item);
    return null;
  }

  // Validate coordinates
  if (isNaN(location.lat) || isNaN(location.lng)) {
    return null;
  }

  // Format address
  let addressStr = '';
  if (item.address_street || item.address_city || item.address_state) {
    addressStr = [
      item.address_street,
      item.address_city,
      item.address_state,
      item.address_pincode,
    ]
      .filter(Boolean)
      .join(', ');
  } else if (item.address && typeof item.address === 'object') {
    // LocalStorage format
    addressStr = [
      item.address.street,
      item.address.city,
      item.address.state,
      item.address.pincode,
    ]
      .filter(Boolean)
      .join(', ');
  } else {
    addressStr = item.address || item.notes || '';
  }

  return {
    id: item.id?.toString() || `infra_${Date.now()}_${Math.random()}`,
    name: item.item_name || item.name || 'Infrastructure',
    type: 'savedData' as SearchType,
    location,
    address: addressStr,
    data: {
      ...item,
      type: 'Infrastructure',
      coordinates: location,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    },
    source: 'saved' as SearchSource,
  };
};



