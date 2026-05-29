/**
 * Map Type Selector Component
 * Dropdown selector for changing map type (roadmap, satellite, hybrid, terrain)
 */

import React from 'react';
import { MAP_TYPES } from '../constants';

interface MapTypeSelectorProps {
  currentMapType: string;
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onSelect: (typeId: string) => void;
  onClose: () => void;
}

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({
  currentMapType,
  isOpen,
  dropdownRef,
  onToggle,
  onSelect,
  onClose
}) => {
  const handleSelect = (typeId: string) => {
    onSelect(typeId);
    onClose();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="group relative h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 z-10 text-green-600 dark:text-green-400 hover:bg-green-100/50 dark:hover:bg-green-900/30"
        title="Map Type"
      >
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-9 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[120px]">
          {MAP_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`w-full px-3 py-1.5 text-left text-xs flex items-center space-x-2 transition-colors ${
                currentMapType === type.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapTypeSelector;

