import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/index";
import { setMapInstance, setViewport } from "../store/slices/mapSlice";
import { addNotification } from "../store/slices/ui/index";
import { loadIndiaBoundary } from "../utils/indiaBoundary/index";
import {
  GoogleMapsContextType,
  GoogleMapsProviderProps,
  MAPS_CONFIG,
  getDefaultMapOptions,
} from "./GoogleMapsContextTypes";

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined,
);

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { mapInstance } = useAppSelector((state) => state.map);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
          } else {
            // Script exists but object not ready? Wait a bit
            let attempts = 0;
            const checkGoogle = setInterval(() => {
              attempts++;
              if (window.google && window.google.maps) {
                clearInterval(checkGoogle);
                setIsLoaded(true);
              } else if (attempts > 50) {
                // 5 seconds timeout
                clearInterval(checkGoogle);
                console.error(
                  "Google Maps script exists but window.google is missing.",
                );
                // Force reload? or set Error?
                setLoadError(
                  "Maps API script loaded but global object missing. Try refreshing.",
                );
              }
            }, 100);
          }
          return;
        }

        if (!window.google) {
          const script = document.createElement("script");
          const apiKey =
            MAPS_CONFIG.apiKey || "AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ";
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${MAPS_CONFIG.libraries.join(",")}&region=${MAPS_CONFIG.region}&language=${MAPS_CONFIG.language}&loading=async`;
          script.async = true;
          script.defer = true;
          script.id = "google-maps-script";

          script.onload = async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setIsLoaded(true);
            setLoadError(null);
            if (window.google?.maps) {
              if (window.google.maps.Geocoder)
                setGeocoder(new window.google.maps.Geocoder());
              if (window.google.maps.DirectionsService)
                setDirectionsService(
                  new window.google.maps.DirectionsService(),
                );
              try {
                await loadIndiaBoundary();
              } catch (e) {
                console.error("Failed to load India boundary:", e);
              }
            }
            dispatch(
              addNotification({
                type: "success",
                title: "Maps API Loaded",
                message: "Google Maps API has been successfully loaded",
                autoClose: true,
                duration: 3000,
              }),
            );
          };

          script.onerror = () => {
            const errorMsg =
              "Failed to load Google Maps API. Please check your API key and internet connection.";
            setLoadError(errorMsg);
            setIsLoaded(false);
            dispatch(
              addNotification({
                type: "error",
                title: "Maps Loading Error",
                message: errorMsg,
                autoClose: false,
              }),
            );
          };

          document.head.appendChild(script);
        } else {
          setIsLoaded(true);
          setLoadError(null);
          if (window.google?.maps) {
            if (window.google.maps.Geocoder)
              setGeocoder(new window.google.maps.Geocoder());
            if (window.google.maps.DirectionsService)
              setDirectionsService(new window.google.maps.DirectionsService());
            try {
              await loadIndiaBoundary();
            } catch (e) {
              console.error("Failed to load India boundary:", e);
            }
          }
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while loading Google Maps";
        setLoadError(errorMsg);
        setIsLoaded(false);
        dispatch(
          addNotification({
            type: "error",
            title: "Maps Initialization Error",
            message: errorMsg,
            autoClose: false,
          }),
        );
      }
    };
    initializeGoogleMaps();
  }, [dispatch]);

  const createMap = (
    container: HTMLElement,
    customOptions?: Partial<google.maps.MapOptions>,
  ) => {
    if (!isLoaded || !window.google) {
      console.warn("Google Maps API not loaded yet");
      return null;
    }
    try {
      const mapOptions = { ...getDefaultMapOptions(), ...customOptions };
      const map = new window.google.maps.Map(container, mapOptions);

      // Update Redux ONLY when map stops moving (idle)
      // This eliminates "Violation" warnings by removing ALL Redux overhead during drag/zoom.
      map.addListener("idle", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        if (center && zoom) {
          dispatch(
            setViewport({
              center: { lat: center.lat(), lng: center.lng() },
              zoom: zoom,
            }),
          );
        }
      });

      if (window.google.maps.places)
        setPlacesService(new window.google.maps.places.PlacesService(map));
      dispatch(setMapInstance(map));
      return map;
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to create map instance";
      dispatch(
        addNotification({
          type: "error",
          title: "Map Creation Error",
          message: errorMsg,
          autoClose: false,
        }),
      );
      return null;
    }
  };

  return (
    <GoogleMapsContext.Provider
      value={{
        isLoaded,
        loadError,
        mapInstance,
        createMap,
        geocoder,
        directionsService,
        placesService,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined)
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  return context;
};

