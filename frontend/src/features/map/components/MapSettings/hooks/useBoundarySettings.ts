/**
 * Custom hook for managing boundary settings state
 */

import { useState, useEffect } from 'react';
import { DEFAULT_BOUNDARY_SETTINGS } from '../constants';
import type { BoundarySettings } from '../types';

export const useBoundarySettings = (settings: BoundarySettings) => {
  const [localSettings, setLocalSettings] = useState<BoundarySettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const resetToDefaults = () => {
    setLocalSettings(DEFAULT_BOUNDARY_SETTINGS);
  };

  return {
    localSettings,
    setLocalSettings,
    resetToDefaults
  };
};

