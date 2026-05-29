
import { DataEntry } from '../types';

export const createDistanceOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  const points = entry.data.points;
  if (points && points.length > 0) {
    // Draw polyline
    const polyline = new google.maps.Polyline({
      map: map,
      path: points,
      strokeColor: "#3B82F6",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    overlays.push(polyline);

    // Add numbered markers
    points.forEach((point: google.maps.LatLngLiteral, index: number) => {
      const pointMarker = new google.maps.Marker({
        position: point,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#3B82F6",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 1.5,
        },
        label: {
          text: `${index + 1}`,
          color: "#FFFFFF",
          fontSize: "10px",
          fontWeight: "bold",
        },
      });
      overlays.push(pointMarker);
    });

    // Info marker at midpoint
    const totalDistance = entry.data.totalDistance || 0;
    const midIndex = Math.floor(points.length / 2);
    const midPoint = points[midIndex];

    const infoContent = `
      <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 20px; margin-right: 8px;">📏</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Distance Measurement</p>
        </div>
        <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
            <span style="color: #6B7280; font-weight: 500;">📏 Total Distance:</span>
            <span style="color: #1F2937; font-weight: 600;">${(totalDistance / 1000).toFixed(2)} km</span>

            <span style="color: #6B7280; font-weight: 500;">📍 Points:</span>
            <span style="color: #1F2937; font-weight: 600;">${points.length}</span>
          </div>
        </div>
        ${entry.data.description ? `
        <div style="background: #FEF3C7; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #F59E0B;">
          <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>📝 Description:</strong><br/>${entry.data.description}</p>
        </div>
        ` : ""}
        <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 8px;">
          <p style="margin: 0; font-size: 11px; color: #9CA3AF; text-align: center;">⏰ Created: ${new Date(entry.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `;

    const infoMarker = new google.maps.Marker({
      position: midPoint,
      map: map,
      title: entry.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#1E40AF",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      label: {
        text: "ℹ️",
        color: "#FFFFFF",
        fontSize: "12px",
      },
    });

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
    infoMarker.addListener("click", () => infoWindow.open(map, infoMarker));
    infoWindow.open(map, infoMarker); // Auto-open

    overlays.push(infoMarker);
  }
};

