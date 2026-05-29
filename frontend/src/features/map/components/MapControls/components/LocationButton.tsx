/**
 * Location Button Component
 * Button to get user's current location or remove the pin if active
 */

import React from 'react';

interface LocationButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isLocating?: boolean;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onClick, isActive = false, isLocating = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLocating}
      className={`group relative h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 z-10 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 z-20'
          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30'
      } ${isLocating ? 'opacity-70 cursor-wait' : ''}`}
      title={isLocating ? 'Locating...' : isActive ? 'Remove Location Pin' : 'My Location'}
      aria-label={isLocating ? 'Locating your position' : isActive ? 'Remove location pin from map' : 'Find my current location'}
    >
      {isLocating ? (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
      {/* Active indicator dot */}
      {isActive && !isLocating && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </button>
  );
};

export default LocationButton;

