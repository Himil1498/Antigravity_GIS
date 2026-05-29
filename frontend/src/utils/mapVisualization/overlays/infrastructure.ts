
import { addBookmark } from '../../../services/bookmark/index';
import { createBookmarkButton } from '../helpers';
import { DataEntry } from '../types';
import { showToast } from '../../../utils/toastUtils';

export const createInfrastructureOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  const infraData = entry.data as any;
  const coordinates = infraData.coordinates || infraData.location || { lat: 0, lng: 0 };

  const marker = new google.maps.Marker({
    map: map,
    position: coordinates,
    title: entry.name,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#10B981",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    label: {
      text: "🏢",
      color: "#FFFFFF",
      fontSize: "14px",
    },
  });

  // Format address
  let addressDisplay = "";
  if (infraData.address) {
    if (typeof infraData.address === "object") {
      const addr = infraData.address;
      addressDisplay = [addr.street, addr.city, addr.state, addr.pincode]
        .filter(Boolean)
        .join(", ");
    } else {
      addressDisplay = infraData.address;
    }
  }

  const infoContent = `
    <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 20px; margin-right: 8px;">🏢</span>
          <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
        </div>
        <p style="margin: 0; font-size: 12px; opacity: 0.9;">Infrastructure</p>
      </div>
      <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
          <span style="color: #6B7280; font-weight: 500;">📍 Type:</span>
          <span style="color: #1F2937; font-weight: 600;">${infraData.type || "N/A"}</span>

          <span style="color: #6B7280; font-weight: 500;">🔢 Unique ID:</span>
          <span style="color: #1F2937; font-weight: 600;">${infraData.uniqueId || "N/A"}</span>

          <span style="color: #6B7280; font-weight: 500;">🌐 Network ID:</span>
          <span style="color: #1F2937; font-weight: 600;">${infraData.networkId || "N/A"}</span>

          <span style="color: #6B7280; font-weight: 500;">📌 Coordinates:</span>
          <span style="color: #1F2937; font-weight: 600; font-family: monospace;">${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}</span>
        </div>
      </div>
      ${addressDisplay ? `
      <div style="background: #EFF6FF; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3B82F6;">
        <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>📫 Address:</strong><br/>${addressDisplay}</p>
      </div>
      ` : ""}
      ${infraData.contactPerson ? `
      <div style="background: #F0FDF4; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #10B981;">
        <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>👤 Contact:</strong> ${infraData.contactPerson}</p>
        ${infraData.contactNumber ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #1F2937;"><strong>📞 Phone:</strong> ${infraData.contactNumber}</p>` : ""}
      </div>
      ` : ""}
      ${infraData.description || infraData.notes ? `
      <div style="background: #FEF3C7; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #F59E0B;">
        <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>📝 Description:</strong><br/>${infraData.description || infraData.notes}</p>
      </div>
      ` : ""}
      ${createBookmarkButton(entry.id)}
      <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 8px;">
        <p style="margin: 0; font-size: 11px; color: #9CA3AF; text-align: center;">⏰ Created: ${new Date(entry.createdAt).toLocaleString()}</p>
      </div>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({ content: infoContent });
  marker.addListener("click", () => infoWindow.open(map, marker));
  infoWindow.open(map, marker); // Auto-open

  // Add bookmark functionality
  google.maps.event.addListenerOnce(infoWindow, "domready", () => {
    const bookmarkBtn = document.getElementById(`bookmark-btn-${entry.id}`);
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", () => {
        addBookmark({
          name: entry.name,
          type: "savedData", // Infrastructure mapped to savedData
          location: coordinates,
          description: infraData.description || infraData.notes,
          data: { type: "Infrastructure", ...infraData }, // Preserve original type in data
        });
        showToast.success("Bookmark added successfully!");
      });
    }
  });

  overlays.push(marker);
};

