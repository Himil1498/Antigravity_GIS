
import { addBookmark } from '../../../services/bookmark/index';
import { createBookmarkButton } from '../helpers';
import { createElevationModal } from '../modals';
import { DataEntry } from '../types';
import { showToast } from '../../../utils/toastUtils';

export const createElevationOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  // 🔧 FIX: Handle both new (points array) and old (start_point/end_point) data
  let points = entry.data.points;

  // Fallback for old data without points array
  if (!points || points.length === 0) {
    console.warn('⚠️ Elevation profile missing points array, using start/end points as fallback');
    const startPoint = entry.data.start_point || entry.data.startPoint;
    const endPoint = entry.data.end_point || entry.data.endPoint;
    if (startPoint && endPoint) {
      points = [startPoint, endPoint];
    } else {
      console.error('❌ Cannot render elevation profile: no points, start_point, or end_point found');
      return;
    }
  }

  if (points && points.length > 0) {
    // Draw polyline
    const polyline = new google.maps.Polyline({
      map: map,
      path: points,
      strokeColor: "#C2410C",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    overlays.push(polyline);

    // Add point markers with labels (A, B, C, D...)
    points.forEach((point: google.maps.LatLngLiteral, index: number) => {
      const label = String.fromCharCode(65 + index); // A, B, C, D...
      const pointMarker = new google.maps.Marker({
        position: point,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#C2410C",
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        label: {
          text: label,
          color: "#FFFFFF",
          fontSize: "12px",
          fontWeight: "bold",
        },
        title: `Point ${label}`,
      });
      overlays.push(pointMarker);
    });

    // Info at midpoint
    const midIndex = Math.floor(points.length / 2);
    const midPoint = points[midIndex];

    // Build elevation graph SVG
    const elevationData = entry.data.elevationData || [];
    let chartPoints = "";
    let minElev = Infinity;
    let maxElev = -Infinity;

    if (elevationData.length > 0) {
      elevationData.forEach((point: any) => {
        const elev = point.elevation || 0;
        minElev = Math.min(minElev, elev);
        maxElev = Math.max(maxElev, elev);
      });

      const elevRange = maxElev - minElev || 1;
      const chartWidth = 300;
      const chartHeight = 100;

      chartPoints = elevationData
        .map((point: any, i: number) => {
          const x = (i / (elevationData.length - 1)) * chartWidth;
          const normalizedElev = (point.elevation - minElev) / elevRange;
          const y = chartHeight - (normalizedElev * (chartHeight - 20) + 10);
          return `${x},${y}`;
        })
        .join(" ");
    }

    const infoContent = `
      <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #C2410C 0%, #9A3412 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 20px; margin-right: 8px;">⛰️</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Elevation Profile</p>
        </div>
        ${elevationData.length > 0 ? `
        <div style="background: #FFF7ED; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #9A3412;">📊 Elevation Graph</p>
          <svg width="300" height="100" style="background: white; border-radius: 4px; border: 1px solid #FED7AA;">
            <polyline points="${chartPoints}" fill="none" stroke="#C2410C" stroke-width="2"/>
            <line x1="0" y1="90" x2="300" y2="90" stroke="#E5E7EB" stroke-width="1"/>
          </svg>
        </div>
        ` : ""}
        <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
            <span style="color: #6B7280; font-weight: 500;">📏 Distance:</span>
            <span style="color: #1F2937; font-weight: 600;">${entry.data.distance ? (entry.data.distance / 1000).toFixed(2) + " km" : "N/A"}</span>

            ${elevationData.length > 0 ? `
            <span style="color: #6B7280; font-weight: 500;">⬆️ High Point:</span>
            <span style="color: #1F2937; font-weight: 600;">${maxElev.toFixed(1)} m</span>

            <span style="color: #6B7280; font-weight: 500;">⬇️ Low Point:</span>
            <span style="color: #1F2937; font-weight: 600;">${minElev.toFixed(1)} m</span>

            <span style="color: #6B7280; font-weight: 500;">📈 Elevation Gain:</span>
            <span style="color: #1F2937; font-weight: 600;">${entry.data.elevationGain ? entry.data.elevationGain.toFixed(1) + " m" : "N/A"}</span>
            ` : ""}
          </div>
        </div>
        ${entry.data.description ? `
        <div style="background: #FEF3C7; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #F59E0B;">
          <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>📝 Description:</strong><br/>${entry.data.description}</p>
        </div>
        ` : ""}
        ${elevationData.length > 0 ? `
        <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
          <button id="view-full-graph-${entry.id}" style="padding: 8px 16px; font-size: 13px; background: linear-gradient(135deg, #C2410C 0%, #9A3412 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(194, 65, 12, 0.3);">
            📊 View Full Graph
          </button>
        </div>
        ` : ""}
        ${createBookmarkButton(entry.id)}
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
        fillColor: "#C2410C",
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

    // Add event listener for view full graph button
    if (elevationData.length > 0) {
      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        const viewGraphBtn = document.getElementById(`view-full-graph-${entry.id}`);
        if (viewGraphBtn) {
          viewGraphBtn.addEventListener("click", () => {
            createElevationModal(entry, elevationData, minElev, maxElev);
          });
        }

        // Add bookmark functionality
        const bookmarkBtn = document.getElementById(`bookmark-btn-${entry.id}`);
        if (bookmarkBtn) {
          bookmarkBtn.addEventListener("click", () => {
            addBookmark({
              name: entry.name,
              type: "savedData", // Elevation mapped to savedData
              location: points![0],
              description: entry.data.description,
              data: { type: "Elevation", ...entry.data }, // Preserve original type in data
            });
            showToast.success("Bookmark added successfully!");
          });
        }
      });
    }

    overlays.push(infoMarker);
  }
};

