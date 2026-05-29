import React, { useState, useEffect, useRef } from "react";
import { X, Check, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleMaps } from "../../../../contexts/GoogleMapsContext";
import { useAppDispatch } from "../../../../store/index";
import { setMapInstance } from "../../../../store/slices/mapSlice";
import { useTheme } from "../../../../contexts/ThemeContext";
import { darkMapStyle } from "../../../map/utils/mapStyles";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: string, lng: string) => void;
  initialLat?: string;
  initialLng?: string;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}) => {
  const { isLoaded, createMap } = useGoogleMaps();
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [center, setCenter] = useState({
    lat: parseFloat(initialLat || "19.0760"),
    lng: parseFloat(initialLng || "72.8777"),
  });

  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize Map
  useEffect(() => {
    if (isOpen && isLoaded && mapContainerRef.current && !mapRef.current) {
      const map = createMap(mapContainerRef.current, {
        center: center,
        zoom: 15,
        mapTypeId: "roadmap",
        disableDefaultUI: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true, // Enable Map Type Selector
        mapTypeControlOptions: {
          position: window.google?.maps?.ControlPosition?.TOP_RIGHT,
        },
        zoomControl: true,
        styles: isDarkMode ? darkMapStyle : [],
      });

      if (map) {
        mapRef.current = map;
        // Update Center Coordinates LIVE during drag
        map.addListener("center_changed", () => {
          const newCenter = map.getCenter();
          if (newCenter) {
            setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
          }
        });

        // Live Cursor Coordinates
        map.addListener("mousemove", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            setCursorCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        });

        // Clear cursor text when mouse leaves map
        map.addListener("mouseout", () => {
          setCursorCoords(null);
        });
      }
    }
    return () => {
      if (!isOpen && mapRef.current) {
        mapRef.current = null;
        // Critical: Clear Redux Map Instance
        dispatch(setMapInstance(null));
      }
    };
  }, [isOpen, isLoaded, createMap, dispatch]);

  // Dynamic Map Theme
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({ styles: isDarkMode ? darkMapStyle : [] });
    }
  }, [isDarkMode]);

  // --- Search Logic (Replotted from GlobalSearch.tsx) ---
  const parseCoordinates = (input: string) => {
    // 1. Standard Decimal: "23.0225, 72.5714"
    const decimalMatch = input.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (decimalMatch) {
      return {
        lat: parseFloat(decimalMatch[1]),
        lng: parseFloat(decimalMatch[3]),
      };
    }
    // 2. Degree with Direction: "18.95 N, 72.83 E"
    const cleanInput = input.trim().toUpperCase();
    const ddMatch = cleanInput.match(
      /^(-?\d+(\.\d*)?)[\s°]*([NS])?[,\s]*(-?\d+(\.\d*)?)[\s°]*([EW])?$/,
    );
    if (ddMatch) {
      let lat = parseFloat(ddMatch[1]);
      let lng = parseFloat(ddMatch[4]);
      if (ddMatch[3] === "S") lat = -Math.abs(lat);
      if (ddMatch[6] === "W") lng = -Math.abs(lng);
      return { lat, lng };
    }
    return null;
  };

  const handleSearch = (value: string) => {
    setQuery(value);

    // Instant check for coordinates
    const coords = parseCoordinates(value);
    if (coords) {
      if (mapRef.current) {
        mapRef.current.setCenter(coords);
        mapRef.current.setZoom(18);
        setCenter(coords); // Update state to reflect
      }
      return;
    }

    setShowResults(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => performSearch(value), 500);
  };

  const performSearch = async (searchText: string) => {
    setIsSearching(true);
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    let combinedResults: any[] = [];

    // Double check coords just in case (e.g. paste)
    const coords = parseCoordinates(searchText);
    if (coords) {
      setResults([
        {
          id: "coord-direct",
          mainText: `${coords.lat}, ${coords.lng}`,
          secondaryText: "Coordinate Location",
          location: coords,
          type: "coordinate",
        },
      ]);
      setIsSearching(false);
      return;
    }

    try {
      // 1. Places API (New) - fetch logic from GlobalSearch
      if (apiKey) {
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
              textQuery: `${searchText} India`,
              maxResultCount: 5,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.places) {
            combinedResults = data.places.map((place: any) => ({
              id: place.id,
              mainText: place.displayName?.text || "Unknown",
              secondaryText: place.formattedAddress || "",
              location: place.location,
              type: "api",
            }));
          }
        }
      }

      // 2. Geocoder Fallback
      if (combinedResults.length === 0 && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        await new Promise<void>((resolve) => {
          geocoder.geocode(
            { address: searchText, componentRestrictions: { country: "IN" } },
            (
              results: google.maps.GeocoderResult[] | null,
              status: google.maps.GeocoderStatus,
            ) => {
              if (status === "OK" && results) {
                const geoResults = results
                  .slice(0, 5)
                  .map((r: google.maps.GeocoderResult) => ({
                    id: r.place_id,
                    mainText: r.formatted_address,
                    secondaryText: "Geocode Result",
                    location: {
                      lat: r.geometry.location.lat(),
                      lng: r.geometry.location.lng(),
                    },
                    type: "geocode",
                  }));
                combinedResults = [...combinedResults, ...geoResults];
              }
              resolve();
            },
          );
        });
      }
    } catch (e) {
      console.error("Search failed", e);
    }

    setResults(combinedResults);
    setIsSearching(false);
  };

  const selectResult = (result: any) => {
    if (mapRef.current && result.location) {
      const lat = result.location.latitude || result.location.lat;
      const lng = result.location.longitude || result.location.lng;
      mapRef.current.setCenter({ lat, lng });
      mapRef.current.setZoom(17);
      setQuery(result.mainText);
      setShowResults(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-[95vw] h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pick Location
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag map to position pin or search
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
              >
                <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              </button>
            </div>

            {/* Map & Search */}
            <div className="flex-1 relative bg-gray-100 dark:bg-slate-900">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center pb-8">
                <div className="relative">
                  <MapPin className="w-12 h-12 text-red-600 fill-red-600 drop-shadow-xl" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-2 bg-black/20 rounded-[100%] blur-[2px]"></div>
                </div>
              </div>

              {/* Custom Search Box */}
              <div className="absolute top-6 left-6 z-30 w-80 md:w-96">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search places..."
                    className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                  />
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                  <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => selectResult(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {result.mainText}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.secondaryText}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Coordinates - Bottom Left */}
              <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-1 items-start pointer-events-none">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 shadow-lg border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-red-600">LAT:</span>{" "}
                  {center.lat.toFixed(6)} &nbsp;
                  <span className="font-bold text-red-600">LNG:</span>{" "}
                  {center.lng.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 z-10">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  onConfirm(center.lat.toFixed(6), center.lng.toFixed(6))
                }
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" /> Confirm Location
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(LocationPickerModal);

