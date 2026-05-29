/**
 * Collapsed Toolbox Component
 * Displays minimal info at top-right of screen
 */

import React from "react";

interface CollapsedToolboxProps {
  vertices: Array<{ lat: number; lng: number }>;
  area: number;
  polygon: google.maps.Polygon | null;
  markers: google.maps.Marker[];
  onClearAll: () => void;
  onExpand: () => void;
  containerStyle?: React.CSSProperties;
}

const CollapsedToolbox: React.FC<CollapsedToolboxProps> = ({
  vertices,
  area,
  polygon,
  markers,
  onClearAll,
  onExpand,
  containerStyle
}) => {
  const handleClearAll = () => {
    markers.forEach((m) => m.setMap(null));
    if (polygon) polygon.setMap(null);
    onClearAll();
  };

  return (
    <div 
      className="fixed top-16 right-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-lg shadow-2xl border-2 border-purple-400 dark:border-purple-500 p-3 z-40 transition-all duration-300 ease-in-out"
      style={containerStyle}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <span className="text-white font-bold text-sm">Polygon Tool</span>
        </div>

        {vertices.length > 0 && (
          <>
            <div className="flex items-center space-x-2 px-2 py-1 bg-white/20 rounded text-white text-xs font-bold">
              <span>{vertices.length} vertices</span>
              {area > 0 && (
                <>
                  <span>•</span>
                  <span>{(area / 1000000).toFixed(2)} km²</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearAll}
                className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded transition-all"
                title="Clear all"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </>
        )}

        <button
          onClick={onExpand}
          className="ml-2 p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
          title="Expand toolbox"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CollapsedToolbox;

