/**
 * useMeasurementPoints Hook
 * Manages measurement points state and map interactions
 */

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../../../../store/index";
import { showToast } from "../../../../../utils/toastUtils";
import {
  isPointInsideIndia,
  showOutsideIndiaWarning,
} from "../../../../../utils/indiaBoundary/index";
import { isPointInAssignedRegion } from "../../../../../utils/regionMapping/index";
import { Point, Segment, NotificationState } from "../types/distanceTypes";
import {
  createPointMarker,
  createMeasurementPolyline,
} from "../utils/markerFactory";
import {
  calculateSegmentsAndLabels,
  createMarkersFromPoints,
  clearMapElements,
} from "../utils/measurementPointsUtils";

interface UseMeasurementPointsProps {
  map: google.maps.Map | null;
  initialData?: {
    points: Array<Point>;
    segments?: Array<Segment>;
    totalDistance?: number;
    name?: string;
    description?: string;
  };
  isActive?: boolean;
}

export const useMeasurementPoints = ({
  map,
  initialData,
  isActive = true,
}: UseMeasurementPointsProps) => {
  const { user } = useAppSelector((state) => state.auth);

  // State
  const [startTime] = useState<number>(Date.now());
  const [points, setPoints] = useState<Array<Point>>(initialData?.points || []);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [distanceLabels, setDistanceLabels] = useState<google.maps.Marker[]>(
    [],
  );
  const [totalDistance, setTotalDistance] = useState<number>(
    initialData?.totalDistance || 0,
  );
  const [segments, setSegments] = useState<Array<Segment>>(
    initialData?.segments || [],
  );
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState<boolean>(false);

  // Ref to store current state for click event handlers
  const currentStateRef = useRef({
    points,
    segments,
    totalDistance,
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  // Sync currentStateRef with latest state
  useEffect(() => {
    currentStateRef.current = {
      ...currentStateRef.current,
      points,
      segments,
      totalDistance,
    };
  }, [points, segments, totalDistance]);

  // Helper to dispatch reopen event
  const dispatchReopenEvent = () => {
    window.dispatchEvent(
      new CustomEvent("reopenGISTool", {
        detail: { toolType: "measurementSuite", initialData: currentStateRef.current },
      }),
    );
  };

  // Point management
  const updatePoint = (index: number, lat: number, lng: number) => {
    setPoints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], lat, lng };
      return updated;
    });
  };

  const addPoint = async (lat: number, lng: number) => {
    if (!isPointInsideIndia(lat, lng)) {
      showOutsideIndiaWarning();
      return;
    }
    const regionCheck = await isPointInAssignedRegion(lat, lng, user);
    if (!regionCheck.allowed) {
      showToast.error(
        regionCheck.message || "You don't have access to this region.",
      );
      return;
    }

    const pointIndex = points.length;
    const label = String.fromCharCode(65 + pointIndex);
    const newPoint = { lat, lng, label };
    setPoints((prev) => [...prev, newPoint]);

    if (map) {
      const marker = createPointMarker(map, lat, lng, label);
      marker.addListener("dragend", () => {
        const newPos = marker.getPosition();
        if (newPos) updatePoint(pointIndex, newPos.lat(), newPos.lng());
      });
      marker.addListener("click", dispatchReopenEvent);
      setMarkers((prev) => [...prev, marker]);
    }
  };

  const undoLastPoint = () => {
    if (points.length === 0) return;
    const lastMarker = markers[markers.length - 1];
    if (lastMarker) lastMarker.setMap(null);
    setPoints((prev) => prev.slice(0, -1));
    setMarkers((prev) => prev.slice(0, -1));
  };

  // Recreate markers from initialData
  useEffect(() => {
    if (
      map &&
      initialData?.points &&
      initialData.points.length > 0 &&
      markers.length === 0
    ) {
      console.log(
        "🔄 Recreating markers from initialData:",
        initialData.points,
      );
      const newMarkers = createMarkersFromPoints(
        map,
        initialData.points,
        updatePoint,
        dispatchReopenEvent,
      );
      setMarkers(newMarkers);
      console.log(`✅ Recreated ${newMarkers.length} markers from initialData`);
    }
  }, [map, initialData]);

  // Map click listener
  useEffect(() => {
    if (!map || !isActive) return;
    const clickListener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        // IGNORE if modifier is held (Ctrl/Cmd) to allow InfoWindow to open without marking map
        const domEv = e.domEvent as MouseEvent;
        if (domEv && (domEv.ctrlKey || domEv.metaKey || domEv.altKey || domEv.shiftKey)) return;

        if (e.latLng) addPoint(e.latLng.lat(), e.latLng.lng());
      },
    );
    return () => google.maps.event.removeListener(clickListener);
  }, [map, points, isActive]);

  // Update polyline when points change
  useEffect(() => {
    if (!map) return;
    if (polyline) polyline.setMap(null);
    distanceLabels.forEach((label) => label.setMap(null));
    setDistanceLabels([]);

    if (points.length >= 2) {
      const newPolyline = createMeasurementPolyline(
        map,
        points.map((p) => ({ lat: p.lat, lng: p.lng })),
      );
      newPolyline.addListener("click", dispatchReopenEvent);
      setPolyline(newPolyline);

      const {
        total,
        segments: newSegments,
        labels,
      } = calculateSegmentsAndLabels(points, map);
      setTotalDistance(total);
      setSegments(newSegments);
      setDistanceLabels(labels);
    } else {
      setPolyline(null);
      setTotalDistance(0);
      setSegments([]);
    }
  }, [points, map]);

  // Clear all data
  const clearMeasurementData = () => {
    clearMapElements(markers, polyline, distanceLabels);
    setPoints([]);
    setMarkers([]);
    setPolyline(null);
    setDistanceLabels([]);
    setTotalDistance(0);
    setSegments([]);
  };

  // Update state ref (for form fields)
  const updateStateRef = (name: string, description: string) => {
    currentStateRef.current = { ...currentStateRef.current, name, description };
  };

  return {
    startTime,
    points,
    markers,
    polyline,
    distanceLabels,
    totalDistance,
    segments,
    notification,
    setNotification,
    isToolboxCollapsed,
    setIsToolboxCollapsed,
    currentStateRef,
    addPoint,
    undoLastPoint,
    setPolyline,
    clearMeasurementData,
    updateStateRef,
  };
};
