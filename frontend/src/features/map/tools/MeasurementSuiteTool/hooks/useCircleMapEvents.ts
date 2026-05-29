import { useRef, useEffect, useCallback } from "react";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import { showToast } from "../../../../../utils/toastUtils";
import type { User } from "../../../../../types/auth/index";

interface UseCircleMapEventsProps {
  map: google.maps.Map | null;
  user: User | null;
  circles: { id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[];
  setCircles: React.Dispatch<React.SetStateAction<{ id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[]>>;
  isToolboxCollapsed: boolean;
  activeCircleIndex: number | null;
  setRadius: (radius: number) => void;
  setCenter: (center: { lat: number; lng: number } | null) => void;
  setIsToolboxCollapsed: (isCollapsed: boolean) => void;
  setActiveCircleIndex: React.Dispatch<React.SetStateAction<number | null>>;
  validateRadius: (r: number) => number;
  calculateGeometry: (
    r: number,
    setArea: (a: number) => void,
    setPerimeter: (p: number) => void,
  ) => void;
  setArea: (a: number) => void;
  setPerimeter: (p: number) => void;
  markerMapRef: React.MutableRefObject<Map<string, google.maps.Marker>>;
}

export const useCircleMapEvents = ({
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
  markerMapRef,
}: UseCircleMapEventsProps) => {
  // Use Map for stable ID-based tracking
  const circlesMapRef = useRef<Map<string, google.maps.Circle>>(new Map());

  // Track fresh state without triggering re-renders in closures
  const activeCircleIndexRef = useRef<number | null>(activeCircleIndex);
  const circlesRef = useRef(circles);

  useEffect(() => {
    activeCircleIndexRef.current = activeCircleIndex;
  }, [activeCircleIndex]);

  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  /**
   * Helper: clean up circles
   */
  const cleanupCircles = useCallback(() => {
    circlesMapRef.current.forEach((circle) => {
      google.maps.event.clearInstanceListeners(circle);
      circle.setMap(null);
    });
    circlesMapRef.current.clear();
  }, []);

  /**
   * Effect 1: Lifecycle (Create/Destroy)
   */
  useEffect(() => {
    if (!map) return;

    const currentIds = new Set(circles.map(c => c.id));
    
    // 1. Remove circles no longer in the array
    circlesMapRef.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        const circle = circlesMapRef.current.get(id);
        if (circle) {
          google.maps.event.clearInstanceListeners(circle);
          circle.setMap(null);
        }
        circlesMapRef.current.delete(id);
      }
    });

    // 2. Add new circles
    circles.forEach((circleData) => {
      if (!circlesMapRef.current.has(circleData.id)) {
        const circle = new google.maps.Circle({
          center: { lat: circleData.lat, lng: circleData.lng },
          radius: circleData.radius,
          strokeColor: circleData.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: circleData.color,
          fillOpacity: circleData.fillOpacity,
          map: map,
          editable: true,
          draggable: true,
        });

        const currentPosRef = { current: { lat: circleData.lat, lng: circleData.lng } };

        circle.addListener("radius_changed", () => {
          const newRadius = circle.getRadius();
          if (newRadius && newRadius > 0 && newRadius < 5000000) {
            const validRadius = validateRadius(newRadius);
            
            setCircles((prev: any[]) => {
              const updatedIndex = prev.findIndex(c => c.id === circleData.id);
              if (updatedIndex === -1) return prev;
              
              // Check active index using the ref — safe inside updater since it's just a read
              if (activeCircleIndexRef.current === updatedIndex) {
                setRadius(validRadius);
                calculateGeometry(validRadius, setArea, setPerimeter);
              }

              const updated = [...prev];
              updated[updatedIndex] = { ...updated[updatedIndex], radius: validRadius };
              return updated;
            });
          }
        });

        circle.addListener("dragend", async () => {
          const newCenter = circle.getCenter();
          if (newCenter) {
            const newLat = newCenter.lat();
            const newLng = newCenter.lng();

            if (!isPointInsideIndia(newLat, newLng)) {
              showOutsideIndiaWarning();
              circle.setCenter(currentPosRef.current);
              return;
            }

            try {
              const regionCheck = await isPointInAssignedRegion(newLat, newLng, user);
              if (!regionCheck.allowed) {
                showToast.error(regionCheck.message || "You don't have access to this region.");
                circle.setCenter(currentPosRef.current);
                return;
              }
            } catch (err) {
              console.error("Region check error:", err);
              showToast.error("Failed to validate region. Try again.");
              circle.setCenter(currentPosRef.current);
              return;
            }

            const newCenterObj = { lat: newLat, lng: newLng };
            currentPosRef.current = newCenterObj;
            
            setCenter(newCenterObj);
            
            setCircles((prev: any[]) => {
              const updatedIndex = prev.findIndex(c => c.id === circleData.id);
              if (updatedIndex === -1) return prev;

              const updated = [...prev];
              updated[updatedIndex] = { ...updated[updatedIndex], ...newCenterObj };
              return updated;
            });

            // Fully contract-safe: resolve index dynamically via updater without relying on sync execution
            setActiveCircleIndex(() => {
              const idx = circlesRef.current.findIndex(c => c.id === circleData.id);
              return idx !== -1 ? idx : null;
            });

            // Update corresponding marker using stable ID lookup
            const marker = markerMapRef.current.get(circleData.id);
            if (marker) {
              marker.setPosition(newCenter);
            }
          }
        });

        circle.addListener("click", () => {
          const idx = circlesRef.current.findIndex(c => c.id === circleData.id);
          if (idx !== -1) setActiveCircleIndex(idx);
          
          if (isToolboxCollapsed) {
            setIsToolboxCollapsed(false);
          }
          window.dispatchEvent(
            new CustomEvent("reopenGISTool", {
              detail: { toolType: "circle" },
            }),
          );
        });

        circlesMapRef.current.set(circleData.id, circle);
      }
    });

    return () => {}; // Cleanup handled by Effect 1 removal logic and unmount
  }, [map, circles.length, user]); // Only recreate objects if list size changes (implies add/remove)

  /**
   * Effect 2: Patch Properties (Radius, Color, Center)
   */
  useEffect(() => {
    circles.forEach((circleData) => {
      const circle = circlesMapRef.current.get(circleData.id);
      if (!circle) return;

      // Prevent redundant updates that might break user interaction handles
      if (Math.abs(circle.getRadius() - circleData.radius) > 0.01) {
        circle.setRadius(circleData.radius);
      }
      
      const currentMapCenter = circle.getCenter();
      if (currentMapCenter && 
          (Math.abs(currentMapCenter.lat() - circleData.lat) > 0.000001 || 
           Math.abs(currentMapCenter.lng() - circleData.lng) > 0.000001)) {
        circle.setCenter({ lat: circleData.lat, lng: circleData.lng });
      }

      circle.setOptions({
        strokeColor: circleData.color,
        fillColor: circleData.color,
        fillOpacity: circleData.fillOpacity,
      });
    });
  }, [circles]);

  // Unmount cleanup
  useEffect(() => {
    return () => cleanupCircles();
  }, [cleanupCircles]);

  return { circlesMapRef, cleanupCircles };
};
