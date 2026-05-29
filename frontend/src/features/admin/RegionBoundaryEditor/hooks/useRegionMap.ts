import { useRef, useCallback } from "react";

export const useRegionMap = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRefs = useRef<google.maps.Polygon[]>([]);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null,
  );

  const clearMap = useCallback(() => {
    polygonRefs.current.forEach((poly) => {
      google.maps.event.clearInstanceListeners(poly);
      const paths = poly.getPaths();
      if (paths) {
        for (let i = 0; i < paths.getLength(); i++) {
          google.maps.event.clearInstanceListeners(paths.getAt(i));
        }
      }
      poly.setMap(null);
    });
    polygonRefs.current = [];
  }, []);

  const fitBounds = useCallback((paths: google.maps.LatLng[][][]) => {
    if (mapRef.current && paths.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      paths.forEach((poly) =>
        poly.forEach((ring) => ring.forEach((pt) => bounds.extend(pt))),
      );
      mapRef.current.fitBounds(bounds);
    }
  }, []);

  return {
    mapRef,
    polygonRefs,
    drawingManagerRef,
    clearMap,
    fitBounds,
  };
};

