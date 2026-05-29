import React from 'react';

interface MapSettingsHeaderProps {
  onClose: () => void;
}

const MapSettingsHeader: React.FC<MapSettingsHeaderProps> = ({
  onClose,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Map Preferences</h2>
            <p className="text-blue-100 text-sm">Customize your map experience</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="p-2 rounded-xl text-white hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-sm"
        >
          <svg
            className="w-6 h-6 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapSettingsHeader;

