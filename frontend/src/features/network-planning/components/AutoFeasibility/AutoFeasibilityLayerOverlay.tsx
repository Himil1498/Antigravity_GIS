import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer, LineLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { ICON_DEFS, getIconKey } from '../NetworkMap/MapIcons';
import MapPopup from '../NetworkMap/MapPopup';

interface AutoFeasibilityLayerOverlayProps {
  map: google.maps.Map | null;
  results: any[];
  visible: boolean;
  onPointClick: (info: any) => void;
  showLabels?: boolean;
}

export const AutoFeasibilityLayerOverlay: React.FC<AutoFeasibilityLayerOverlayProps> = ({
  map,
  results,
  visible,
  onPointClick,
  showLabels = false,
}) => {
  const overlay = useMemo(() => new GoogleMapsOverlay({ layers: [] }), []);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const distanceMarkersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    return () => {
      distanceMarkersRef.current.forEach(m => m.setMap(null));
      distanceMarkersRef.current = [];
    };
  }, []);

  const showPopup = (info: any) => {
    if (!map || !info.object || !info.coordinate) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 320,
        minWidth: 240,
        pixelOffset: new google.maps.Size(0, -10),
        zIndex: 999999,
      });
    }

    const container = document.createElement("div");
    if (document.documentElement.classList.contains("dark")) {
      container.classList.add("dark");
    }
    const root = createRoot(container);
    
    let properties: any = {
      name: info.object.name || info.object.uid || 'Location'
    };

    if (info.object.hasOwnProperty('is_feasible')) {
      // It's a Customer Point
      properties["Type"] = "Customer Location";
      properties["Status"] = info.object.is_feasible ? "Feasible" : "Not Feasible";
      properties["Distance to Infra"] = info.object.distance_meters ? `${(info.object.distance_meters / 1000).toFixed(2)} km` : "N/A";
      properties["Nearest Infra"] = info.object.nearest_infra?.name || "None";
      
      if (info.object.losChecked) {
        properties["Line of Sight"] = info.object.losClear ? "Clear" : "Blocked";
        if (info.object.blockReason) {
          properties["Block Reason"] = info.object.blockReason;
        }
      }
      properties["Alternatives Available"] = info.object.available_infras?.length || 0;
    } else {
      // It's an Infrastructure Point
      properties["Type"] = "Network Infrastructure";
      properties["Infra Type"] = info.object.folder_name || info.object.infra_type || 'Unknown';
      if (info.object.distance_meters) {
         properties["Distance"] = `${(info.object.distance_meters / 1000).toFixed(2)} km`;
      }
    }
    
    root.render(
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <MapPopup 
          properties={properties} 
          onClose={() => infoWindowRef.current?.close()}
        />
      </div>
    );

    infoWindowRef.current.setContent(container);
    infoWindowRef.current.setPosition({ lat: info.coordinate[1], lng: info.coordinate[0] });
    infoWindowRef.current.open(map);
  };

  useEffect(() => {
    if (map) {
      overlay.setMap(map);
    }
    return () => {
      overlay.setMap(null);
    };
  }, [map, overlay]);

  useEffect(() => {
    // ALWAYS clear distance labels first, before checking visibility
    distanceMarkersRef.current.forEach(m => m.setMap(null));
    distanceMarkersRef.current = [];

    if (!visible || !results || results.length === 0) {
      overlay.setProps({ layers: [] });
      return;
    }

    // For the uploaded points, use standard Google Red Marker
    const scatterLayer = new IconLayer({
      id: 'af-scatter',
      data: results,
      pickable: true,
      getIcon: () => ({
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        width: 32,
        height: 32,
        anchorY: 32
      }),
      getSize: 32,
      getPosition: (d: any) => [d.lng, d.lat],
      onClick: (info) => {
        showPopup(info);
        if (onPointClick) onPointClick(info);
      },
    });

    const lineLayer = new LineLayer({
      id: 'af-lines',
      data: results.filter(r => r.is_feasible && r.nearest_infra?.geom?.coordinates),
      pickable: true,
      getWidth: 2,
      getSourcePosition: (d: any) => [d.lng, d.lat],
      getTargetPosition: (d: any) => d.nearest_infra.geom.coordinates,
      getColor: [16, 185, 129, 150],
    });

    // Get unique infrastructures to avoid drawing multiple overlapping points for the same POP
    const uniqueInfrasMap = new Map();
    results.forEach(r => {
      if (r.is_feasible && r.nearest_infra?.geom?.coordinates) {
        uniqueInfrasMap.set(r.nearest_infra.id, r.nearest_infra);
      }
    });
    const infraData = Array.from(uniqueInfrasMap.values());

    // Generate dynamic Icon based on MapIcons.ts
    const infraLayer = new IconLayer({
      id: 'af-infra',
      data: infraData,
      pickable: true,
      getIcon: (d: any) => {
        const folderName = d.folder_name || d.infra_type || 'POP';
        const iconKey = getIconKey(folderName as string, { properties: { folder_name: folderName } as Record<string, string> });
        const iconDef = ICON_DEFS[iconKey] || ICON_DEFS['DEFAULT'];
        
        // Generate SVG data URL dynamically
        const colorArr = iconDef.color || [59, 130, 246]; // Fallback blue
        const hexColor = '#' + colorArr.slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${hexColor}"><path d="${iconDef.path}"/></svg>`;
        const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

        return {
          url,
          width: 24,
          height: 24,
          anchorY: 12
        };
      },
      getSize: 36, // Render size
      getPosition: (d: any) => d.geom.coordinates,
      onClick: showPopup,
    });

    // Distance Labels as Google Maps Markers
    const newMarkers: google.maps.Marker[] = [];
    results.forEach((r: any) => {
      if (r.is_feasible && r.nearest_infra?.geom?.coordinates && r.distance_meters) {
        const lon1 = r.lng;
        const lat1 = r.lat;
        const lon2 = r.nearest_infra.geom.coordinates[0];
        const lat2 = r.nearest_infra.geom.coordinates[1];
        
        const midLat = (lat1 + lat2) / 2;
        const midLng = (lon1 + lon2) / 2;
        
        const distanceText = `${(r.distance_meters / 1000).toFixed(2)} km`;
        
        const marker = new google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map: map,
          label: {
            text: distanceText,
            color: "#1e3a5f",
            fontSize: "12px",
            fontWeight: "bold",
            className: "gis-distance-label"
          },
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'),
            anchor: new google.maps.Point(0, 0)
          },
          zIndex: 1000001,
          clickable: false,
          optimized: false
        });
        newMarkers.push(marker);
      }
    });
    distanceMarkersRef.current = newMarkers;

    const customerTextLayer = new TextLayer({
      id: 'af-text-customers',
      data: showLabels ? results : [],
      pickable: false,
      getPosition: (d: any) => [d.lng, d.lat],
      getText: (d: any) => d.name || d.uid || 'Location',
      getSize: 12,
      getColor: [0, 0, 0, 255],
      getPixelOffset: [0, 25],
      getBackgroundColor: [255, 255, 255, 200],
      background: true,
      backgroundPadding: [2, 2],
      fontFamily: 'system-ui, sans-serif',
    });

    const infraTextLayer = new TextLayer({
      id: 'af-text-infra',
      data: showLabels ? infraData : [],
      pickable: false,
      getPosition: (d: any) => d.geom.coordinates,
      getText: (d: any) => d.name || d.folder_name || d.infra_type || 'Infra',
      getSize: 12,
      getColor: [0, 0, 0, 255],
      getPixelOffset: [0, 25],
      getBackgroundColor: [255, 255, 255, 200],
      background: true,
      backgroundPadding: [2, 2],
      fontFamily: 'system-ui, sans-serif',
    });

    overlay.setProps({
      layers: [lineLayer, scatterLayer, infraLayer, customerTextLayer, infraTextLayer],
    });
  }, [results, visible, overlay, map, onPointClick, showLabels]);

  return null;
};
