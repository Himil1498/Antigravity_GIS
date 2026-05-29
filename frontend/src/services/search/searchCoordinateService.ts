
import { parseCoordinates } from './utils';
import { SearchResult } from './types';

/**
 * Search for coordinates
 */
export const searchCoordinates = async (query: string): Promise<SearchResult[]> => {
  const parsed = parseCoordinates(query);
  if (!parsed) {
    return [];
  }

  const { lat, lng } = parsed;

  // Get place name via reverse geocoding
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        resolve([
          {
            id: `coord_${Date.now()}`,
            name:
              results[0].formatted_address ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            type: "coordinates",
            location: { lat, lng },
            address: results[0].formatted_address,
            placeId: results[0].place_id,
            source: "coordinates"
          }
        ]);
      } else {
        // Return coordinate without address
        resolve([
          {
            id: `coord_${Date.now()}`,
            name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            type: "coordinates",
            location: { lat, lng },
            source: "coordinates"
          }
        ]);
      }
    });
  });
};

