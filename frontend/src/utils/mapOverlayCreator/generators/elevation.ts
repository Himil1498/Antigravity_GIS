
/**
 * Create Elevation Profile Overlay
 */
export const createElevationOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[]
) => {
  // Multi-point support: Use points array if available, fallback to start/end
  let elevationPoints = data.points || data.path_coordinates || (data.points_json ? JSON.parse(data.points_json) : null);

  // Fallback for old profiles without points array
  if (!elevationPoints || elevationPoints.length === 0) {
    console.warn(
      "⚠️ Elevation profile missing points array, using start/end as fallback"
    );
    const startPoint = data.start_point;
    const endPoint = data.end_point;
    if (startPoint && endPoint) {
      elevationPoints = [startPoint, endPoint];
    } else {
      console.error(
        "❌ Cannot render elevation: no points, start_point, or end_point"
      );
      return;
    }
  }

  if (elevationPoints && elevationPoints.length > 0) {
    // Create polyline connecting all points
    const polyline = new google.maps.Polyline({
      path: elevationPoints,
      geodesic: true,
      strokeColor: "#F59E0B",
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: map,
      clickable: true,
      zIndex: 100,
    });

    overlays.push(polyline);

    // Create markers for all measurement points (A, B, C, D...)
    elevationPoints.forEach(
      (point: google.maps.LatLngLiteral, index: number) => {
        const label = String.fromCharCode(65 + index); // A, B, C, D...
        const isStart = index === 0;
        const isEnd = index === elevationPoints.length - 1;

        const marker = new google.maps.Marker({
          position: point,
          map: map,
          label: { text: label, color: "white", fontWeight: "bold" },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: isStart
              ? "#10B981"
              : isEnd
              ? "#EF4444"
              : "#F59E0B",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
          title: `Point ${label}${isStart ? " (Start)" : ""}${
            isEnd ? " (End)" : ""
          }`,
          clickable: true,
          zIndex: 101,
        });

        overlays.push(marker);
      }
    );

    // Add bearing arcs for 2-point profiles
    if (
      elevationPoints.length === 2 &&
      data.bearing !== null &&
      data.bearing !== undefined
    ) {
      const pointA = new google.maps.LatLng(
        elevationPoints[0].lat,
        elevationPoints[0].lng
      );
      const pointB = new google.maps.LatLng(
        elevationPoints[1].lat,
        elevationPoints[1].lng
      );
      const bearing = Number(data.bearing);
      const reverseBearing =
        data.reverse_bearing !== null && data.reverse_bearing !== undefined
          ? Number(data.reverse_bearing)
          : (bearing + 180) % 360;

      const totalDist = google.maps.geometry.spherical.computeDistanceBetween(
        pointA,
        pointB
      );
      const arcRadius = Math.min(totalDist * 0.12, 500);

      // Helper: Draw bearing arc
      const drawBearingArc = (
        center: google.maps.LatLng,
        bearing: number,
        color: string
      ) => {
        const arcPoints: google.maps.LatLng[] = [];
        for (let angle = 0; angle <= bearing; angle += 2) {
          const point = google.maps.geometry.spherical.computeOffset(
            center,
            arcRadius,
            angle
          );
          arcPoints.push(point);
        }
        const arc = new google.maps.Polyline({
          path: arcPoints,
          geodesic: false,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: map,
          zIndex: 99,
        });
        overlays.push(arc);
      };

      // Helper: Draw north reference line
      const drawNorthLine = (center: google.maps.LatLng) => {
        const northEnd = google.maps.geometry.spherical.computeOffset(
          center,
          arcRadius,
          0
        );
        const northLine = new google.maps.Polyline({
          path: [center, northEnd],
          geodesic: false,
          strokeColor: "#6B7280",
          strokeOpacity: 0.6,
          strokeWeight: 2,
          map: map,
          zIndex: 98,
        });
        overlays.push(northLine);
      };

      // Draw arcs and north lines
      drawNorthLine(pointA);
      drawNorthLine(pointB);
      drawBearingArc(pointA, bearing, "#047857");
      drawBearingArc(pointB, reverseBearing, "#B91C1C");

      // Add degree labels using invisible markers
      const labelPosA = google.maps.geometry.spherical.computeOffset(
        pointA,
        arcRadius * 0.6,
        bearing / 2
      );
      const labelPosB = google.maps.geometry.spherical.computeOffset(
        pointB,
        arcRadius * 0.6,
        reverseBearing / 2
      );

      const labelA = new google.maps.Marker({
        position: labelPosA,
        map: map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: {
          text: `${bearing.toFixed(1)}°`,
          color: "#047857",
          fontSize: "18px",
          fontWeight: "900",
        },
        zIndex: 102,
      });
      overlays.push(labelA);

      const labelB = new google.maps.Marker({
        position: labelPosB,
        map: map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: {
          text: `${reverseBearing.toFixed(1)}°`,
          color: "#B91C1C",
          fontSize: "18px",
          fontWeight: "900",
        },
        zIndex: 102,
      });
      overlays.push(labelB);
    }
  }
};

