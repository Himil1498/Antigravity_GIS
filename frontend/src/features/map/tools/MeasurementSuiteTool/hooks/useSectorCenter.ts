/**
 * Custom hook for sector center (tower location) management
 * Handles marker placement, dragging, and region validation
 */

import { useState, useEffect } from "react";
import type { SectorCenter } from "../types/sectorTypes";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import { showToast } from "../../../../../utils/toastUtils";

interface UseSectorCenterProps {
  map: google.maps.Map | null;
  user: any;
  isActive?: boolean;
}

export const useSectorCenter = ({ map, user, isActive = true }: UseSectorCenterProps) => {
  const [center, setCenter] = useState<SectorCenter | null>(null);
  const [centerMarker, setCenterMarker] = useState<google.maps.Marker | null>(
    null,
  );
  const [isPlacingCenter, setIsPlacingCenter] = useState<boolean>(true);

  // Place center marker (tower location)
  const placeCenter = async (lat: number, lng: number) => {
    // Check if center is inside India
    if (!isPointInsideIndia(lat, lng)) {
      showOutsideIndiaWarning();
      return;
    }

    // Check if point is in assigned region (Region-based access control)
    const regionCheck = await isPointInAssignedRegion(lat, lng, user);
    if (!regionCheck.allowed) {
      showToast.error(
        regionCheck.message ||
          "You don't have access to this region. Contact your administrator.",
      );
      return;
    }

    setCenter({ lat, lng });
    setIsPlacingCenter(false);

    // Create center marker (tower icon)
    if (map) {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#FF5722",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        label: {
          text: "📡",
          fontSize: "16px",
        },
        title: "Tower Location",
        draggable: true,
      });

      // Update center on drag
      marker.addListener("dragend", async () => {
        const newPos = marker.getPosition();
        if (newPos) {
          const newLat = newPos.lat();
          const newLng = newPos.lng();

          // Check if new position is inside India
          if (!isPointInsideIndia(newLat, newLng)) {
            showOutsideIndiaWarning();
            marker.setPosition(center);
            return;
          }

          // Check region access
          const regionCheck = await isPointInAssignedRegion(
            newLat,
            newLng,
            user,
          );
          if (!regionCheck.allowed) {
            showToast.error(
              regionCheck.message || "Cannot move tower to this region.",
            );
            marker.setPosition(center);
            return;
          }

          setCenter({ lat: newLat, lng: newLng });
        }
      });

      setCenterMarker(marker);
    }
  };

  // Initialize click listener for center placement
  useEffect(() => {
    if (!map || !isPlacingCenter || !isActive) return;

    const clickListener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        // IGNORE if modifier is held (Ctrl/Cmd) to allow InfoWindow to open without marking map
        const domEv = e.domEvent as MouseEvent;
        if (domEv && (domEv.ctrlKey || domEv.metaKey || domEv.altKey || domEv.shiftKey)) return;

        if (e.latLng) {
          placeCenter(e.latLng.lat(), e.latLng.lng());
        }
      },
    );

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, isPlacingCenter, isActive]);

  // Clear center and marker
  const clearCenter = () => {
    if (centerMarker) {
      centerMarker.setMap(null);
      setCenterMarker(null);
    }
    setCenter(null);
    setIsPlacingCenter(true);
  };

  return {
    center,
    centerMarker,
    isPlacingCenter,
    placeCenter,
    clearCenter,
    setIsPlacingCenter,
  };
};
