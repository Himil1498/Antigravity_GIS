/**
 * Helper functions for polygon operations
 */

/**
 * Calculate polygon area and perimeter
 */
export const calculatePolygonGeometry = (
  vertices: Array<{ lat: number; lng: number }>
): { area: number; perimeter: number } => {
  if (vertices.length < 3) {
    return { area: 0, perimeter: 0 };
  }

  // Calculate area using Google Maps geometry library
  const path = vertices.map((v) => new google.maps.LatLng(v.lat, v.lng));
  const area = google.maps.geometry.spherical.computeArea(path);

  // Calculate perimeter
  let perimeter = 0;
  for (let i = 0; i < vertices.length; i++) {
    const start = new google.maps.LatLng(vertices[i].lat, vertices[i].lng);
    const end = new google.maps.LatLng(
      vertices[(i + 1) % vertices.length].lat,
      vertices[(i + 1) % vertices.length].lng
    );
    perimeter += google.maps.geometry.spherical.computeDistanceBetween(start, end);
  }

  return { area, perimeter };
};

/**
 * Create a marker for a vertex
 */
export const createVertexMarker = (
  lat: number,
  lng: number,
  index: number,
  map: google.maps.Map,
  isDraggable: boolean,
  onDragEnd: (index: number, lat: number, lng: number) => void
): google.maps.Marker => {
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    label: {
      text: String(index + 1),
      color: "white",
      fontWeight: "bold"
    },
    title: `Vertex ${index + 1}`,
    draggable: isDraggable
  });

  if (isDraggable) {
    marker.addListener("dragend", () => {
      const newPos = marker.getPosition();
      if (newPos) {
        onDragEnd(index, newPos.lat(), newPos.lng());
      }
    });
  }

  return marker;
};

/**
 * Create a polygon overlay
 */
export const createPolygonOverlay = (
  vertices: Array<{ lat: number; lng: number }>,
  color: string,
  fillOpacity: number,
  isEditable: boolean,
  map: google.maps.Map,
  onPathChange: (polygon: google.maps.Polygon) => void
): google.maps.Polygon => {
  const polygon = new google.maps.Polygon({
    paths: vertices,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: fillOpacity,
    map: map,
    editable: isEditable,
    draggable: false
  });

  if (isEditable) {
    google.maps.event.addListener(polygon.getPath(), "set_at", () => {
      onPathChange(polygon);
    });
    google.maps.event.addListener(polygon.getPath(), "insert_at", () => {
      onPathChange(polygon);
    });
  }

  // Add click listener to reopen tool when clicked after closing
  polygon.addListener('click', () => {
    window.dispatchEvent(new CustomEvent('reopenGISTool', {
      detail: { toolType: 'polygon' }
    }));
  });

  return polygon;
};

/**
 * Extract vertices from polygon path
 */
export const extractVerticesFromPolygon = (
  polygon: google.maps.Polygon
): Array<{ lat: number; lng: number }> => {
  const path = polygon.getPath();
  const vertices: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    vertices.push({ lat: point.lat(), lng: point.lng() });
  }
  return vertices;
};

