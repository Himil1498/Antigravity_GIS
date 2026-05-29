import React from 'react';
import MapTypeSelector from './ViewSettings/MapTypeSelector';
import ZoomLevelSlider from './ViewSettings/ZoomLevelSlider';
import CenterPositionDisplay from './ViewSettings/CenterPositionDisplay';
import QuickRegionSelector from './ViewSettings/QuickRegionSelector';

interface ViewSettingsProps {
  map: google.maps.Map | null;
  defaultZoom: number;
  setDefaultZoom: (zoom: number) => void;
  defaultCenter: { lat: number; lng: number } | null;
  setDefaultCenter: (center: { lat: number; lng: number } | null) => void;
  defaultMapType: string;
  setDefaultMapType: (type: string) => void;
  useCurrentView: boolean;
  setUseCurrentView: (use: boolean) => void;
  assignedRegions: string[];
  onSaveCurrentView: () => void;
  onCenterOnRegion: (region: string) => void;
}

const ViewSettings: React.FC<ViewSettingsProps> = ({
  map,
  defaultZoom,
  setDefaultZoom,
  defaultCenter,
  setDefaultCenter,
  defaultMapType,
  setDefaultMapType,
  useCurrentView,
  setUseCurrentView,
  assignedRegions,
  onSaveCurrentView,
  onCenterOnRegion,
}) => {
  return (
    <>
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Personalize Your Map View
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Set your preferred default position and zoom level. The map will
              open to this view every time you log in.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSaveCurrentView}
          disabled={!map}
          className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-semibold">Save Current View</span>
        </button>

        <button
          onClick={() => {
            setDefaultCenter(null);
            setDefaultZoom(10);
            setUseCurrentView(false);
          }}
          className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transform hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-semibold">Use System Default</span>
        </button>
      </div>

      {/* Map Type Selector */}
      <MapTypeSelector
        defaultMapType={defaultMapType}
        setDefaultMapType={setDefaultMapType}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Zoom Level Slider */}
        <ZoomLevelSlider
          defaultZoom={defaultZoom}
          setDefaultZoom={setDefaultZoom}
        />

        {/* Center Position Display */}
        <CenterPositionDisplay
          defaultCenter={defaultCenter}
          useCurrentView={useCurrentView}
        />
      </div>

      {/* Quick Region Selector */}
      <QuickRegionSelector
        assignedRegions={assignedRegions}
        onCenterOnRegion={onCenterOnRegion}
      />
    </>
  );
};

export default ViewSettings;

