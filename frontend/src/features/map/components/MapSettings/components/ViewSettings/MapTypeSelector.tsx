/**
 * Map Type Selector Component
 * Allows users to choose their preferred map type (roadmap, satellite, hybrid, terrain)
 */

import React from 'react';

interface MapTypeSelectorProps {
  defaultMapType: string;
  setDefaultMapType: (type: string) => void;
}

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({
  defaultMapType,
  setDefaultMapType
}) => {
  const mapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];

  const getMapTypeIcon = (type: string): string => {
    switch (type) {
      case 'roadmap': return '🗺️';
      case 'satellite': return '🛰️';
      case 'hybrid': return '🌍';
      case 'terrain': return '⛰️';
      default: return '🗺️';
    }
  };

  const getMapTypeDescription = (type: string): string => {
    switch (type) {
      case 'roadmap': return 'Standard map view';
      case 'satellite': return 'Aerial imagery';
      case 'hybrid': return 'Satellite + labels';
      case 'terrain': return 'Topographical view';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Default Map Type
      </label>
      <div className="grid grid-cols-4 gap-2">
        {mapTypes.map((type) => (
          <button
            key={type}
            onClick={() => setDefaultMapType(type)}
            className={`group relative overflow-hidden p-2 rounded-xl transition-all border-2 flex flex-col items-center justify-center gap-1 ${
              defaultMapType === type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-105'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div
              className={`text-2xl ${
                defaultMapType === type ? 'scale-110' : ''
              } transition-transform`}
            >
              {getMapTypeIcon(type)}
            </div>
            <span
              className={`text-xs font-semibold capitalize ${
                defaultMapType === type
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapTypeSelector;

