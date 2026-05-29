import { useRef, useCallback } from "react";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import { showToast } from "../../../../../utils/toastUtils";
import type { User } from "../../../../../types/auth/index";

interface UseCircleMapMarkerProps {
  map: google.maps.Map | null;
  user: User | null;
  setCenter: (center: { lat: number; lng: number } | null) => void;
  circles: { id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[];
  setCircles: React.Dispatch<React.SetStateAction<{ id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[]>>;
  setActiveCircleIndex: (index: number | null) => void;
  setIsPlacingCenter: (isPlacing: boolean) => void;
  setIsPlacingMarker: (isPlacing: boolean) => void;
  setIsValidating: (isValidating: boolean) => void;
  isPlacingMarker: boolean;
  radius: number;
  color: string;
  fillOpacity: number;
}

export const useCircleMapMarker = ({
  map,
  user,
  setCenter,
  circles,
  setCircles,
  setActiveCircleIndex,
  setIsPlacingCenter,
  setIsPlacingMarker,
  setIsValidating,
  isPlacingMarker,
  radius,
  color,
  fillOpacity,
}: UseCircleMapMarkerProps) => {
  // Use a Map for stable ID-based tracking
  const markerMapRef = useRef<Map<string, google.maps.Marker>>(new Map());

  /**
   * Helper: clean up markers
   */
  const cleanupMarkers = useCallback(() => {
    markerMapRef.current.forEach((marker) => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markerMapRef.current.clear();
  }, []);

  /**
   * Place center marker with India + region checks
   */
  const placeCenter = useCallback(async (lat: number, lng: number) => {
    if (isPlacingMarker) {
      console.log("Already placing marker, ignoring click");
      return;
    }

    setIsPlacingMarker(true);
    setIsValidating(true);

    try {
      if (!isPointInsideIndia(lat, lng)) {
        showOutsideIndiaWarning();
        return;
      }

      showToast.info("Validating location...", { autoClose: 1000 });

      const regionCheck = await isPointInAssignedRegion(lat, lng, user);
      if (!regionCheck.allowed) {
        showToast.error(
          regionCheck.message ||
            "You don't have access to this region. Contact your administrator.",
        );
        return;
      }

      const newId = Math.random().toString(36).substr(2, 9);
      const newCircleData = { 
        id: newId, 
        lat, 
        lng, 
        radius, 
        color, 
        fillOpacity 
      };
      
      const newIndex = circles.length;
      setCenter({ lat, lng });
      setCircles((prev: any[]) => [...prev, newCircleData]);
      setActiveCircleIndex(newIndex);
      
      setIsPlacingCenter(false);

      if (map) {
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          label: {
            text: "⊕",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
          },
          title: `Circle ${newIndex + 1} (Drag to reposition)`,
          draggable: true,
          zIndex: 1000,
        });

        const currentPosRef = { current: { lat, lng } };

        marker.addListener("dragend", async () => {
          const newPos = marker.getPosition();
          if (newPos) {
            const newLat = newPos.lat();
            const newLng = newPos.lng();

            if (!isPointInsideIndia(newLat, newLng)) {
              showOutsideIndiaWarning();
              marker.setPosition(currentPosRef.current);
              return;
            }

            try {
              const regionCheck = await isPointInAssignedRegion(
                newLat,
                newLng,
                user,
              );
              if (!regionCheck.allowed) {
                showToast.error(
                  regionCheck.message ||
                    "You don't have access to this region.",
                );
                marker.setPosition(currentPosRef.current);
                return;
              }
            } catch (err) {
              console.error("Region check error:", err);
              showToast.error("Failed to validate region. Try again.");
              marker.setPosition(currentPosRef.current);
              return;
            }

            const updatedPos = { lat: newLat, lng: newLng };
            currentPosRef.current = updatedPos;
            
            setCenter(updatedPos);
            
            setCircles((prev: any[]) => {
              const updatedIndex = prev.findIndex(c => c.id === newId);
              if (updatedIndex === -1) return prev;
              
              const updated = [...prev];
              updated[updatedIndex] = { 
                ...updated[updatedIndex], 
                lat: newLat, 
                lng: newLng 
              };
              
              setActiveCircleIndex(updatedIndex);
              return updated;
            });
          }
        });

        markerMapRef.current.set(newId, marker);
      }
    } finally {
      setIsPlacingMarker(false);
      setIsValidating(false);
    }
  }, [map, user, circles.length, radius, color, fillOpacity, setCenter, setCircles, setActiveCircleIndex, setIsPlacingCenter, setIsPlacingMarker, setIsValidating, isPlacingMarker]);

  const removeMarker = useCallback((id: string) => {
    const marker = markerMapRef.current.get(id);
    if (marker) {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
      markerMapRef.current.delete(id);
    }
  }, []);

  return {
    markerMapRef,
    placeCenter,
    cleanupMarkers,
    removeMarker,
  };
};
