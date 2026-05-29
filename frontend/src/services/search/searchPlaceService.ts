
import { calculateDistance } from './utils';
import { SearchResult, SearchType, SearchSource } from './types';

/**
 * Search for places using Google Places API (with fallback)
 */
export const searchPlaces = async (query: string, map: google.maps.Map): Promise<SearchResult[]> => {
  try {
    // Try new Places API first
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.location,places.id,places.types"
          },
          body: JSON.stringify({
            textQuery: `${query} India`,
            regionCode: "IN",
            maxResultCount: 10
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          const searchResults: SearchResult[] = data.places.map(
            (place: any) => {
              const location = {
                lat: place.location.latitude,
                lng: place.location.longitude
              };

              const center = map.getCenter();
              const distance = center
                ? calculateDistance(
                    { lat: center.lat(), lng: center.lng() },
                    location
                  )
                : undefined;

              return {
                id: place.id,
                name: place.displayName?.text || "Unknown Place",
                type: "place" as SearchType,
                location,
                address: place.formattedAddress || "",
                placeId: place.id,
                source: "places" as SearchSource,
                distance
              };
            }
          );

          return searchResults.sort(
            (a, b) => (a.distance || 0) - (b.distance || 0)
          );
        }
      }
    }
  } catch (error) {
    console.error("Places API error, using Geocoding fallback:", error);
  }

  // Fallback to Geocoding API
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        address: `${query}, India`,
        componentRestrictions: { country: "IN" }
      },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const searchResults: SearchResult[] = results
            .slice(0, 10)
            .map((result) => {
              const location = {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              };

              const center = map.getCenter();
              const distance = center
                ? calculateDistance(
                    { lat: center.lat(), lng: center.lng() },
                    location
                  )
                : undefined;

              return {
                id:
                  result.place_id || `geocode_${Date.now()}_${Math.random()}`,
                name:
                  result.address_components[0]?.long_name ||
                  result.formatted_address.split(",")[0],
                type: "place" as SearchType,
                location,
                address: result.formatted_address,
                placeId: result.place_id,
                source: "places" as SearchSource,
                distance
              };
            })
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));

          resolve(searchResults);
        } else {
          resolve([]);
        }
      }
    );
  });
};

