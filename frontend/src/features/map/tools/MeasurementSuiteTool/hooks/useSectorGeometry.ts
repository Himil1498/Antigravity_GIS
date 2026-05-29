/**
 * Custom hook for calculating sector geometry (area and arc length)
 * Uses mathematical formulas for circular sector calculations
 */

import { useState, useEffect } from 'react';
import { calculateSectorGeometry } from '../utils/sectorUtils';

interface UseSectorGeometryProps {
  radius: number;
  beamwidth: number;
  center: google.maps.LatLngLiteral | null;
}

export const useSectorGeometry = ({ radius, beamwidth, center }: UseSectorGeometryProps) => {
  const [area, setArea] = useState<number>(0);
  const [arcLength, setArcLength] = useState<number>(0);

  useEffect(() => {
    if (!center) return;

    const geometry = calculateSectorGeometry(radius, beamwidth);
    setArea(geometry.area);
    setArcLength(geometry.arcLength);
  }, [radius, beamwidth, center]);

  const clearGeometry = () => {
    setArea(0);
    setArcLength(0);
  };

  return {
    area,
    arcLength,
    clearGeometry
  };
};

