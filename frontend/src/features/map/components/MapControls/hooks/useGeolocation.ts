/**
 * Custom hook for geolocation functionality
 * Handles getting user's current location using Browser Geolocation API (GPS/Wi-Fi),
 * falls back to Google Maps Geolocation API (IP-based) if needed.
 * Renders an accuracy radius circle like Google Earth.
 */

import { useRef, useState } from 'react';
import { USER_LOCATION_ZOOM } from '../constants';
import { createLocationMarker, LocationMarkerResult } from '../utils';
import type { GeolocationPosition } from '../types';
import { showToast } from '../../../../../utils/toastUtils';

const getInfoWindowContent = (latLng: any, title: string, address: string, components: any) => {
  const activeColor = "#10B981"; 
  return `
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
              background: linear-gradient(135deg, ${activeColor} 0%, #059669 100%);
              padding:10px 14px;
              display:flex;
              justify-content:space-between;
              align-items:center;
              border-bottom:1px solid var(--iw-main-border);
            ">
              <div style="display:flex;align-items:center;gap:6px;">
                <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span style="font-size:13px;font-weight:700;color:white;">${title}</span>
              </div>
              <button id="live-location-close-btn" style="background:none;border:none;cursor:pointer;color:white;font-size:14px;padding:0;display:flex;align-items:center;justify-content:center;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.7)'" onmouseout="this.style.color='white'" title="Close">✕</button>
            </div>

            <!-- Main Content Body -->
            <div style="padding:10px 12px; text-align:center;">
              <!-- Full Address Block -->
              <div 
                id="full-addr-block"
                onclick="window.copyInspectorText(\`${address.replace(/'/g, "\\'")}\`, 'copy-addr-icon', 'Full Address copied!')" 
                style="margin-bottom:10px;background:var(--iw-bg);border:1px solid var(--iw-border);border-radius:6px;padding:6px 8px;cursor:copy;transition:all 0.2s;"
                onmouseover="this.style.backgroundColor='rgba(128,128,128,0.05)';"
                onmouseout="this.style.backgroundColor='var(--iw-bg)';"
                title="Click to copy full address"
              >
                <div style="font-size:11px;line-height:1.3;font-weight:600;color:var(--iw-text-main);display:flex;align-items:center;justify-content:center;gap:6px;">
                  <span>${address}</span>
                  <span id="copy-addr-icon" style="font-size:12px;opacity:0.6;">📋</span>
                </div>
              </div>

              <!-- 2-Column Grid (Compact & Centered) -->
              <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;margin-bottom:10px;">
                ${components?.city ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">City</div><div style="font-weight:700;color:var(--iw-text-main);">${components.city}</div></div>` : ""}
                ${components?.state ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">State</div><div style="font-weight:700;color:var(--iw-text-main);">${components.state}</div></div>` : ""}
                ${components?.country ? `<div style="font-size:10px;line-height:1.2;text-align:center;"><div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">Country</div><div style="font-weight:700;color:var(--iw-text-main);">${components.country}</div></div>` : ""}
                ${components?.pincode ? `
                  <div 
                    onclick="window.copyInspectorText('${components.pincode}', 'copy-pin-icon', 'Postal Code copied!')" 
                    style="font-size:10px;line-height:1.2;text-align:center;cursor:copy;transition:all 0.2s;border-radius:4px;"
                    onmouseover="this.style.backgroundColor='rgba(128,128,128,0.08)';"
                    onmouseout="this.style.backgroundColor='transparent';"
                    title="Click to copy ZIP"
                  >
                    <div style="color:var(--iw-text-label);font-weight:600;margin-bottom:2px;">ZIP</div>
                    <div style="font-weight:700;color:var(--iw-text-main);display:flex;align-items:center;justify-content:center;gap:4px;">
                      ${components.pincode}
                      <span id="copy-pin-icon" style="font-size:10px;opacity:0.6;">📋</span>
                    </div>
                  </div>` : ""}
              </div>

              <!-- Coordinates & Link Row -->
              <div style="display:flex;gap:6px;">
                <!-- Coordinates -->
                <div 
                  onclick="window.copyInspectorText('${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}', 'copy-coord-icon', 'Coordinates copied!')" 
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
                  <span>${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}</span>
                  <span id="copy-coord-icon" style="font-size:12px;opacity:0.8;">📋</span>
                </div>

                <!-- Copy Map Link -->
                <button 
                  onclick="window.copyInspectorText('https://www.google.com/maps?q=${latLng.lat},${latLng.lng}', 'copy-link-icon', 'Google Maps Link copied!')" 
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

              <!-- Accuracy Radius -->
              ${latLng.accuracy ? `
                <div style="margin-top:8px;font-size:10px;line-height:1.2;text-align:center;color:var(--iw-text-label);">
                  Accuracy Radius: <span style="color:#059669;font-weight:700;">± ${latLng.accuracy.toFixed(1)} meters</span>
                </div>
              ` : ""}
            </div>
          </div>
  `;
};

export const useGeolocation = (map: google.maps.Map | null) => {
  const locationRef = useRef<LocationMarkerResult | null>(null);
  const [hasLocationMarker, setHasLocationMarker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  /**
   * Remove the current location marker + accuracy circle from the map
   */
  const clearLocationMarker = () => {
    if (locationRef.current) {
      locationRef.current.marker.setMap(null);
      if (locationRef.current.circle) {
        locationRef.current.circle.setMap(null);
      }
      locationRef.current = null;
    }
    setHasLocationMarker(false);
  };

  /**
   * Get User's Live Location
   * Prioritizes browser geolocation for maximum precision (GPS/Wi-Fi), 
   * falls back to Google Maps Geolocation API (IP-based) if needed.
   */
  const getUserLocation = async () => {
    if (!map) return;

    // Clear any existing location marker before placing a new one
    clearLocationMarker();
    setIsLocating(true);

    // 1. Try Browser Geolocation first (Most Accurate: Uses GPS/Wi-Fi)
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy, // Accuracy radius in meters
            }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Increased timeout to 10s for GPS lock
          );
        });

        map.setCenter(position);
        map.setZoom(USER_LOCATION_ZOOM);

        const result = createLocationMarker(map, position, 'Your Location (GPS)');
        locationRef.current = result;
        setHasLocationMarker(true);

        // Dynamic Geocoding Address resolution for live GPS location
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: position },
            (
              results: google.maps.GeocoderResult[] | null,
              status: google.maps.GeocoderStatus
            ) => {
              let address = "Location details could not be resolved.";
              let components: any = {};
              if (status === "OK" && results && results[0]) {
                address = results[0].formatted_address;
                let city = "", state = "", country = "", pincode = "";
                for (const component of results[0].address_components) {
                  if (component.types.includes("postal_code")) pincode = component.long_name;
                  if (component.types.includes("locality")) city = component.long_name;
                  if (!city && component.types.includes("administrative_area_level_2")) city = component.long_name;
                  if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                  if (component.types.includes("country")) country = component.long_name;
                }
                components = { city, state, country, pincode };
              }
              
              const infoWindow = new google.maps.InfoWindow({
                content: getInfoWindowContent(position, "Your Live Location (GPS)", address, components),
                disableAutoPan: true,
              });

              infoWindow.open({ anchor: result.marker, map, shouldFocus: false });

              // Bind custom close button on DOM ready
              google.maps.event.addListener(infoWindow, 'domready', () => {
                const btn = document.getElementById('live-location-close-btn');
                if (btn) {
                  btn.onclick = () => {
                    infoWindow.close();
                  };
                }
              });

              // Click listener to reopen
              result.marker.addListener('click', () => {
                infoWindow.open({ anchor: result.marker, map, shouldFocus: false });
              });
            }
          );
        }

        setIsLocating(false);
        return;
      } catch (error) {
        console.warn('Browser geolocation failed or was denied, trying fallback:', error);
      }
    }

    // 2. Fallback to Google Maps Geolocation API (Less Accurate: IP-based)
    const apiKey =
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      'AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ';

    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // If Google IP API returns a massive accuracy (e.g. 200,000m for a whole state),
        // we cap it or hide it, so it doesn't draw a ridiculous circle over the map.
        const rawAccuracy = data.accuracy || 5000;
        const displayAccuracy = rawAccuracy > 2000 ? 0 : rawAccuracy;

        const pos: GeolocationPosition = {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: displayAccuracy,
        };

        map.setCenter(pos);
        map.setZoom(USER_LOCATION_ZOOM);

        const result = createLocationMarker(map, pos, 'Your Location (Approximate)');
        locationRef.current = result;
        setHasLocationMarker(true);

        // Dynamic Geocoding Address resolution for live IP-based location
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: pos },
            (
              results: google.maps.GeocoderResult[] | null,
              status: google.maps.GeocoderStatus
            ) => {
              let address = "Location details could not be resolved.";
              let components: any = {};
              if (status === "OK" && results && results[0]) {
                address = results[0].formatted_address;
                let city = "", state = "", country = "", pincode = "";
                for (const component of results[0].address_components) {
                  if (component.types.includes("postal_code")) pincode = component.long_name;
                  if (component.types.includes("locality")) city = component.long_name;
                  if (!city && component.types.includes("administrative_area_level_2")) city = component.long_name;
                  if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                  if (component.types.includes("country")) country = component.long_name;
                }
                components = { city, state, country, pincode };
              }
              
              const infoWindow = new google.maps.InfoWindow({
                content: getInfoWindowContent(pos, "Your Live Location (Approximate)", address, components),
                disableAutoPan: true,
              });

              infoWindow.open({ anchor: result.marker, map, shouldFocus: false });

              // Bind custom close button on DOM ready
              google.maps.event.addListener(infoWindow, 'domready', () => {
                const btn = document.getElementById('live-location-close-btn');
                if (btn) {
                  btn.onclick = () => {
                    infoWindow.close();
                  };
                }
              });

              // Click listener to reopen
              result.marker.addListener('click', () => {
                infoWindow.open({ anchor: result.marker, map, shouldFocus: false });
              });
            }
          );
        }
      } else {
        throw new Error('Google Geolocation API failed');
      }
    } catch (error) {
      console.error('All geolocation methods failed:', error);
      showToast.error('Could not determine your location. Please ensure location services are enabled.');
    } finally {
      setIsLocating(false);
    }
  };

  return { getUserLocation, clearLocationMarker, hasLocationMarker, isLocating };
};
