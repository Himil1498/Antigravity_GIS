
import type { SegmentElevation } from "../../types/gisToolTypes/index";

export type { SegmentElevation };

export interface ElevationPoint {
  elevation: number;
  resolution: number;
  location: { lat: number; lng: number };
  distance: number;
}

