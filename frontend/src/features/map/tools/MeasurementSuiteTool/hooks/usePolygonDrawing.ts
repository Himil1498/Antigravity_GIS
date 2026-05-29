/**
 * Custom hook for Polygon Drawing logic
 */

import { useState, useEffect } from "react";
import { useAppSelector, RootState } from "../../../../../store/index";
import { PolygonData } from "../types/polygonTypes";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import { showToast } from "../../../../../utils/toastUtils";
import {
  calculatePolygonGeometry,
  createVertexMarker,
  createPolygonOverlay,
  extractVerticesFromPolygon,
} from "./polygonHelpers";
import { useSavePolygon } from "./useSavePolygon";
import { createDistanceLabelMarker } from "../utils/markerFactory";
import { formatArea, AreaUnit } from "../utils/areaUtils";

interface UsePolygonDrawingProps {
  map: google.maps.Map | null;
  onSave?: (polygon: PolygonData) => void;
  isActive?: boolean;
  areaUnit?: AreaUnit;
}

export const usePolygonDrawing = ({ map, onSave, isActive = true, areaUnit = 'sqkm' }: UsePolygonDrawingProps) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [startTime] = useState<number>(Date.now());
  const [vertices, setVertices] = useState<Array<{ lat: number; lng: number }>>(
    [],
  );
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [area, setArea] = useState<number>(0);
  const [perimeter, setPerimeter] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(true);
  const [color, setColor] = useState<string>("#FF0000");
  const [fillOpacity, setFillOpacity] = useState<number>(0.35);
  const [areaLabelMarker, setAreaLabelMarker] = useState<google.maps.Marker | null>(null);

  /**
   * Complete polygon drawing
   */
  const completeDrawing = () => {
    if (vertices.length < 3) {
      showToast.warning("Please add at least 3 vertices to create a polygon");
      return;
    }
    setIsDrawing(false);

    markers.forEach((marker) => marker.setDraggable(false));

    if (polygon) {
      polygon.setEditable(false);
    }
  };

  // Initialize click listener
  useEffect(() => {
    if (!map || !isDrawing || !isActive) return;

    const clickListener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        // IGNORE if modifier is held (Ctrl/Cmd) to allow InfoWindow to open without marking map
        const domEv = e.domEvent as MouseEvent;
        if (domEv && (domEv.ctrlKey || domEv.metaKey || domEv.altKey || domEv.shiftKey)) return;

        if (e.latLng) {
          addVertex(e.latLng.lat(), e.latLng.lng());
        }
      },
    );

    const dblClickListener = map.addListener(
      "dblclick",
      (e: google.maps.MapMouseEvent) => {
        if (vertices.length >= 3) {
          completeDrawing();
        }
      }
    );

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(dblClickListener);
    };
  }, [map, vertices, isDrawing, isActive]);

  // Update polygon when vertices change
  useEffect(() => {
    if (!map || vertices.length < 3) {
      if (polygon) {
        google.maps.event.clearInstanceListeners(polygon);
        google.maps.event.clearInstanceListeners(polygon.getPath());
        polygon.setMap(null);
        setPolygon(null);
      }
      return;
    }

    // Remove old polygon
    if (polygon) {
      google.maps.event.clearInstanceListeners(polygon);
      google.maps.event.clearInstanceListeners(polygon.getPath());
      polygon.setMap(null);
    }
    
    // Remove old label
    if (areaLabelMarker) {
      areaLabelMarker.setMap(null);
    }

    // Create new polygon using helper
    const newPolygon = createPolygonOverlay(
      vertices,
      color,
      fillOpacity,
      isDrawing,
      map,
      updateVerticesFromPolygon,
    );

    setPolygon(newPolygon);

    // Calculate area and perimeter
    const geometry = calculatePolygonGeometry(vertices);
    setArea(geometry.area);
    setPerimeter(geometry.perimeter);

    // Create Area Label
    if (vertices.length >= 3 && geometry.area > 0) {
      const areaText = formatArea(geometry.area, areaUnit);
      const bounds = new google.maps.LatLngBounds();
      vertices.forEach(v => bounds.extend(new google.maps.LatLng(v.lat, v.lng)));
      const center = bounds.getCenter();
      
      const label = createDistanceLabelMarker(
        map,
        center.lat(),
        center.lng(),
        areaText
      );
      setAreaLabelMarker(label);
    } else {
      // Clear label if not enough vertices or no area
      if (areaLabelMarker) {
        areaLabelMarker.setMap(null);
        setAreaLabelMarker(null);
      }
    }
  }, [vertices, map, color, fillOpacity, isDrawing, areaUnit]);

  // Sync markers with vertices
  useEffect(() => {
    if (!map) return;

    // Clear old markers
    markers.forEach((m) => m.setMap(null));

    // Create new markers
    const onMarkerClick = (index: number) => {
      if (isDrawing && index === 0 && vertices.length >= 3) {
        completeDrawing();
      }
    };

    const newMarkers = vertices.map((v, i) => 
      createVertexMarker(v.lat, v.lng, i, map, isDrawing, updateVertex, onMarkerClick)
    );
    
    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((m) => m.setMap(null));
    };
  }, [vertices, map, isDrawing]);

  /**
   * Clear all vertices
   */
  const clearAll = () => {
    markers.forEach((marker) => marker.setMap(null));

    if (polygon) {
      google.maps.event.clearInstanceListeners(polygon);
      google.maps.event.clearInstanceListeners(polygon.getPath());
      polygon.setMap(null);
    }

    if (areaLabelMarker) {
      areaLabelMarker.setMap(null);
      setAreaLabelMarker(null);
    }

    setVertices([]);
    setPolygon(null);
    setArea(0);
    setPerimeter(0);
    setIsDrawing(true);
  };

  // Use save polygon hook
  const { savePolygon, saving } = useSavePolygon({
    vertices,
    area,
    perimeter,
    color,
    fillOpacity,
    startTime,
    onSave,
    onClearAll: clearAll,
  });

  /**
   * Add a new vertex
   */
  const addVertex = async (lat: number, lng: number) => {
    // Check if vertex is inside India
    if (!isPointInsideIndia(lat, lng)) {
      showOutsideIndiaWarning();
      return;
    }

    // Check if point is in assigned region
    const regionCheck = await isPointInAssignedRegion(lat, lng, user);
    if (!regionCheck.allowed) {
      showToast.error(
        regionCheck.message ||
          "You don't have access to this region. Contact your administrator.",
      );
      return;
    }

    const newVertex = { lat, lng };
    setVertices((prev) => [...prev, newVertex]);
  };

  /**
   * Update existing vertex
   */
  const updateVertex = (index: number, lat: number, lng: number) => {
    setVertices((prev) => {
      const updated = [...prev];
      updated[index] = { lat, lng };
      return updated;
    });
  };

  /**
   * Update vertices from polygon path changes
   */
  const updateVerticesFromPolygon = (poly: google.maps.Polygon) => {
    const newVertices = extractVerticesFromPolygon(poly);
    setVertices(newVertices);
  };

  const undoLastVertex = () => {
    if (vertices.length === 0) return;
    setVertices((prev) => prev.slice(0, -1));
  };

  return {
    vertices,
    markers,
    polygon,
    area,
    perimeter,
    isDrawing,
    color,
    fillOpacity,
    saving,
    setIsDrawing,
    setColor,
    setFillOpacity,
    addVertex,
    updateVertex,
    undoLastVertex,
    completeDrawing,
    clearAll,
    savePolygon,
  };
};
