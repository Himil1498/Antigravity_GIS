import { useRef, useEffect } from "react";
import type { User } from "../../../../../types/auth/index";
import { useCircleMapMarker } from "./useCircleMapMarker";
import { useCircleMapEvents } from "./useCircleMapEvents";
import { showToast } from "../../../../../utils/toastUtils";

interface UseCircleMapProps {
  map: google.maps.Map | null;
  user: any;
  radius: number;
  center: { lat: number; lng: number } | null;
  circles: { id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[];
  activeCircleIndex: number | null;
  color: string;
  fillOpacity: number;
  isPlacingCenter: boolean;
  isPlacingMarker: boolean;
  isToolboxCollapsed: boolean;
  isActive?: boolean;
  setCenter: (center: { lat: number; lng: number } | null) => void;
  setCircles: React.Dispatch<React.SetStateAction<{ id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[]>>;
  setActiveCircleIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setIsPlacingCenter: (isPlacing: boolean) => void;
  setIsPlacingMarker: (isPlacing: boolean) => void;
  setIsValidating: (isValidating: boolean) => void;
  setRadius: (radius: number) => void;
  setIsToolboxCollapsed: (isCollapsed: boolean) => void;
  validateRadius: (r: number) => number;
  calculateGeometry: (
    r: number,
    setArea: (a: number) => void,
    setPerimeter: (p: number) => void
  ) => void;
  setArea: (a: number) => void;
  setPerimeter: (p: number) => void;
}

export const useCircleMap = ({
  map,
  user,
  radius,
  center,
  circles,
  activeCircleIndex,
  color,
  fillOpacity,
  isPlacingCenter,
  isPlacingMarker,
  isToolboxCollapsed,
  isActive = true,
  setCenter,
  setCircles,
  setActiveCircleIndex,
  setIsPlacingCenter,
  setIsPlacingMarker,
  setIsValidating,
  setRadius,
  setIsToolboxCollapsed,
  validateRadius,
  calculateGeometry,
  setArea,
  setPerimeter
}: UseCircleMapProps) => {
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // 1. Marker Logic
  const { markerMapRef, placeCenter, cleanupMarkers, removeMarker } = useCircleMapMarker({
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
    fillOpacity
  });

  // 2. Circle Events Logic
  const { circlesMapRef, cleanupCircles } = useCircleMapEvents({
    map,
    user,
    circles,
    setCircles,
    isToolboxCollapsed,
    activeCircleIndex,
    setRadius,
    setCenter,
    setIsToolboxCollapsed,
    setActiveCircleIndex,
    validateRadius,
    calculateGeometry,
    setArea,
    setPerimeter,
    markerMapRef
  });

  /**
   * Clear all map objects
   */
  const clearCircle = () => {
    console.log("🧹 Clearing circles and markers...");
    cleanupCircles();
    cleanupMarkers();
    
    setCenter(null);
    setCircles([]);
    setActiveCircleIndex(null);
    setRadius(1000);
    setArea(0);
    setPerimeter(0);
    setIsPlacingCenter(true);
    setIsPlacingMarker(false);
    setIsValidating(false);
    console.log("✅ Circles cleared");
  };

  /**
   * Initialize click listener for center placement
   */
  useEffect(() => {
    if (!map || !isPlacingCenter || !isActive) {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      return;
    }

    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    clickListenerRef.current = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        // IGNORE if modifier is held (Ctrl/Cmd) to allow InfoWindow to open without marking map
        const domEv = e.domEvent as MouseEvent;
        if (domEv && (domEv.ctrlKey || domEv.metaKey || domEv.altKey || domEv.shiftKey)) return;

        if (e.latLng) {
          placeCenter(e.latLng.lat(), e.latLng.lng());
        }
      }
    );

    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isPlacingCenter, isActive, circles.length, radius, color, fillOpacity, placeCenter]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log("🧹 CircleDrawingTool unmounting - cleaning up");
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      cleanupCircles();
      cleanupMarkers();
      console.log("✅ CircleDrawingTool cleanup complete");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Delete a specific circle
   */
  const deleteCircle = (index: number) => {
    const circleToDelete = circles[index];
    if (!circleToDelete) return;

    removeMarker(circleToDelete.id);
    
    // If we're deleting the last circle, reset placement mode so user isn't stuck
    if (circles.length === 1) {
      setIsPlacingCenter(true);
    }

    setCircles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Reset active index if the deleted one was active or if out of bounds
      if (activeCircleIndex === index) {
        setActiveCircleIndex(null);
        setCenter(null);
      } else if (activeCircleIndex !== null && activeCircleIndex > index) {
        setActiveCircleIndex(activeCircleIndex - 1);
      }
      return updated;
    });
    showToast.success(`Circle ${index + 1} deleted`);
  };

  return { clearCircle, deleteCircle };
};

