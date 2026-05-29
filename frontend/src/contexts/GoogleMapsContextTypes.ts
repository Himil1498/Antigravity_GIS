import { ReactNode } from "react";

export interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  mapInstance: any | null;
  createMap: (
    container: HTMLElement,
    customOptions?: Partial<google.maps.MapOptions>,
  ) => any;
  geocoder: any | null;
  directionsService: any | null;
  placesService: any | null;
}

export interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const MAPS_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  version: "weekly",
  libraries: ["places", "drawing", "geometry", "visualization"],
  region: "IN",
  language: "en",
  mapId: "e8aea2a23d836c7d4bd283d8", // Vector map ID (supports both Light & Dark via colorScheme)
};

export const getDefaultMapOptions = (): google.maps.MapOptions => ({
  center: { lat: 20.5937, lng: 78.9629 },
  zoom: 5,
  mapTypeId: "hybrid",
  restriction: undefined,
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: true,
  streetViewControlOptions: {
    position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM || 9,
  },
  fullscreenControl: false,
  rotateControl: false,
  panControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  gestureHandling: "greedy",
  keyboardShortcuts: false,
  clickableIcons: false,
});

declare global {
  interface Window {
    google: any;
  }
}
