import React, { useState, useRef, useEffect } from "react";
import { MapSearchButtonProps, SearchIcon, CloseIcon, LocationIcon, createInfoWindowContent } from "./MapSearchButtonUtils";

const MapSearchButton: React.FC<MapSearchButtonProps> = ({ map }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchMarker = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (map && window.google?.maps?.places) {
      if (!autocompleteService.current) autocompleteService.current = new google.maps.places.AutocompleteService();
      if (!placesService.current) placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [map]);

  useEffect(() => { if (isExpanded && searchInputRef.current) searchInputRef.current.focus(); }, [isExpanded]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length < 2) { setPredictions([]); return; }
    if (!autocompleteService.current) return;
    setIsSearching(true);
    autocompleteService.current.getPlacePredictions({ input: value, componentRestrictions: { country: "in" } }, (results, status) => {
      setIsSearching(false);
      setPredictions(status === google.maps.places.PlacesServiceStatus.OK && results ? results : []);
    });
  };

  const handlePlaceSelect = (placeId: string) => {
    if (!placesService.current || !map) return;
    placesService.current.getDetails({ placeId, fields: ["name", "geometry", "formatted_address"] }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        if (searchMarker.current) searchMarker.current.setMap(null);
        searchMarker.current = new google.maps.Marker({ position: place.geometry.location, map, title: place.name, animation: google.maps.Animation.DROP });
        const infoWindow = new google.maps.InfoWindow({ content: createInfoWindowContent(place.name, place.formatted_address) });
        infoWindow.open(map, searchMarker.current);
        setSearchQuery(""); setPredictions([]); setIsExpanded(false);
      }
    });
  };

  const handleClear = () => { setSearchQuery(""); setPredictions([]); searchInputRef.current?.focus(); };
  const handleClose = () => { setIsExpanded(false); setSearchQuery(""); setPredictions([]); };

  if (!isExpanded) {
    return (
      <div className="relative">
        <button onClick={() => setIsExpanded(true)} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Search Places">
          <SearchIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Keep the search button visible */}
      <button onClick={() => setIsExpanded(false)} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-30" title="Close Search">
        <SearchIcon />
      </button>
      
      {/* Expanded search box */}
      <div className="absolute left-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20 w-80">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search places in India..." className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {searchQuery && <button onClick={handleClear} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon className="w-4 h-4" /></button>}
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Close"><CloseIcon /></button>
          </div>
        </div>

        {predictions.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {predictions.map((prediction) => (
              <button key={prediction.place_id} onClick={() => handlePlaceSelect(prediction.place_id)} className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-start space-x-2">
                  <LocationIcon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{prediction.structured_formatting.main_text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{prediction.structured_formatting.secondary_text}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>Searching...</div>}
        {searchQuery.length >= 2 && !isSearching && predictions.length === 0 && <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No places found</div>}
        {searchQuery.length < 2 && predictions.length === 0 && <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Type to search for places in India</div>}
      </div>
    </div>
  );
};

export default MapSearchButton;


