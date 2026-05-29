/**
 * Layer Item Component
 * Displays a single layer with visibility toggle and optional color mode control
 */

import React from 'react';
import type { Layer, LayersState } from '../types';

interface LayerItemProps {
  layer: Layer;
  layersState: LayersState;
  onLayerToggle: (layerId: string) => void;
  onColorModeToggle?: (layerId: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  layersState,
  onLayerToggle,
  onColorModeToggle
}) => {
  const getThemeVars = (id: string, active: boolean) => {
    switch (id.toLowerCase()) {
      case "distance":
        return active
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border-l-4 border-transparent";
      case "circle":
        return active
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 border-l-4 border-transparent";
      case "polygon":
        return active
          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-l-4 border-purple-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400 border-l-4 border-transparent";
      case "elevation":
        return active
          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-l-4 border-orange-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 border-l-4 border-transparent";
      case "sectorrf":
        return active
          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-l-4 border-rose-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 border-l-4 border-transparent";
      default:
        // E.g. Region Boundaries
        return active
          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 border-l-4 border-transparent";
    }
  };

  return (
    <div key={layer.id}>
      <button
        onClick={() => {
          console.log('🖱️ Layer toggle clicked:', layer.id, 'Current visible:', layer.visible);
          onLayerToggle(layer.id);
        }}
        className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${getThemeVars(layer.id, layer.visible)}`}
      >
        <span className="w-6 flex-shrink-0 text-center text-lg">{layer.icon}</span>
        <span className="text-xs font-semibold flex-1">
          {layer.name} ({layer.count})
        </span>
        <div
          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
            layer.visible ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          {layer.visible && (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>

    </div>
  );
};

export default LayerItem;

