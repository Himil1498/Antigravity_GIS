
import { SearchQuery, SearchResult, SearchType, SearchSource } from "./types";
import { searchCoordinates } from "./searchCoordinateService";
import { searchPlaces } from "./searchPlaceService";
import { searchSavedDataBackend } from "./searchBackendService";
import { searchSavedDataLocalStorage } from "./searchLocalStorageService";

/**
 * Search Service - WITH BACKEND INTEGRATION
 * Handles all search operations: places, coordinates, saved data
 */
export class SearchService {
  private map: google.maps.Map;
  private placesService: google.maps.places.PlacesService;
  private userId?: number; // Optional userId for admin/manager search filtering

  constructor(map: google.maps.Map) {
    this.map = map;
    this.placesService = new google.maps.places.PlacesService(map);
  }

  /**
   * Set user ID for searching other users' data (admin/manager only)
   */
  setUserId(userId?: number) {
    this.userId = userId;
  }

  /**
   * Main search function - determines type and routes to appropriate handler
   */
  async search(query: string, type?: SearchType): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmedQuery = query.trim();

    // Auto-detect type if not specified
    if (!type) {
      type = this.detectSearchType(trimmedQuery);
    }

    switch (type) {
      case "coordinates":
        return searchCoordinates(trimmedQuery);
      case "place":
        return searchPlaces(trimmedQuery, this.map);
      case "savedData":
        return this.searchSavedData(trimmedQuery);
      default:
        return this.searchAll(trimmedQuery);
    }
  }

  /**
   * Auto-detect search type from query pattern
   */
  private detectSearchType(query: string): SearchType {
    // Check if it's coordinates
    const coordPatterns = [
      /^-?\d+\.?\d*[,\s]+-?\d+\.?\d*$/, // Decimal
      /^-?\d+\.?\d*°?\s*[NS][,\s]+-?\d+\.?\d*°?\s*[EW]$/i, // Degrees
      /^\d+°\d+'[\d.]+"\s*[NS]\s+\d+°\d+'[\d.]+"\s*[EW]$/i, // DMS
      /@-?\d+\.?\d*,-?\d+\.?\d*/ // URL
    ];

    for (const pattern of coordPatterns) {
      if (pattern.test(query)) {
        return "coordinates";
      }
    }

    // Default to place search
    return "place";
  }

  /**
   * Search through saved GIS data
   */
  private async searchSavedData(query: string): Promise<SearchResult[]> {
    try {
      return await searchSavedDataBackend(query, this.userId);
    } catch (error) {
       console.error("Backend search failed, fallback to local storage", error);
       return searchSavedDataLocalStorage(query);
    }
  }

  /**
   * Search across all sources
   */
  private async searchAll(query: string): Promise<SearchResult[]> {
    const [places, saved] = await Promise.all([
      searchPlaces(query, this.map), // Use extracted service
      this.searchSavedData(query)
    ]);

    // Combine and deduplicate results
    const allResults = [...places, ...saved];

    // Sort by relevance (places first, then by distance if available)
    return allResults.sort((a, b) => {
      if (a.source === "places" && b.source !== "places") return -1;
      if (a.source !== "places" && b.source === "places") return 1;
      return (a.distance || Infinity) - (b.distance || Infinity);
    });
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(
    placeId: string
  ): Promise<google.maps.places.PlaceResult | null> {
    return new Promise((resolve) => {
      this.placesService.getDetails(
        {
          placeId: placeId,
          fields: [
            "name",
            "formatted_address",
            "geometry",
            "photos",
            "rating",
            "opening_hours",
            "website",
            "formatted_phone_number"
          ]
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            resolve(place);
          } else {
            resolve(null);
          }
        }
      );
    });
  }
}

