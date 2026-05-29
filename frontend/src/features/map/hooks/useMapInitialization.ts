import { useRef, useEffect, useState } from "react";
import { useGoogleMaps } from "../../../contexts/GoogleMapsContext";
import { MAPS_CONFIG } from "../../../contexts/GoogleMapsContextTypes";
import { useAppDispatch, useAppSelector } from "../../../store/index";
import {
  setMapInstance,
  setUserPreferences as setReduxUserPreferences,
} from "../../../store/slices/mapSlice";
import { addNotification } from "../../../store/slices/ui/index";
import { BoundarySettings } from "../types/index";
import { useTheme } from "../../../contexts/ThemeContext";
import { darkMapStyle } from "../utils/mapStyles";

export const useMapInitialization = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError, createMap } = useGoogleMaps();
  const { mapInstance, userPreferences: cachedPreferences } = useAppSelector(
    (state) => state.map,
  );
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const activeMapIdRef = useRef<string | null>(null);

  // Store loaded user preferences for the MapSettings modal
  const [userPreferences, setUserPreferences] =
    useState<any>(cachedPreferences);
  const [preferencesLoaded, setPreferencesLoaded] =
    useState(!!cachedPreferences);
  const [boundarySettings, setBoundarySettings] = useState<BoundarySettings>({
    enabled: false,
    color: "#3B82F6",
    opacity: 0.5,
    dimWhenToolActive: true,
    dimmedOpacity: 0.2,
  });

  // Load user map preferences from database
  useEffect(() => {
    // If we already have preferences from Redux, verify boundary settings and skip fetch
    if (cachedPreferences) {
      // Sync local state with Redux cache (handles updates from MapBoundarySettings save)
      setUserPreferences(cachedPreferences);
      if (cachedPreferences.preferences?.boundary) {
        setBoundarySettings((prev) => ({
          ...prev,
          ...cachedPreferences.preferences.boundary,
        }));
      }
      setPreferencesLoaded(true);
      return;
    }

    const loadUserPreferences = async () => {
      try {
        const userMapPreferencesService =
          await import("../../../services/user/userMapPreferencesService");
        const prefs =
          await userMapPreferencesService.default.getUserPreferences();

        setUserPreferences(prefs);
        
        // Prevent infinite loop by checking if prefs changed before dispatching
        if (JSON.stringify(prefs) !== JSON.stringify(cachedPreferences)) {
          dispatch(setReduxUserPreferences(prefs)); // Cache in Redux
        }

        // Apply preferences to boundary settings if available
        if (prefs.preferences?.boundary) {
          setBoundarySettings((prev) => ({
            ...prev,
            ...prefs.preferences.boundary,
          }));
        }

        // console.log("✅ User preferences loaded successfully");
      } catch (error) {
        console.warn("⚠️ Failed to load user preferences:", error);
      } finally {
        // Mark preferences as loaded (even if there was an error)
        setPreferencesLoaded(true);
      }
    };

    if (!preferencesLoaded) {
      loadUserPreferences();
    }
  }, [cachedPreferences, dispatch]);

  // Check for saved boundary settings in localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("mapBoundarySettings");
    if (savedSettings) {
      try {
        setBoundarySettings((prev) => ({
          ...prev,
          ...JSON.parse(savedSettings),
        }));
      } catch (error) {
        console.error("Failed to load boundary settings:", error);
      }
    }
  }, []);

  // Map Creation Effect
  useEffect(() => {
    // Don't create map until preferences are loaded
    if (!preferencesLoaded) {
      return;
    }

    if (isLoaded && mapContainerRef.current && window.google) {
      const expectedThemeKey = isDarkMode ? 'dark' : 'light';
      // Check if map needs recreation (either no map, or the theme has changed)
      const needsRecreation = !mapInstance || activeMapIdRef.current !== expectedThemeKey;

      if (needsRecreation) {
        activeMapIdRef.current = expectedThemeKey;
        // Prepare custom map options from user preferences and active theme
        const customOptions: Partial<google.maps.MapOptions> = {
          styles: isDarkMode ? darkMapStyle : [],
          mapId: MAPS_CONFIG.mapId,
          colorScheme: isDarkMode ? 'DARK' : 'LIGHT'
        };

        if (
          userPreferences &&
          window.google &&
          window.google.maps &&
          window.google.maps.MapTypeId
        ) {
          // Apply default map type
          if (userPreferences.default_map_type) {
            const mapTypeMap: Record<string, google.maps.MapTypeId> = {
              roadmap: google.maps.MapTypeId.ROADMAP,
              satellite: google.maps.MapTypeId.SATELLITE,
              hybrid: google.maps.MapTypeId.HYBRID,
              terrain: google.maps.MapTypeId.TERRAIN,
            };
            customOptions.mapTypeId =
              mapTypeMap[userPreferences.default_map_type] ||
              google.maps.MapTypeId.SATELLITE;
          }

          // Apply default zoom level
          if (userPreferences.default_zoom) {
            customOptions.zoom = userPreferences.default_zoom;
          }

          // Apply default center position
          if (userPreferences.default_center) {
            try {
              const center =
                typeof userPreferences.default_center === "string"
                  ? JSON.parse(userPreferences.default_center)
                  : userPreferences.default_center;
              customOptions.center = center;
            } catch (e) {
              console.warn("Failed to parse default_center:", e);
            }
          }
        }

        // Create map with user preferences or defaults
        const map = createMap(mapContainerRef.current!, customOptions);

        // If no preferences were applied, fit to India bounds after map is created
        if (
          map &&
          (!userPreferences ||
            (!userPreferences.default_center && !userPreferences.default_zoom))
        ) {
          setTimeout(() => {
            const indiaBounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(7.0, 68.5),
              new google.maps.LatLng(35.0, 97.0),
            );
            map.fitBounds(indiaBounds);
          }, 200);
        }

        if (map) {
          dispatch(
            addNotification({
              type: "success",
              title: "Map Loaded",
              message: "Google Maps loaded - All tools ready in India",
              autoClose: true,
              duration: 3000,
            }),
          );
        }
      }
    }
  }, [
    isLoaded,
    mapInstance,
    createMap,
    dispatch,
    userPreferences,
    preferencesLoaded,
    isDarkMode, // Important: must depend on isDarkMode to recreate map on theme change
  ]);

  // Re-apply preferences after map (re)creation — ensures tab-switch and login both work
  const prefsAppliedMapRef = useRef<google.maps.Map | null>(null);
  useEffect(() => {
    if (!mapInstance || !userPreferences) return;
    // Only apply once per map instance
    if (prefsAppliedMapRef.current === mapInstance) return;
    prefsAppliedMapRef.current = mapInstance;

    if (window.google?.maps?.MapTypeId) {
      // Apply map type
      if (userPreferences.default_map_type) {
        const mapTypeMap: Record<string, google.maps.MapTypeId> = {
          roadmap: google.maps.MapTypeId.ROADMAP,
          satellite: google.maps.MapTypeId.SATELLITE,
          hybrid: google.maps.MapTypeId.HYBRID,
          terrain: google.maps.MapTypeId.TERRAIN,
        };
        mapInstance.setMapTypeId(
          mapTypeMap[userPreferences.default_map_type] ||
            google.maps.MapTypeId.SATELLITE,
        );
      }

      // Apply center
      if (userPreferences.default_center) {
        try {
          const center =
            typeof userPreferences.default_center === "string"
              ? JSON.parse(userPreferences.default_center)
              : userPreferences.default_center;
          if (center?.lat !== undefined && center?.lng !== undefined) {
            mapInstance.setCenter(center);
          }
        } catch (e) {
          // ignore
        }
      }

      // Apply zoom
      if (userPreferences.default_zoom) {
        mapInstance.setZoom(userPreferences.default_zoom);
      }
    }
  }, [mapInstance, userPreferences]);

  // Handle Resize Validation
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstance) return;

    const observer = new ResizeObserver(() => {
      if (window.google?.maps && mapInstance) {
        window.google.maps.event.trigger(mapInstance, "resize");
      }
    });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapInstance]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstance) {
        dispatch(setMapInstance(null));
      }
    };
  }, [mapInstance, dispatch]);

  // Dynamic Dark Mode Styling
  useEffect(() => {
    if (mapInstance && window.google) {
      if (isDarkMode) {
        mapInstance.setOptions({ styles: darkMapStyle });
      } else {
        mapInstance.setOptions({ styles: [] }); // Reset to default light mode
      }
    }
  }, [mapInstance, isDarkMode]);

  return {
    mapContainerRef,
    mapInstance,
    isLoaded,
    loadError,
    boundarySettings,
    setBoundarySettings,
    userPreferences,
    setUserPreferences,
  };
};

