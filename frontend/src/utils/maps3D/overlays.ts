
/**
 * Create elevation path polyline overlay for 3D map
 * @param map Google Maps instance
 * @param points Array of points forming the elevation path
 * @param options Polyline styling options
 * @returns Google Maps Polyline instance
 */
export const createElevationPathPolyline = (
  map: google.maps.Map,
  points: Array<{ lat: number; lng: number }>,
  options?: {
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }
): google.maps.Polyline => {
  return new google.maps.Polyline({
    path: points,
    geodesic: true,
    strokeColor: options?.strokeColor || '#3b82f6',
    strokeOpacity: options?.strokeOpacity || 0.9,
    strokeWeight: options?.strokeWeight || 5,
    map: map,
    zIndex: 100
  });
};

/**
 * Create antenna marker with custom styling
 * @param map Google Maps instance
 * @param position Marker position
 * @param label Marker label (e.g., 'A', 'B')
 * @param antennaHeight Antenna height in meters
 * @param color Marker color
 * @returns Google Maps Marker instance
 */
export const createAntennaMarker = (
  map: google.maps.Map,
  position: { lat: number; lng: number },
  label: string,
  antennaHeight: number,
  color: string = '#10b981'
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    title: `Antenna ${label} (${antennaHeight}m height)`,
    label: {
      text: label,
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 15,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    },
    zIndex: 200,
    animation: google.maps.Animation.DROP
  });
};

/**
 * Create info window for antenna marker with detailed information
 * @param marker Marker to attach info window to
 * @param label Antenna label
 * @param antennaHeight Antenna height
 * @param position Coordinates
 * @param elevation Ground elevation at position
 * @returns Google Maps InfoWindow instance
 */
export const createAntennaInfoWindow = (
  marker: google.maps.Marker,
  label: string,
  antennaHeight: number,
  position: { lat: number; lng: number },
  elevation?: number
): google.maps.InfoWindow => {
  const content = `
    <div style="padding: 8px; min-width: 180px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
        Antenna ${label}
      </h3>
      <div style="font-size: 13px; color: #4b5563; line-height: 1.5;">
        <div style="margin-bottom: 4px;">
          <strong>Height:</strong> ${antennaHeight}m
        </div>
        ${elevation !== undefined ? `
          <div style="margin-bottom: 4px;">
            <strong>Ground Elevation:</strong> ${elevation.toFixed(1)}m
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Total Height AGL:</strong> ${(elevation + antennaHeight).toFixed(1)}m
          </div>
        ` : ''}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
          ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}
        </div>
      </div>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({
    content
  });

  marker.addListener('click', () => {
    infoWindow.open(marker.getMap(), marker);
  });

  return infoWindow;
};

/**
 * Clean up 3D view overlays (markers, polylines, info windows)
 * @param overlays Array of Google Maps overlays to remove
 */
export const cleanup3DOverlays = (
  overlays: Array<google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow>
): void => {
  overlays.forEach((overlay) => {
    if (overlay) {
      if (overlay instanceof google.maps.InfoWindow) {
        overlay.close();
      } else {
        overlay.setMap(null);
      }
    }
  });
};

