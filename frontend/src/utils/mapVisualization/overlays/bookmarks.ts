
import { deleteBookmark } from '../../../services/bookmark/index';
import { DataEntry } from '../types';

export const createBookmarkOverlay = (
  entry: DataEntry,
  map: google.maps.Map,
  overlays: google.maps.MVCObject[]
) => {
  const location = entry.data.location;
  if (location) {
    const marker = new google.maps.Marker({
      map: map,
      position: location,
      title: entry.name,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#F59E0B",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      label: {
        text: "⭐",
        color: "#FFFFFF",
        fontSize: "14px",
      },
    });

    const infoContent = `
      <div style="padding: 12px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 20px; margin-right: 8px;">⭐</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${entry.name}</h3>
          </div>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">Bookmarked Location</p>
        </div>
        ${entry.data.description ? `
        <div style="background: #EFF6FF; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3B82F6;">
          <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>📝 Description:</strong><br/>${entry.data.description}</p>
        </div>
        ` : ""}
        ${entry.data.category ? `
        <div style="background: #F0FDF4; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>🏷️ Category:</strong> ${entry.data.category}</p>
        </div>
        ` : ""}
        <div style="background: #F9FAFB; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 13px;">
            <span style="color: #6B7280; font-weight: 500;">📌 Coordinates:</span>
            <span style="color: #1F2937; font-weight: 600; font-family: monospace;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</span>
          </div>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
          <button id="delete-bookmark-${entry.id}" style="padding: 8px 16px; font-size: 13px; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">
            🗑️ Delete
          </button>
        </div>
        <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 8px;">
          <p style="margin: 0; font-size: 11px; color: #9CA3AF; text-align: center;">⏰ Created: ${new Date(entry.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
    marker.addListener("click", () => infoWindow.open(map, marker));
    infoWindow.open(map, marker); // Auto-open

    // Add delete functionality
    google.maps.event.addListenerOnce(infoWindow, "domready", () => {
      const deleteBtn = document.getElementById(`delete-bookmark-${entry.id}`);
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          // Create custom confirmation dialog
          const confirmDialog = document.createElement('div');
          confirmDialog.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              backdrop-filter: blur(4px);
            `;

          confirmDialog.innerHTML = `
              <div style="background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%; font-family: system-ui, -apple-system, sans-serif;">
                <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">⚠️</span>
                    <div>
                      <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Delete Bookmark</h3>
                      <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                <div style="padding: 24px;">
                  <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151;">
                    Are you sure you want to delete the bookmark <strong>"${entry.name}"</strong>?
                  </p>
                  <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-delete" style="padding: 10px 20px; font-size: 14px; background: #F3F4F6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                      Cancel
                    </button>
                    <button id="confirm-delete" style="padding: 10px 20px; font-size: 14px; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `;

          document.body.appendChild(confirmDialog);

          const confirmBtn = confirmDialog.querySelector('#confirm-delete');
          const cancelBtn = confirmDialog.querySelector('#cancel-delete');

          const removeDialog = () => {
            document.body.removeChild(confirmDialog);
          };

          confirmBtn?.addEventListener('click', () => {
            deleteBookmark(entry.id);
            marker.setMap(null);
            infoWindow.close();
            removeDialog();
            // Trigger a custom event to notify GlobalSearch to reload bookmarks
            window.dispatchEvent(new CustomEvent('bookmarkDeleted'));
          });

          cancelBtn?.addEventListener('click', removeDialog);
          confirmDialog.addEventListener('click', (e) => {
            if (e.target === confirmDialog) removeDialog();
          });
        });
      }
    });

    overlays.push(marker);
  }
};

