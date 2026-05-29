import React, { useMemo } from 'react';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { networkPlanningService } from '../../services/api';

// This is meant to be exported to be injected into MapPage's DeckGL instance if we had direct access.
// Since we have a NetworkLayerOverlay that manages DeckGL for network planning,
// it's easier to create a standalone Google Maps OverlayView or inject this into the existing DeckGL.
// However, since NetworkLayerOverlay uses DeckGL, we can pass these layers up.

export const getAutoFeasibilityLayers = (
  results: any[],
  onPointClick: (info: any) => void
) => {
  if (!results || results.length === 0) return [];

  const scatterLayer = new ScatterplotLayer({
    id: 'auto-feasibility-points',
    data: results,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 6,
    radiusMaxPixels: 15,
    lineWidthMinPixels: 2,
    getPosition: (d: any) => [d.lng, d.lat],
    getFillColor: (d: any) => d.is_feasible ? [16, 185, 129, 200] : [239, 68, 68, 200], // Emerald vs Red
    getLineColor: (d: any) => d.is_feasible ? [5, 150, 105] : [220, 38, 38],
    onClick: onPointClick,
    updateTriggers: {
      getFillColor: results,
    }
  });

  return [scatterLayer];
};
