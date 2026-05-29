/**
 * Custom hook for map type dropdown management
 * Handles dropdown open/close state and outside click detection
 */

import { useState, useEffect, useRef, RefObject } from 'react';

export const useMapTypeDropdown = (): {
  isOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  toggleDropdown: () => void;
  closeDropdown: () => void;
} => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return {
    isOpen,
    dropdownRef,
    toggleDropdown,
    closeDropdown
  };
};

