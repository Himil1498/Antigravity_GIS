import React, { useState } from "react";
import type { MapSettingsProps, MapPreferences } from "./types";
import { useMapPreferences } from "./hooks/useMapPreferences";
import { useBoundarySettings } from "./hooks/useBoundarySettings";
import { useAssignedRegions } from "./hooks/useAssignedRegions";
import { showToast } from "../../../../utils/toastUtils";

import MapSettingsHeader from "./components/MapSettingsHeader";
import MapSettingsFooter from "./components/MapSettingsFooter";
import ViewSettings from "./components/ViewSettings";

import MapSettingsStyles from "./components/MapSettingsStyles";

const MapSettings: React.FC<MapSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  map,
  currentPreferences,
  onSaveAllPreferences,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // Custom Hooks
  const { assignedRegions } = useAssignedRegions();

  const {
    defaultZoom,
    defaultCenter,
    defaultRegionId,
    defaultMapType,
    useCurrentView,
    setDefaultZoom,
    setDefaultCenter,
    setDefaultRegionId,
    setDefaultMapType,
    setUseCurrentView,
    handleSaveCurrentView,
    handleCenterOnRegion,
    resetToDefaults: resetViewDefaults,
  } = useMapPreferences(currentPreferences);

  const {
    localSettings,
    setLocalSettings,
    resetToDefaults: resetBoundaryDefaults,
  } = useBoundarySettings(settings);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save boundary settings (old behavior)
      onSettingsChange(localSettings);
      localStorage.setItem(
        "mapBoundarySettings",
        JSON.stringify(localSettings),
      );

      // Save all preferences if callback provided
      if (onSaveAllPreferences) {
        const allPreferences: MapPreferences = {
          default_zoom: defaultZoom,
          default_center: defaultCenter,
          default_region_id: defaultRegionId,
          default_map_type: defaultMapType,
          boundary: localSettings,
        };
        await onSaveAllPreferences(allPreferences);
      }

      // Show success toast notification
      showToast.success("Map preferences saved successfully!");

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error saving map preferences:", error);
      showToast.error("Failed to save map preferences. Please try again.");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetViewDefaults();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <MapSettingsHeader
          onClose={onClose}
        />

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          <ViewSettings
            map={map}
            defaultZoom={defaultZoom}
            setDefaultZoom={setDefaultZoom}
            defaultCenter={defaultCenter}
            setDefaultCenter={setDefaultCenter}
            defaultMapType={defaultMapType}
            setDefaultMapType={setDefaultMapType}
            useCurrentView={useCurrentView}
            setUseCurrentView={setUseCurrentView}
            assignedRegions={assignedRegions}
            onSaveCurrentView={() => handleSaveCurrentView(map)}
            onCenterOnRegion={handleCenterOnRegion}
          />
        </div>

        <MapSettingsFooter
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      <MapSettingsStyles />
    </div>
  );
};

export default MapSettings;
