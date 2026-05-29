/**
 * Constants for MapToolbar feature
 */

import React from "react";
import { Ruler, Hexagon, Circle as CircleIcon, Mountain, Radio, PencilRuler } from "lucide-react";
import type { Tool } from "./types";
import type { GISToolType } from "../../../../types/gisToolTypes/index";

/**
 * Available GIS tools
 */
export const GIS_TOOLS: Tool[] = [
  {
    id: "measurementSuite" as GISToolType,
    name: "Geometry Suite",
    icon: PencilRuler,
    requiredPermission: "map:tools:geometry_suite",
  },
];

/**
 * Layer IDs for the map
 */
export const LAYER_IDS = {
  REGION_BOUNDARIES: "RegionBoundaries",
  DISTANCE: "Distance",
  POLYGON: "Polygon",
  CIRCLE: "Circle",
  ELEVATION: "Elevation",

  SECTOR_RF: "SectorRF",
} as const;
