/**
 * Measurement Points Utilities
 * Helper functions for point and distance management
 */

import { Point, Segment } from "../types/distanceTypes";
import { calculateHaversineDistance, formatDistance } from "./distanceUtils";
import { createPointMarker, createDistanceLabelMarker } from "./markerFactory";

/**
 * Calculate distance between two points using Google Maps geometry if available
 */
export const calculateSegmentDistance = (
  from: Point,
  to: Point
): number => {
  try {
    if (google.maps.geometry?.spherical?.computeDistanceBetween) {
      const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
      const toLatLng = new google.maps.LatLng(to.lat, to.lng);
      return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
    }
  } catch (error) {
    // Fall through to Haversine
  }
  return calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);
};

/**
 * Calculate all segments and create distance labels
 */
export const calculateSegmentsAndLabels = (
  points: Point[],
  map: google.maps.Map | null
): {
  total: number;
  segments: Segment[];
  labels: google.maps.Marker[];
} => {
  if (points.length < 2) {
    return { total: 0, segments: [], labels: [] };
  }

  let total = 0;
  const newSegments: Segment[] = [];
  const newLabels: google.maps.Marker[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const distance = calculateSegmentDistance(points[i], points[i + 1]);

    newSegments.push({
      distance,
      from: points[i].label,
      to: points[i + 1].label
    });

    // Create midpoint label
    const midLat = (points[i].lat + points[i + 1].lat) / 2;
    const midLng = (points[i].lng + points[i + 1].lng) / 2;

    if (map) {
      const labelMarker = createDistanceLabelMarker(map, midLat, midLng, formatDistance(distance));
      newLabels.push(labelMarker);
    }

    total += distance;
  }

  return { total, segments: newSegments, labels: newLabels };
};

/**
 * Create markers from initial data points
 */
export const createMarkersFromPoints = (
  map: google.maps.Map,
  points: Point[],
  onDragEnd: (index: number, lat: number, lng: number) => void,
  onClickHandler: () => void
): google.maps.Marker[] => {
  const newMarkers: google.maps.Marker[] = [];

  points.forEach((point, index) => {
    const marker = createPointMarker(map, point.lat, point.lng, point.label);

    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos) onDragEnd(index, newPos.lat(), newPos.lng());
    });

    marker.addListener("click", onClickHandler);
    newMarkers.push(marker);
  });

  return newMarkers;
};

/**
 * Clear all measurement map elements
 */
export const clearMapElements = (
  markers: google.maps.Marker[],
  polyline: google.maps.Polyline | null,
  distanceLabels: google.maps.Marker[]
) => {
  markers.forEach((marker) => marker.setMap(null));
  if (polyline) polyline.setMap(null);
  distanceLabels.forEach((label) => label.setMap(null));
};

