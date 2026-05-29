/**
 * Custom hook for managing dropdown state (GIS Tools and Layers)
 * Handles open/close state and outside click detection for both dropdowns
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export const useDropdowns = () => {
  const [showGISDropdown, setShowGISDropdown] = useState(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const gisDropdownRef = useRef<HTMLDivElement | null>(null);
  const layersDropdownRef = useRef<HTMLDivElement | null>(null);

  // Use refs to track current state for the mousedown listener
  // This avoids stale closures entirely
  const showGISRef = useRef(showGISDropdown);
  const showLayersRef = useRef(showLayersDropdown);
  showGISRef.current = showGISDropdown;
  showLayersRef.current = showLayersDropdown;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close GIS dropdown if it's actually open AND click is outside
      if (
        showGISRef.current &&
        gisDropdownRef.current &&
        !gisDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGISDropdown(false);
      }
      // Only close Layers dropdown if it's actually open AND click is outside
      if (
        showLayersRef.current &&
        layersDropdownRef.current &&
        !layersDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLayersDropdown(false);
      }
    };

    // Always listen — the handler itself checks if dropdowns are open via refs
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); // Empty deps — listener is stable, uses refs for current state

  const toggleGISDropdown = useCallback(() => {
    // Use functional update to guarantee we toggle from the ACTUAL current value
    setShowGISDropdown(prev => !prev);
    setShowLayersDropdown(false);
  }, []);

  const toggleLayersDropdown = useCallback(() => {
    setShowLayersDropdown(prev => !prev);
    setShowGISDropdown(false);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setShowGISDropdown(false);
    setShowLayersDropdown(false);
  }, []);

  return {
    showGISDropdown,
    showLayersDropdown,
    gisDropdownRef,
    layersDropdownRef,
    toggleGISDropdown,
    toggleLayersDropdown,
    closeAllDropdowns
  };
};
