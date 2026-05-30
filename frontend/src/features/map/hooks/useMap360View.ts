import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "../../../store/index";
import { addNotification } from "../../../store/slices/ui/index";
import { createOverlaysFromData } from "../../../utils/layerVisualization/index";
import { LayerState } from "../types/index";
import { useTheme } from "../../../contexts/ThemeContext";
import { darkMapStyle } from "../utils/mapStyles";

export const useMap360View = (
  mapInstance: google.maps.Map | null,
  layersState: LayerState
) => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const [show360View, setShow360View] = useState(false);
  const [show360ViewPosition, setShow360ViewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  
  const miniMapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (show360View && show360ViewPosition && window.google) {
      const container = document.getElementById("street-view-container");
      const miniMapContainer = document.getElementById("street-view-minimap");

      if (container) {
        // Create 360 Panorama
        const panorama = new google.maps.StreetViewPanorama(container, {
          position: show360ViewPosition,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: true,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          fullscreenControl: true,
        });

        // Create Mini Map
        if (miniMapContainer && mapInstance) {
          const miniMap = new google.maps.Map(miniMapContainer, {
            center: show360ViewPosition,
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
            styles: isDarkMode ? darkMapStyle : [],
          });
          miniMapRef.current = miniMap;

          // Marker for position
          new google.maps.Marker({
            position: show360ViewPosition,
            map: miniMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            title: "Street View Position",
          });
        }

        // Check availability
        const streetViewService = new google.maps.StreetViewService();
        streetViewService.getPanorama(
          { location: show360ViewPosition, radius: 50 },
          (data, status) => {
            if (status !== google.maps.StreetViewStatus.OK) {
              console.warn("⚠️ Street View not available");
              dispatch(
                addNotification({
                  type: "warning",
                  title: "Street View Unavailable",
                  message: "Street View not available at this location.",
                  autoClose: true,
                  duration: 5000,
                })
              );
            }
          }
        );
      }
    }
  }, [show360View, show360ViewPosition, mapInstance, layersState, dispatch]); // Notice we do NOT include isDarkMode here to prevent streetview recreation!

  // Dynamic Theme Updater
  useEffect(() => {
    if (miniMapRef.current) {
      miniMapRef.current.setOptions({ styles: isDarkMode ? darkMapStyle : [] });
    }
  }, [isDarkMode]);

  return {
    show360View,
    setShow360View,
    show360ViewPosition,
    setShow360ViewPosition,
  };
};

