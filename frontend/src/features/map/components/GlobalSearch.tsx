import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/index";
import { MapMarker, selectMarker } from "../../../store/slices/mapSlice";
import { TelecomTower } from "../../../store/slices/data/types";

import { useSearchParams } from "react-router-dom";

interface GlobalSearchProps {
  map: google.maps.Map | null;
}

type SearchCategory = "all" | "places" | "coordinates";

const GlobalSearch: React.FC<GlobalSearchProps> = ({ map }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchOpenUrl = searchParams.get("search") === "open";
  const [isOpen, setIsOpen] = useState(searchOpenUrl);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [hasSearchPin, setHasSearchPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const dispatch = useAppDispatch();

  // Sync state to URL and vice-versa
  useEffect(() => {
    if (searchOpenUrl !== isOpen) {
      setIsOpen(searchOpenUrl);
    }
  }, [searchOpenUrl]);

  const handleOpenSearch = () => {
    setIsOpen(true);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("search", "open");
    setSearchParams(newParams, { replace: true });
  };

  const handleCloseSearch = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams, { replace: true });
  };





  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const parseCoordinates = (input: string) => {
    // Standardize input: trim, handle special dashes, and normalize symbols
    const clean = input.trim().replace(/[\u2013\u2014]/g, "-").replace(/[″″]/g, '"').replace(/[′′]/g, "'");

    // 1. GeoJSON [lng, lat]
    const geojsonMatch = clean.match(/^\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]$/);
    if (geojsonMatch) {
      return { lat: parseFloat(geojsonMatch[2]), lng: parseFloat(geojsonMatch[1]) };
    }

    // 2. Google Maps / Geo URI / URL Extraction
    if (clean.includes('google') || clean.includes('maps') || clean.startsWith('geo:')) {
      const match = clean.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
      if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // 3. DMS (Degrees Minutes Seconds): 23°01'21"N 72°34'17"E
    // We look for three numeric groups for each coordinate
    const dmsRegex = /(\d+)[^\d\.]+?(\d+)[^\d\.]+?([\d\.]+)[^\d\.]*?([NS])[\s,]+(\d+)[^\d\.]+?(\d+)[^\d\.]+?([\d\.]+)[^\d\.]*?([EW])/i;
    const dmsMatch = clean.match(dmsRegex);
    if (dmsMatch) {
      const toDec = (d: string, m: string, s: string, dir: string) => {
        let val = parseInt(d) + parseInt(m) / 60 + parseFloat(s) / 3600;
        if (dir.toUpperCase() === 'S' || dir.toUpperCase() === 'W') val = -val;
        return val;
      };
      return {
        lat: toDec(dmsMatch[1], dmsMatch[2], dmsMatch[3], dmsMatch[4]),
        lng: toDec(dmsMatch[5], dmsMatch[6], dmsMatch[7], dmsMatch[8])
      };
    }

    // 4. DDM (Degrees Decimal Minutes): 23°01.350'N 72°34.283'E
    // We look for two numeric groups for each coordinate
    const ddmRegex = /(\d+)[^\d\.]+?([\d\.]+)[^\d\.]*?([NS])[\s,]+(\d+)[^\d\.]+?([\d\.]+)[^\d\.]*?([EW])/i;
    const ddmMatch = clean.match(ddmRegex);
    if (ddmMatch) {
      const toDec = (d: string, m: string, dir: string) => {
        let val = parseInt(d) + parseFloat(m) / 60;
        if (dir.toUpperCase() === 'S' || dir.toUpperCase() === 'W') val = -val;
        return val;
      };
      return {
        lat: toDec(ddmMatch[1], ddmMatch[2], ddmMatch[3]),
        lng: toDec(ddmMatch[4], ddmMatch[5], ddmMatch[6])
      };
    }

    // 5. Cardinal Decimal: 23.0225N 72.5714E
    const cardRegex = /(-?[\d\.]+)\s*([NS])[\s,]+(-?[\d\.]+)\s*([EW])/i;
    const cardMatch = clean.match(cardRegex);
    if (cardMatch) {
      let lat = Math.abs(parseFloat(cardMatch[1]));
      let lng = Math.abs(parseFloat(cardMatch[3]));
      if (cardMatch[2].toUpperCase() === 'S') lat = -lat;
      if (cardMatch[4].toUpperCase() === 'W') lng = -lng;
      return { lat, lng };
    }

    // 6. Plain Decimals: 23.0225, 72.5714
    const plainRegex = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
    const plainMatch = clean.match(plainRegex);
    if (plainMatch) {
      return { lat: parseFloat(plainMatch[1]), lng: parseFloat(plainMatch[2]) };
    }

    // 7. Last resort fallback: just find two decimal numbers separated by something
    // This handles cases where symbols might be totally unexpected
    const fallbackRegex = /(-?\d+\.\d+)[^\d\-]+?(-?\d+\.\d+)/;
    const fallbackMatch = clean.match(fallbackRegex);
    if (fallbackMatch) {
       return { lat: parseFloat(fallbackMatch[1]), lng: parseFloat(fallbackMatch[2]) };
    }

    return null;
  };

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    let combinedResults: any[] = [];
    const normalizedQuery = searchQuery.toLowerCase();

    // 1. Coordinate Search - Always check if it's a coordinate regardless of category
    const coords = parseCoordinates(searchQuery);
    if (
      coords &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180
    ) {
        combinedResults.push({
          place_id: `coord-${coords.lat}-${coords.lng}`,
          structured_formatting: {
            main_text: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
            secondary_text: "Jump to Coordinates",
          },
          location: { latitude: coords.lat, longitude: coords.lng },
          isDirectLocation: true,
          type: "coordinate",
        });
      }

    // 3. API Search (Places + Geocoder)
    if (activeCategory === "all" || activeCategory === "places") {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        let apiResults: any[] = [];

        const coords = parseCoordinates(searchQuery);

        // Places API
        if (apiKey && !coords) {
          try {
            const response = await fetch(
              `https://places.googleapis.com/v1/places:searchText`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Goog-Api-Key": apiKey,
                  "X-Goog-FieldMask":
                    "places.displayName,places.formattedAddress,places.location,places.id",
                },
                body: JSON.stringify({
                  textQuery: `${searchQuery} India`,
                  maxResultCount: 5,
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.places) {
                apiResults = data.places.map((place: any) => ({
                  place_id: place.id,
                  structured_formatting: {
                    main_text: place.displayName?.text || "Unknown Place",
                    secondary_text: place.formattedAddress || "",
                  },
                  location: place.location,
                  isDirectLocation: true,
                  type: "api",
                }));
              }
            } else {
              console.warn("Places API response not OK, falling back to Geocoder");
            }
          } catch (placesError) {
            console.warn("Places API error, using Geocoding fallback:", placesError);
          }
        }

        // Geocoder Fallback
        if (
          apiResults.length === 0 &&
          window.google?.maps?.Geocoder &&
          !coords
        ) {
          const geocoder = new window.google.maps.Geocoder();
          await new Promise<void>((resolve) => {
            geocoder.geocode(
              {
                address: searchQuery,
                componentRestrictions: { country: "IN" },
              },
              (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
              ) => {
                if (status === "OK" && results) {
                  const geoResults = results
                    .slice(0, 5)
                    .map((r: google.maps.GeocoderResult) => ({
                      place_id: r.place_id,
                      structured_formatting: {
                        main_text:
                          r.address_components[0]?.long_name ||
                          r.formatted_address,
                        secondary_text: r.formatted_address,
                      },
                      location: {
                        latitude: r.geometry.location.lat(),
                        longitude: r.geometry.location.lng(),
                      },
                      isDirectLocation: true,
                      type: "api",
                    }));
                  apiResults = geoResults;
                }
                resolve();
              }
            );
          });
        }
        combinedResults = [...combinedResults, ...apiResults];
      } catch (error) {
        console.error("General API Search Error:", error);
      }
    }

    setResults(combinedResults);
    setIsLoading(false);
  };

  const handleSearch = (value: string) => {
    setQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    // Instant search for coordinates
    const coords = parseCoordinates(value);
    if (
      (activeCategory === "all" || activeCategory === "coordinates") &&
      coords
    ) {
      searchPlaces(value);
      return;
    }

    if (value.length < 2) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = async (place: any) => {
    if (!map) return;

    // Ensure location exists
    let lat = place.location?.latitude || place.location?.lat;
    let lng = place.location?.longitude || place.location?.lng;

    if (!lat || !lng) {
      console.warn("Invalid location for place", place);
      return;
    }

    try {
      const { apiClient } = await import("../../../services/api/client");
      await apiClient.post("/audit/logs", {
        action: `Searched Map: ${place.structured_formatting?.main_text || "Location"}`,
        resource_type: "MAP_SEARCHED",
        resource_id: place.place_id || "SEARCH",
        details: { 
          lat, 
          lng, 
          type: place.type, 
          query: place.structured_formatting?.main_text 
        }
      });
    } catch (e) {
      console.error("Failed to log map search", e);
    }

    const handleLocation = (
      location: { latitude: number; longitude: number },
      name: string,
      address: string,
      components?: { city?: string; state?: string; country?: string; pincode?: string }
    ) => {
      const pos = new google.maps.LatLng(location.latitude, location.longitude);
      map.setCenter(pos);
      map.setZoom(18);

      // Clear any previous search pin
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
        searchMarkerRef.current = null;
      }

      const activeColor = place?.type === "coordinate" ? "#3B82F6" : "#EA4335";
      
      // Beautiful Pin SVG to replace generic circle
      const pinSvg = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

      // Visual indicator — stored in ref for later removal
      const searchMarker = new google.maps.Marker({
        position: pos,
        map,
        title: name,
        animation: google.maps.Animation.DROP,
        icon: {
          path: pinSvg,
          fillColor: activeColor,
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "#ffffff",
          scale: 2.2,
          anchor: new google.maps.Point(12, 24),
          labelOrigin: new google.maps.Point(12, -4) // Shift label above the pin tightly
        },
        label: {
          text: name.length > 30 ? name.substring(0, 30) + "..." : name,
          color: "#1f2937",
          fontSize: "13px",
          fontWeight: "700",
          className: "bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 mb-6 whitespace-nowrap"
        }
      });
      searchMarkerRef.current = searchMarker;
      setHasSearchPin(true);

      const infoWindow = new google.maps.InfoWindow({
        content: `
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
                <span style="font-size:13px;font-weight:700;color:var(--iw-text-main);">${name.length > 30 ? name.substring(0, 30) + "..." : name}</span>
              </div>
              <button id="info-window-close-pin" style="background:none;border:none;cursor:pointer;color:var(--iw-text-label);font-size:14px;padding:0;display:flex;align-items:center;justify-content:center;transition:color 0.2s;" onmouseover="this.style.color='red'" onmouseout="this.style.color='var(--iw-text-label)'" title="Close">✕</button>
            </div>

            <!-- Main Content Body -->
            <div style="padding:10px 12px; text-align:center;">
              <!-- Full Address Block (Click to Copy) -->
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

              <!-- Coordinates & Link Row (Extremely Compact) -->
              <div style="display:flex;gap:6px;">
                <!-- Coordinates -->
                <div 
                  onclick="window.copyInspectorText('${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}', 'copy-coord-icon', 'Coordinates copied!')" 
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
                  <span>${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</span>
                  <span id="copy-coord-icon" style="font-size:12px;opacity:0.8;">📋</span>
                </div>

                <!-- Copy Map Link -->
                <button 
                  onclick="window.copyInspectorText('https://www.google.com/maps?q=${location.latitude},${location.longitude}', 'copy-link-icon', 'Google Maps Link copied!')" 
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
        `,
      });
      
      // Open InfoWindow automatically on selection
      infoWindow.open({ anchor: searchMarker, map, shouldFocus: false });

      // Open InfoWindow when the user clicks the marker later
      searchMarker.addListener("click", () => {
        infoWindow.open({ anchor: searchMarker, map, shouldFocus: false });
      });

      // Bind the custom clear pin button on DOM ready
      google.maps.event.addListener(infoWindow, "domready", () => {
        const btn = document.getElementById("info-window-close-pin");
        if (btn) {
          btn.onclick = () => {
            infoWindow.close();
          };
        }
      });
 
      handleCloseSearch();
    };



    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
        let resolvedAddress = place.structured_formatting?.secondary_text || "Location Details";
        let components = {};
        if (status === "OK" && results && results[0]) {
          resolvedAddress = results[0].formatted_address;
          
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
        handleLocation(
          { latitude: lat, longitude: lng },
          place.structured_formatting.main_text,
          resolvedAddress,
          components
        );
      });
    } else if (place.isDirectLocation) {
      handleLocation(
        { latitude: lat, longitude: lng },
        place.structured_formatting.main_text,
        place.structured_formatting.secondary_text
      );
    } else {
      // Legacy fallback
      const services = new google.maps.places.PlacesService(map);
      services.getDetails({ placeId: place.place_id }, (details, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          details?.geometry?.location
        ) {
          handleLocation(
            {
              latitude: details.geometry.location.lat(),
              longitude: details.geometry.location.lng(),
            },
            details.name || "Location",
            details.formatted_address || ""
          );
        }
      });
    }
  };

  // Remove search pin from map
  const clearSearchPin = () => {
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = null;
    }
    setHasSearchPin(false);
  };

  return (
    <div className="relative font-sans text-gray-800 dark:text-gray-100 flex items-center justify-center h-full">
      {/* Remove Pin button — visible when search is collapsed and a pin exists */}
      {!isOpen && hasSearchPin && (
        <button
          onClick={clearSearchPin}
          className="w-8 h-8 mr-1 flex-shrink-0 flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded-lg shadow-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
          title="Remove Search Pin"
          aria-label="Remove search pin from map"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div 
        className={`flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-slate-200/50 dark:border-white/10 transition-all duration-300 z-40 rounded-xl overflow-hidden ${
          isOpen ? "w-[320px]" : "w-[36px]"
        }`}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleOpenSearch(); }}
          className={`group relative ${isOpen ? 'w-8' : 'w-full'} h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300 z-10 ${
            isOpen 
              ? "text-blue-600 cursor-default" 
              : "text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-white/60 dark:hover:bg-slate-700/60 cursor-pointer"
          } outline-none`}
          title="Search Places"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? '' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isOpen ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {/* Red badge when pin is active */}
          {hasSearchPin && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search places..."
          className={`min-w-0 flex-1 !bg-transparent border-none !border-transparent text-xs font-semibold text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 !shadow-none p-0 pl-1 outline-none transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          disabled={!isOpen}
        />

        {isOpen && query.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setQuery(""); setResults([]); }}
            className="w-7 h-8 flex-shrink-0 flex justify-center items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/60 dark:hover:bg-slate-700/60"
            title="Clear text"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCloseSearch(); }}
            className="w-8 h-8 flex-shrink-0 flex justify-center items-center text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 cursor-pointer group rounded-lg ml-0.5"
            title="Close Search"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* The absolute dropdown for results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-[48px] right-0 z-50 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            {/* Results List */}
            <div className="max-h-[320px] overflow-y-auto bg-white dark:bg-gray-800">
              {results.length > 0 || isLoading ? (
                <>
                  {isLoading && (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Searching...</span>
                    </div>
                  )}

                  {!isLoading &&
                    results.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => selectPlace(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 flex items-center gap-3 group"
                      >
                        {/* Results Icon */}
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border transition-colors flex-shrink-0 ${
                            result.type === "coordinate"
                              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400 group-hover:bg-blue-100"
                              : "bg-red-50 border-red-200 text-red-500 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400 group-hover:bg-red-100"
                          }`}
                        >
                          {result.type === "coordinate" ? (
                            <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
                              {result.structured_formatting.main_text}
                            </p>
                            {result.type === "coordinate" && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border flex-shrink-0 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                Coords
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {result.structured_formatting.secondary_text}
                          </p>
                        </div>
                      </button>
                    ))}
                </>
              ) : (
                !isLoading && (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50 m-3 text-center transition-all duration-300">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-300 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700/50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      No matching places found
                    </p>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                      We couldn't find anything matching "<strong>{query}</strong>".<br />
                      Try adjusting your spelling or category.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

