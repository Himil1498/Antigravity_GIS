import { LayerState, BoundarySettings } from "../types/index";
import { type LayerOverlay } from "../../../utils/layerVisualization/index";

export const INITIAL_BOUNDARY_SETTINGS: BoundarySettings = {
  enabled: false,
  color: "#3B82F6",
  opacity: 0.5,
  dimWhenToolActive: true,
  dimmedOpacity: 0.2,
};

export const INITIAL_LAYERS_STATE: LayerState = {
  Distance: {
    visible: false,
    count: 0,
    overlays: [] as LayerOverlay[],
  },
  Polygon: {
    visible: false,
    count: 0,
    overlays: [] as LayerOverlay[],
  },
  Circle: {
    visible: false,
    count: 0,
    overlays: [] as LayerOverlay[],
  },
  Elevation: {
    visible: false,
    count: 0,
    overlays: [] as LayerOverlay[],
  },

  SectorRF: {
    visible: false,
    count: 0,
    overlays: [] as LayerOverlay[],
  },
  RegionBoundaries: {
    visible: true,
    count: 37,
    overlays: [] as LayerOverlay[],
    monochrome: false,
  },
};

