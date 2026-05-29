
import { DataEntry } from '../types';

export const createCircleOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  const center = entry.data.center;
  const radius = entry.data.radius;
  if (center && radius) {
    const circle = new google.maps.Circle({
      map: map,
      center: center,
      radius: radius,
      fillColor: "#8B5CF6",
      fillOpacity: 0.35,
      strokeColor: "#8B5CF6",
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });

    const marker = new google.maps.Marker({
      position: center,
      map: map,
      title: entry.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#8B5CF6",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    const area = Math.PI * radius * radius;
    const circumference = 2 * Math.PI * radius;

    const infoContent = `
      <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 20px; margin-right: 8px;">⭕</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Circle</p>
        </div>
        <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
            <span style="color: #6B7280; font-weight: 500;">🔵 Radius:</span>
            <span style="color: #1F2937; font-weight: 600;">${(radius / 1000).toFixed(2)} km</span>

            <span style="color: #6B7280; font-weight: 500;">📐 Area:</span>
            <span style="color: #1F2937; font-weight: 600;">${(area / 1000000).toFixed(2)} km²</span>

            <span style="color: #6B7280; font-weight: 500;">🔄 Circumference:</span>
            <span style="color: #1F2937; font-weight: 600;">${(circumference / 1000).toFixed(2)} km</span>

            <span style="color: #6B7280; font-weight: 500;">📌 Center:</span>
            <span style="color: #1F2937; font-weight: 600; font-family: monospace;">${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}</span>
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

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
    marker.addListener("click", () => infoWindow.open(map, marker));
    infoWindow.open(map, marker); // Auto-open

    overlays.push(circle, marker);
  }
};

export const createPolygonOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  const vertices = entry.data.vertices || entry.data.path || [];
  if (vertices && vertices.length > 0) {
    const polygonData = entry.data;
    const polygon = new google.maps.Polygon({
      map: map,
      paths: vertices,
      fillColor: polygonData.color || "#F59E0B",
      fillOpacity: polygonData.fillOpacity || 0.35,
      strokeColor: polygonData.color || "#F59E0B",
      strokeOpacity: 0.8,
      strokeWeight: polygonData.strokeWeight || 2,
    });
    overlays.push(polygon);

    // Calculate center
    let latSum = 0,
      lngSum = 0;
    vertices.forEach((p: google.maps.LatLngLiteral) => {
      latSum += p.lat;
      lngSum += p.lng;
    });
    const center = { lat: latSum / vertices.length, lng: lngSum / vertices.length };

    const area = entry.data.area || 0;
    const perimeter = entry.data.perimeter || 0;

    const infoContent = `
      <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 20px; margin-right: 8px;">⬟</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Polygon</p>
        </div>
        <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
            <span style="color: #6B7280; font-weight: 500;">📐 Area:</span>
            <span style="color: #1F2937; font-weight: 600;">${(area / 1000000).toFixed(2)} km²</span>

            <span style="color: #6B7280; font-weight: 500;">📏 Perimeter:</span>
            <span style="color: #1F2937; font-weight: 600;">${(perimeter / 1000).toFixed(2)} km</span>

            <span style="color: #6B7280; font-weight: 500;">📍 Vertices:</span>
            <span style="color: #1F2937; font-weight: 600;">${vertices.length}</span>
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

    const marker = new google.maps.Marker({
      position: center,
      map: map,
      title: entry.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#F59E0B",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
    marker.addListener("click", () => infoWindow.open(map, marker));
    infoWindow.open(map, marker); // Auto-open

    overlays.push(marker);
  }
};

