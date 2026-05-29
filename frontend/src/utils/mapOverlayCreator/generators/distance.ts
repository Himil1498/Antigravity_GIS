
/**
 * Create Distance Measurement Overlay
 */
export const createDistanceOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[]
) => {
  // Create polyline
  const points = data.points || [];
  if (points.length > 0) {
    const polyline = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: map,
      clickable: true,
      zIndex: 100,
    });

    overlays.push(polyline);

    // Add markers for all points
    points.forEach((point: any, index: number) => {
      const label = point.label || String.fromCharCode(65 + index);
      const marker = new google.maps.Marker({
        position: point,
        map: map,
        label: { text: label, color: "white", fontWeight: "bold" },
        title: `Point ${label}`,
        clickable: true,
        zIndex: 101,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });
      overlays.push(marker);
    });

    // Add distance labels for each segment
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Calculate distance between points
      let distance: number;
      try {
        if (google.maps.geometry?.spherical?.computeDistanceBetween) {
          const from = new google.maps.LatLng(p1.lat, p1.lng);
          const to = new google.maps.LatLng(p2.lat, p2.lng);
          distance =
            google.maps.geometry.spherical.computeDistanceBetween(from, to);
        } else {
          // Fallback to Haversine formula
          const R = 6371000; // Earth's radius in meters
          const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
          const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * (Math.PI / 180)) *
              Math.cos(p2.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = R * c;
        }
      } catch (error) {
        // Haversine fallback
        const R = 6371000;
        const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
        const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(p1.lat * (Math.PI / 180)) *
            Math.cos(p2.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }

      // Format distance
      const distanceText =
        distance < 1000
          ? `${distance.toFixed(2)} m`
          : `${(distance / 1000).toFixed(2)} km`;

      // Calculate midpoint
      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;

      // Create distance label marker
      const labelMarker = new google.maps.Marker({
        position: { lat: midLat, lng: midLng },
        map: map,
        label: {
          text: distanceText,
          color: "#FF0000",
          fontSize: "14px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // Invisible icon, only show label
        },
        clickable: false,
        optimized: false,
        zIndex: 1000001,
      });

      overlays.push(labelMarker);
    }
  } else {
    console.warn("⚠️ No points found for distance measurement");
  }
};

