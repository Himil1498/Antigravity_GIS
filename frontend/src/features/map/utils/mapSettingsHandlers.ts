/**
 * Map Settings Handlers
 * Handler functions for map settings / preferences
 */

import { Dispatch } from "react";
import { addNotification } from "../../../store/slices/ui/index";
import { setUserPreferences as setReduxUserPreferences } from "../../../store/slices/mapSlice";
import { updateUser } from "../../../store/slices/authSlice";
import { BoundarySettings } from "../types/index";

/**
 * Handle boundary settings change
 */
export const handleSettingsChange = async (
  newSettings: BoundarySettings,
  setBoundarySettings: (settings: BoundarySettings) => void,
  dispatch: Dispatch<any>
): Promise<void> => {
  setBoundarySettings(newSettings);
  localStorage.setItem("mapBoundarySettings", JSON.stringify(newSettings));
  
  try {
    const userMapPreferencesService = await import("../../../services/user/userMapPreferencesService");
    const updatedPrefs = await userMapPreferencesService.default.saveUserPreferences({
      preferences: { boundary: newSettings },
    });
    // Sync with auth slice
    // Since saveUserPreferences returns the FULL merged preferences object,
    // we can use it to update the user in Redux.
    dispatch(updateUser({ map_preferences: updatedPrefs }));
  } catch (error) {
    console.warn("⚠️ Failed to save preferences:", error);
  }
};

/**
 * Handle saving all preferences
 */
export const handleSaveAllPreferences = async (
  allPrefs: {
    default_map_type?: string;
    default_zoom: number;
    default_center?: { lat: number; lng: number };
    default_region_id?: number;
    boundary: BoundarySettings;
  },
  setBoundarySettings: (settings: BoundarySettings) => void,
  setUserPreferences: (prefs: any) => void,
  userPreferences: any,
  dispatch: Dispatch<any>
): Promise<void> => {
  setBoundarySettings(allPrefs.boundary);

  const updatedPrefs = {
    ...userPreferences,
    default_map_type: allPrefs.default_map_type,
    default_zoom: allPrefs.default_zoom,
    default_center: allPrefs.default_center,
    default_region_id: allPrefs.default_region_id,
    preferences: { boundary: allPrefs.boundary },
  };
  setUserPreferences(updatedPrefs);
  localStorage.setItem("mapBoundarySettings", JSON.stringify(allPrefs.boundary));

  try {
    const userMapPreferencesService = await import("../../../services/user/userMapPreferencesService");
    const finalMergedPrefs = await userMapPreferencesService.default.saveUserPreferences({
      default_map_type: allPrefs.default_map_type,
      default_zoom: allPrefs.default_zoom,
      default_center: allPrefs.default_center,
      default_region_id: allPrefs.default_region_id,
      preferences: { boundary: allPrefs.boundary },
    });
    
    // Update Redux cache so tab switches use latest saved preferences
    dispatch(setReduxUserPreferences(updatedPrefs));
    
    // ALSO update Auth slice to keep everything in sync
    dispatch(updateUser({ map_preferences: finalMergedPrefs }));

    dispatch(
      addNotification({
        type: "success",
        title: "Preferences Saved",
        message: "Saved successfully!",
        autoClose: true,
        duration: 3000,
      })
    );
  } catch (error) {
    console.warn("⚠️ Failed to save preferences:", error);
    dispatch(
      addNotification({
        type: "error",
        title: "Save Failed",
        message: "Failed to save preferences.",
        autoClose: true,
        duration: 5000,
      })
    );
  }
};


