// import React, { useState, useEffect } from "react";

// interface LiveCoordinatesProps {
//   map: google.maps.Map | null;
// }

// const LiveCoordinates: React.FC<LiveCoordinatesProps> = ({ map }) => {
//   const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

//   useEffect(() => {
//     // console.log('LiveCoordinates: Component mounted, map=', map ? 'exists' : 'null');

//     if (!map) return;

//     // console.log('LiveCoordinates: Setting up listeners');

//     const moveListener = map.addListener("mousemove", (e: google.maps.MapMouseEvent) => {
//       if (e.latLng) {
//         setCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
//       }
//     });

//     const outListener = map.addListener("mouseout", () => {
//       setCoords(null);
//     });

//     // console.log('LiveCoordinates: Listeners active');

//     return () => {
//       // console.log('LiveCoordinates: Cleanup');
//       google.maps.event.removeListener(moveListener);
//       google.maps.event.removeListener(outListener);
//     };
//   }, [map]);

//   if (!coords) return null;

//   const formatLat = (lat: number) => {
//     const dir = lat >= 0 ? "N" : "S";
//     return `${Math.abs(lat).toFixed(6)}° ${dir}`;
//   };

//   const formatLng = (lng: number) => {
//     const dir = lng >= 0 ? "E" : "W";
//     return `${Math.abs(lng).toFixed(6)}° ${dir}`;
//   };

//   return (
//     <div className="fixed bottom-2 left-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-2 z-[1000]">
//       <div className="flex items-center space-x-3 text-sm">
//         <div className="flex items-center space-x-1">
//           <span className="text-gray-500 dark:text-gray-400 font-medium">Lat:</span>
//           <span className="text-gray-900 dark:text-white font-mono">{formatLat(coords.lat)}</span>
//         </div>
//         <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
//         <div className="flex items-center space-x-1">
//           <span className="text-gray-500 dark:text-gray-400 font-medium">Lng:</span>
//           <span className="text-gray-900 dark:text-white font-mono">{formatLng(coords.lng)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveCoordinates;

import React, { useState, useEffect } from "react";
import { MapPin, Compass } from "lucide-react";

interface LiveCoordinatesProps {
  map: google.maps.Map | null;
  positionClass?: string;
}

const LiveCoordinates: React.FC<LiveCoordinatesProps> = ({ map, positionClass }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // console.log('LiveCoordinates: Component mounted, map=', map ? 'exists' : 'null');

    if (!map) return;

    // console.log('LiveCoordinates: Setting up listeners');

    let lastUpdate = 0;
    const throttleMs = 50; // Update at most 20 times per second

    const moveListener = map.addListener(
      "mousemove",
      (e: google.maps.MapMouseEvent) => {
        const now = Date.now();
        if (now - lastUpdate > throttleMs) {
          if (e.latLng) {
            setCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            setIsVisible(true);
          }
          lastUpdate = now;
        }
      },
    );

    const outListener = map.addListener("mouseout", () => {
      setIsVisible(false);
      setTimeout(() => setCoords(null), 300); // Delay to allow fade out animation
    });

    // console.log('LiveCoordinates: Listeners active');

    return () => {
      // console.log('LiveCoordinates: Cleanup');
      google.maps.event.removeListener(moveListener);
      google.maps.event.removeListener(outListener);
    };
  }, [map]);

  if (!coords) return null;

  const formatLat = (lat: number) => {
    const dir = lat >= 0 ? "N" : "S";
    return `${Math.abs(lat).toFixed(6)}° ${dir}`;
  };

  const formatLng = (lng: number) => {
    const dir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lng).toFixed(6)}° ${dir}`;
  };

  return (
    <div
      className={`${positionClass || "fixed left-12 bottom-4"} bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-md shadow-sm border border-white/50 dark:border-gray-700/50 px-2 py-1 z-[1000] transition-all duration-300 pointer-events-none ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center space-x-2 text-xs">
        {/* Pulsing Live Indicator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-1.5 h-1.5 bg-green-500/80 rounded-full animate-ping"></div>
          <div className="relative w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>

        {/* Map Pin Icon */}
        <MapPin
          className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 flex-shrink-0"
          strokeWidth={2.5}
        />

        <div className="flex items-center space-x-1">
          <span className="text-gray-600 dark:text-gray-400 font-semibold text-[10px] tracking-wider">
            LAT
          </span>
          <span className="text-gray-900 dark:text-white font-mono font-medium">
            {formatLat(coords.lat)}
          </span>
        </div>

        <div className="w-px h-3 bg-gray-400/40 dark:bg-gray-600/50"></div>

        {/* Compass Icon */}
        <Compass
          className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 flex-shrink-0"
          strokeWidth={2.5}
        />

        <div className="flex items-center space-x-1">
          <span className="text-gray-600 dark:text-gray-400 font-semibold text-[10px] tracking-wider">
            LNG
          </span>
          <span className="text-gray-900 dark:text-white font-mono font-medium">
            {formatLng(coords.lng)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveCoordinates;

