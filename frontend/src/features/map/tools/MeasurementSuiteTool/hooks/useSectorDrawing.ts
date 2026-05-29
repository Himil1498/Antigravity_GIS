/**
 * Custom hook for drawing sector polygon and direction line on the map
 * Handles sector visualization with Google Maps Polygon and Polyline
 */

import { useState, useEffect } from 'react';
import type { SectorCenter } from '../types/sectorTypes';
import { createSectorPath, calculatePointAtBearing } from '../utils/sectorUtils';

interface UseSectorDrawingProps {
  map: google.maps.Map | null;
  center: SectorCenter | null;
  radius: number;
  azimuth: number;
  beamwidth: number;
  color: string;
  fillOpacity: number;
  isActive?: boolean;
}

export const useSectorDrawing = ({
  map,
  center,
  radius,
  azimuth,
  beamwidth,
  color,
  fillOpacity,
  isActive = true
}: UseSectorDrawingProps) => {
  const [sectorPolygon, setSectorPolygon] = useState<google.maps.Polygon | null>(null);
  const [directionLine, setDirectionLine] = useState<google.maps.Polyline | null>(null);

  // Update sector when parameters change
  useEffect(() => {
    if (!map || !center || !isActive) return;

    // Remove old sector
    if (sectorPolygon) {
      sectorPolygon.setMap(null);
    }
    if (directionLine) {
      directionLine.setMap(null);
    }

    // Create sector polygon
    const sectorPath = createSectorPath(center, radius, azimuth, beamwidth);
    const newSector = new google.maps.Polygon({
      paths: sectorPath,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: fillOpacity,
      map: map,
      editable: false
    });

    // Create direction indicator line
    const directionEndPoint = calculatePointAtBearing(center, radius, azimuth);
    const newDirectionLine = new google.maps.Polyline({
      path: [center, directionEndPoint],
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3,
      map: map,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            strokeColor: color,
            fillColor: color,
            fillOpacity: 1
          },
          offset: '100%'
        }
      ]
    });

    // Add click listener to reopen tool when clicked after closing
    newSector.addListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('reopenGISTool', {
          detail: { toolType: 'sectorRF' }
        })
      );
    });

    setSectorPolygon(newSector);
    setDirectionLine(newDirectionLine);
  }, [center, radius, azimuth, beamwidth, map, color, fillOpacity, isActive]);

  // Clear sector shapes
  const clearShapes = () => {
    if (sectorPolygon) {
      sectorPolygon.setMap(null);
      setSectorPolygon(null);
    }
    if (directionLine) {
      directionLine.setMap(null);
      setDirectionLine(null);
    }
  };

  return {
    sectorPolygon,
    directionLine,
    clearShapes
  };
};

