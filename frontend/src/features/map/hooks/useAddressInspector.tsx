import { useEffect, useRef } from "react";

export const useAddressInspector = (
  mapInstance: google.maps.Map | null,
  activeGISTool: string | null,
) => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!mapInstance) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 300,
        zIndex: 999999,
      });
    }

    // Global close and copy functions
    (window as any).closeAddressInspector = () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
    (window as any).copyInspectorText = (
      text: string,
      btnId: string,
      toastMessage: string = "Copied to clipboard!",
    ) => {
      navigator.clipboard.writeText(text);
      const btn = document.getElementById(btnId);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = "✅";
        setTimeout(() => {
          btn.innerHTML = orig;
        }, 1500);
      }

      // Create and animate Toast Notification
      const toast = document.createElement("div");
      toast.innerText = "✅  " + toastMessage;
      toast.style.position = "fixed";
      toast.style.bottom = "30px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%) translateY(20px)";
      toast.style.background = "rgba(16, 185, 129, 0.95)"; // Emerald green with slight transparency
      toast.style.backdropFilter = "blur(8px)";
      toast.style.color = "white";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "30px";
      toast.style.fontSize = "13px";
      toast.style.fontWeight = "700";
      toast.style.boxShadow = "0 10px 25px rgba(16, 185, 129, 0.3)";
      toast.style.opacity = "0";
      toast.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      toast.style.zIndex = "9999999";
      toast.style.pointerEvents = "none";

      document.body.appendChild(toast);

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });

      // Remove after delay
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 400);
      }, 2500);
    };

    const handleInspection = (
      e: google.maps.MapMouseEvent,
      isRightClick: boolean = false,
    ) => {
      // Prevent the browser's native right-click menu from appearing
      if (
        isRightClick &&
        e.domEvent &&
        typeof e.domEvent.preventDefault === "function"
      ) {
        e.domEvent.preventDefault();
      }

      // Check if user is holding ALT or SHIFT during a left-click
      const domEvent = e.domEvent as MouseEvent;
      const isModifierPressed =
        domEvent && (domEvent.altKey || domEvent.shiftKey);

      // Require right-click or a modifier (Alt/Shift) for left-click to trigger Address Inspector globally
      if (!isRightClick && !isModifierPressed) {
        return;
      }

      const latLng = e.latLng;

      if (!latLng) return;

      const geocoder = geocoderRef.current;
      const infoWindow = infoWindowRef.current;

      if (!geocoder || !infoWindow) return;

      // Compact Loading UI
      infoWindow.setContent(`
        <div style="
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 16px;
          min-width: 220px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.18);
          font-family: Inter, sans-serif;
        ">
          <div style="
            display:flex;
            align-items:center;
            gap:12px;
          ">
            <div style="
              width:18px;
              height:18px;
              border-radius:50%;
              border:3px solid #dbeafe;
              border-top-color:#2563eb;
              animation: spin 1s linear infinite;
            "></div>

            <div>
              <div style="
                font-size:14px;
                font-weight:700;
                color:#111827;
              ">
                Fetching Location
              </div>

              <div style="
                font-size:11px;
                color:#6b7280;
                margin-top:3px;
              ">
                Loading address details...
              </div>
            </div>
          </div>

          <style>
            @keyframes spin {
              100% {
                transform: rotate(360deg);
              }
            }
          </style>
        </div>
      `);

      infoWindow.setPosition(latLng);
      infoWindow.open(mapInstance);

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const result = results[0];

          // Center and adjust map to ensure InfoWindow is visible (accounting for Header/Toolbar)
          mapInstance.panTo(latLng);
          mapInstance.panBy(0, -120);

          let pincode = "Unavailable";
          let city = "";
          let district = "";
          let state = "";
          let country = "";

          for (const component of result.address_components) {
            if (component.types.includes("postal_code")) {
              pincode = component.long_name;
            }

            if (component.types.includes("locality")) {
              city = component.long_name;
            }

            if (component.types.includes("administrative_area_level_2")) {
              district = component.long_name;
            }

            if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }

            if (component.types.includes("country")) {
              country = component.long_name;
            }
          }

          infoWindow.setContent(`
            <div style="
              background:var(--iw-bg);
              border:1px solid var(--iw-main-border);
              border-radius:12px;
              padding:0;
              min-width:220px;
              max-width:280px;
              box-shadow:0 8px 24px rgba(0,0,0,0.15);
              font-family:Inter,sans-serif;
              color:var(--iw-text-main);
              overflow:hidden;
            ">
              <!-- Header Section -->
              <div style="
                background:var(--iw-accent-bg);
                padding:10px 14px;
                display:flex;
                justify-content:space-between;
                align-items:center;
                border-bottom:1px solid var(--iw-main-border);
              ">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:15px;">📍</span>
                  <span style="font-size:13px;font-weight:700;color:var(--iw-text-main);">Address Inspector</span>
                </div>
                <button onclick="window.closeAddressInspector()" style="background:none;border:none;cursor:pointer;color:var(--iw-text-label);font-size:14px;padding:0;display:flex;align-items:center;justify-content:center;transition:color 0.2s;" onmouseover="this.style.color='red'" onmouseout="this.style.color='var(--iw-text-label)'" title="Close">✕</button>
              </div>

              <!-- Main Content Body -->
              <div style="padding:10px 12px; text-align:center;">
                <!-- Full Address Block (Click to Copy) -->
                <div 
                  id="full-addr-block"
                  onclick="window.copyInspectorText(\`${result.formatted_address.replace(/'/g, "\\'")}\`, 'copy-addr-icon', 'Full Address copied!')" 
                  style="margin-bottom:10px;background:var(--iw-bg);border:1px solid var(--iw-border);border-radius:6px;padding:6px 8px;cursor:copy;transition:all 0.2s;"
                  onmouseover="this.style.backgroundColor='rgba(128,128,128,0.05)';"
                  onmouseout="this.style.backgroundColor='var(--iw-bg)';"
                  title="Click to copy full address"
                >
                  <div style="font-size:11px;line-height:1.3;font-weight:600;color:var(--iw-text-main);display:flex;align-items:center;justify-content:center;gap:6px;">
                    <span>${result.formatted_address}</span>
                    <span id="copy-addr-icon" style="font-size:12px;opacity:0.6;">📋</span>
                  </div>
                </div>

                <!-- 2-Column Grid (Compact & Centered) -->
                <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;margin-bottom:10px;">
                  ${city ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">City</div><div style="font-weight:700;color:var(--iw-text-main);">${city}</div></div>` : ""}
                  ${state ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">State</div><div style="font-weight:700;color:var(--iw-text-main);">${state}</div></div>` : ""}
                  ${country ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">Country</div><div style="font-weight:700;color:var(--iw-text-main);">${country}</div></div>` : ""}
                  ${
                    pincode && pincode !== "Unavailable"
                      ? `
                    <div 
                      onclick="window.copyInspectorText('${pincode}', 'copy-pin-icon', 'Postal Code copied!')" 
                      style="font-size:10px;line-height:1.2;text-align:center;cursor:copy;transition:all 0.2s;border-radius:4px;"
                      onmouseover="this.style.backgroundColor='rgba(128,128,128,0.08)';"
                      onmouseout="this.style.backgroundColor='transparent';"
                      title="Click to copy ZIP"
                    >
                      <div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">ZIP</div>
                      <div style="font-weight:700;color:var(--iw-text-main);display:flex;align-items:center;justify-content:center;gap:4px;">
                        ${pincode}
                        <span id="copy-pin-icon" style="font-size:10px;opacity:0.6;">📋</span>
                      </div>
                    </div>`
                      : ""
                  }
                </div>

                <!-- Coordinates & Link Row (Extremely Compact) -->
                <div style="display:flex;gap:6px;">
                  <!-- Coordinates -->
                  <div 
                    onclick="window.copyInspectorText('${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}', 'copy-coord-icon', 'Coordinates copied!')" 
                    style="
                      flex:1;
                      background:var(--iw-coord-bg);
                      color:var(--iw-coord-text);
                      border-radius:6px;
                      padding:6px;
                      font-family:monospace;
                      font-size:10px;
                      font-weight:700;
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      gap:6px;
                      border:1px solid var(--iw-border);
                      cursor:copy;
                      transition:all 0.2s;
                    "
                    onmouseover="this.style.transform='scale(1.02)';"
                    onmouseout="this.style.transform='scale(1)';"
                    title="Click to copy coordinates"
                  >
                    <span>${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}</span>
                    <span id="copy-coord-icon" style="font-size:12px;opacity:0.8;">📋</span>
                  </div>

                  <!-- Copy Map Link -->
                  <button 
                    onclick="window.copyInspectorText('https://www.google.com/maps?q=${latLng.lat()},${latLng.lng()}', 'copy-link-icon', 'Google Maps Link copied!')" 
                    style="
                      background:transparent;
                      color:var(--iw-text-main);
                      border:1px dashed var(--iw-border);
                      border-radius:6px;
                      padding:4px 8px;
                      font-size:10px;
                      font-weight:700;
                      display:flex;
                      justify-content:center;
                      align-items:center;
                      gap:4px;
                      cursor:pointer;
                      transition:all 0.2s;
                    "
                    onmouseover="this.style.backgroundColor='rgba(128,128,128,0.08)';"
                    onmouseout="this.style.backgroundColor='transparent';"
                    title="Copy Google Maps Link"
                  >
                    <span>🔗 Link</span>
                    <span id="copy-link-icon" style="font-size:10px;opacity:0.6;">📋</span>
                  </button>
                </div>
              </div>
            </div>
          `);
        } else {
          // Even if geocoding fails, center the view to show the error popup clearly
          mapInstance.panTo(latLng);
          mapInstance.panBy(0, -120);

          infoWindow.setContent(`
            <div style="
              background:var(--iw-bg);
              border-radius:16px;
              padding:18px;
              min-width:220px;
              box-shadow:0 10px 28px rgba(0,0,0,0.16);
              font-family:Inter,sans-serif;
              color:var(--iw-text-main);
            ">
              <div style="
                display:flex;
                align-items:center;
                gap:12px;
              ">
                <div style="
                  width:38px;
                  height:38px;
                  border-radius:12px;
                  background:var(--iw-accent-bg);
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:18px;
                ">
                  ⚠️
                </div>

                <div>
                  <div style="
                    font-size:14px;
                    font-weight:800;
                    color:var(--iw-accent-text);
                  ">
                    Address Not Found
                  </div>

                  <div style="
                    font-size:11px;
                    color:var(--iw-text-label);
                    margin-top:4px;
                    line-height:1.5;
                  ">
                    Unable to fetch address details.
                  </div>
                </div>
              </div>
            </div>
          `);
        }
      });
    };

    const clickListener = mapInstance.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => handleInspection(e, false),
    );
    const rightClickListener = mapInstance.addListener(
      "contextmenu",
      (e: google.maps.MapMouseEvent) => handleInspection(e, true),
    );

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(rightClickListener);
      delete (window as any).closeAddressInspector;
      delete (window as any).copyInspectorText;
    };
  }, [mapInstance, activeGISTool]);
};
