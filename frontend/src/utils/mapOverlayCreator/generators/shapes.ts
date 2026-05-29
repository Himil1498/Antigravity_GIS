
/**
 * Create Polygon Overlay
 */
export const createPolygonOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[]
) => {
  const coordinates = data.coordinates || [];
  if (coordinates.length > 0) {
    const polygon = new google.maps.Polygon({
      paths: coordinates,
      strokeColor: data.stroke_color || "#000000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: data.fill_color || "#FF0000",
      fillOpacity: data.opacity || 0.35,
      map: map,
      clickable: true,
      zIndex: 100,
    });

    overlays.push(polygon);
  }
};

/**
 * Create Circle Overlay
 */
export const createCircleOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[],
  onClick?: (data: any) => void
) => {
  const center = {
    lat: Number(data.center_lat || data.center?.lat),
    lng: Number(data.center_lng || data.center?.lng),
  };
  // FIX: Handle "0" string or 0 number correctly
  const radiusInMeters = Number(data.radius_meters) || Number(data.radius);

  const circle = new google.maps.Circle({
    center: center,
    radius: radiusInMeters,
    strokeColor: data.stroke_color || "#4285F4",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    fillColor: data.fill_color || "#4285F4",
    fillOpacity: Number(data.opacity) || 0.4,
    map: map,
    zIndex: 100,
    clickable: true,
    editable: false,
    visible: true,
  });

  if (onClick) {
    circle.addListener("click", () => {
      onClick(data);
    });
  }

  overlays.push(circle);

  // Add center marker
  const marker = new google.maps.Marker({
    position: center,
    map: map,
    title: data.circle_name || "Circle",
    zIndex: 101,
    clickable: true,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#4CAF50",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
    },
    label: {
      text: "⭕",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "bold",
    },
  });

  if (onClick) {
    marker.addListener("click", () => {
      onClick(data);
    });
  }

  overlays.push(marker);
};

/**
 * Create Sector RF Overlay
 */
export const createSectorOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[],
  onClick?: (data: any) => void
) => {
  const center = {
    lat: Number(data.tower_lat || data.center?.lat),
    lng: Number(data.tower_lng || data.center?.lng),
  };
  const azimuth = Number(data.azimuth);
  const beamwidth = Number(data.beamwidth || 60);
  const radius = Number(data.radius || 1000);

  if (!center.lat || !center.lng || isNaN(azimuth)) {
    console.warn("⚠️ Sector overlay missing required data", { id: data.id, center, azimuth });
    return;
  }

  // Calculate sector path
  const sectorPath: google.maps.LatLngLiteral[] = [center];
  const startAngle = azimuth - beamwidth / 2;
  const endAngle = azimuth + beamwidth / 2;

  for (let angle = startAngle; angle <= endAngle; angle += 1) {
    const point = google.maps.geometry.spherical.computeOffset(
      new google.maps.LatLng(center.lat, center.lng),
      radius,
      angle
    );
    sectorPath.push({ lat: point.lat(), lng: point.lng() });
  }
  sectorPath.push(center);

  const polygon = new google.maps.Polygon({
    paths: sectorPath,
    strokeColor: data.stroke_color || "#FF6B6B",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    fillColor: data.fill_color || "#FF6B6B",
    fillOpacity: data.opacity || 0.35,
    map: map,
    clickable: true,
    zIndex: 100,
  });

  if (onClick) {
    polygon.addListener("click", () => {
      onClick(data);
    });
  }

  overlays.push(polygon);

  // Add tower marker
  const marker = new google.maps.Marker({
    position: center,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#FF6B6B",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    title: data.sector_name || "RF Sector",
    clickable: true,
    zIndex: 101,
  });

  if (onClick) {
    marker.addListener("click", () => {
      onClick(data);
    });
  }

  overlays.push(marker);
};

