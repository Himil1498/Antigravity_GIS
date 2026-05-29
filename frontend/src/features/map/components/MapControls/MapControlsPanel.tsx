/**
 * Custom Map Controls Panel (Refactored)
 * Main orchestrator component that provides zoom, location, India bounds, fullscreen, and map type controls
 */

import React from 'react';
import type { MapControlsPanelProps } from './types';
import { useMapControls } from './hooks/useMapControls';
import { useGeolocation } from './hooks/useGeolocation';
import { useFullscreen } from './hooks/useFullscreen';
import { useMapTypeDropdown } from './hooks/useMapTypeDropdown';
import ZoomControls from './components/ZoomControls';
import LocationButton from './components/LocationButton';
import ResetButton from './components/ResetButton';
import FullscreenButton from './components/FullscreenButton';
import SettingsButton from './components/SettingsButton';
import MapTypeSelector from './components/MapTypeSelector';

const MapControlsPanel: React.FC<MapControlsPanelProps> = ({ map, onOpenSettings, hideLocation = false, hideResetView = false }) => {
  // Custom hooks
  const { currentMapType, zoomIn, zoomOut, resetToPreferences, changeMapType } =
    useMapControls(map);
  const { getUserLocation, clearLocationMarker, hasLocationMarker, isLocating } = useGeolocation(map);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isOpen, dropdownRef, toggleDropdown, closeDropdown } = useMapTypeDropdown();

  // Toggle: if marker exists, clear it; otherwise get location
  const handleLocationClick = () => {
    if (isLocating) return; // Prevent double-click while locating
    if (hasLocationMarker) {
      clearLocationMarker();
    } else {
      getUserLocation();
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />
      </div>

      {!hideLocation && (
      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <LocationButton onClick={handleLocationClick} isActive={hasLocationMarker} isLocating={isLocating} />
      </div>
      )}

      {!hideResetView && (
      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <ResetButton onClick={resetToPreferences} />
      </div>
      )}

      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
      </div>

      {onOpenSettings && (
        <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
          <SettingsButton onClick={onOpenSettings} />
        </div>
      )}

      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <MapTypeSelector
          currentMapType={currentMapType}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
          onToggle={toggleDropdown}
          onSelect={changeMapType}
          onClose={closeDropdown}
        />
      </div>
    </div>
  );
};

export default MapControlsPanel;

