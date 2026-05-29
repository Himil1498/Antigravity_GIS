/**
 * Bearing visualization utilities for map
 * Creates visual arcs and labels showing bearing angles between points
 */

/**
 * Cleans up existing bearing visuals from the map
 */
export const cleanupBearingVisuals = () => {
  const cleanup = (window as any).bearingVisualsCleanup;
  if (cleanup) {
    cleanup.markers?.forEach((marker: any) => marker.setMap(null));
    (window as any).bearingVisualsCleanup = null;
  }
};

/**
 * Creates a dashed/solid north reference line using an SVG marker
 * This ensures it remains a fixed pixel size regardless of zoom
 */
const createNorthLineMarker = (
  map: google.maps.Map,
  point: google.maps.LatLng,
  radiusPx: number
): google.maps.Marker => {
  return new google.maps.Marker({
    position: point,
    map: map,
    icon: {
      path: 'M 0 0 L 0 -1.5',
      scale: radiusPx,
      strokeColor: '#9CA3AF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0
    },
    zIndex: 98,
    clickable: false
  });
};

/**
 * Creates an arc showing the bearing angle using an SVG path
 * This guarantees a perfect circle shape without Mercator distortion
 */
const createBearingArcMarker = (
  map: google.maps.Map,
  point: google.maps.LatLng,
  bearing: number,
  color: string,
  radiusPx: number
): google.maps.Marker => {
  const rad = bearing * Math.PI / 180;
  const x = Math.sin(rad);
  const y = -Math.cos(rad);
  const largeArcFlag = bearing > 180 ? 1 : 0;
  
  // SVG Arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  const path = `M 0 -1 A 1 1 0 ${largeArcFlag} 1 ${x} ${y}`;

  return new google.maps.Marker({
    position: point,
    map: map,
    icon: {
      path: path,
      scale: radiusPx,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillOpacity: 0
    },
    zIndex: 101,
    clickable: false
  });
};

/**
 * Creates a label marker showing the bearing value
 */
const createBearingLabelMarker = (
  map: google.maps.Map,
  point: google.maps.LatLng,
  bearing: number,
  color: string,
  radiusPx: number
): google.maps.Marker => {
  // Offset the label perfectly at the end of the arc
  const angle = bearing * Math.PI / 180;
  const xOffset = Math.sin(angle) * (radiusPx * 1.5);
  const yOffset = -Math.cos(angle) * (radiusPx * 1.5);
  
  return new google.maps.Marker({
    position: point,
    map: map,
    icon: { 
      path: 'M 0 0', // Invisible anchor
      scale: 1, 
      labelOrigin: new google.maps.Point(xOffset, yOffset) 
    },
    label: {
      text: `${bearing.toFixed(1)}°`,
      color: color,
      fontSize: '16px',
      fontWeight: '900',
      className: 'bearing-label'
    },
    zIndex: 102,
    clickable: false
  });
};

/**
 * Creates bearing visualization (arcs, north lines, labels) between two points
 */
export const createBearingVisualization = (
  map: google.maps.Map,
  points: { lat: number; lng: number }[],
  markers: google.maps.Marker[], // Original markers are no longer mutated
  normalizedBearing: number,
  totalDistance: number
) => {
  if (points.length !== 2) return;

  // Cleanup old visuals first
  cleanupBearingVisuals();

  const pointA = new google.maps.LatLng(points[0].lat, points[0].lng);
  const pointB = new google.maps.LatLng(points[1].lat, points[1].lng);
  const reverseBearing = (normalizedBearing + 180) % 360;

  // Fixed visual size in pixels
  const radiusPx = 45;

  // Create visuals for Point A
  const northLineA = createNorthLineMarker(map, pointA, radiusPx);
  const arcA = createBearingArcMarker(map, pointA, normalizedBearing, "#10B981", radiusPx);
  const labelA = createBearingLabelMarker(map, pointA, normalizedBearing, "#047857", radiusPx);

  // Create visuals for Point B
  const northLineB = createNorthLineMarker(map, pointB, radiusPx);
  const arcB = createBearingArcMarker(map, pointB, reverseBearing, "#EF4444", radiusPx);
  const labelB = createBearingLabelMarker(map, pointB, reverseBearing, "#B91C1C", radiusPx);

  // Store cleanup references
  (window as any).bearingVisualsCleanup = {
    markers: [northLineA, arcA, labelA, northLineB, arcB, labelB]
  };
};
