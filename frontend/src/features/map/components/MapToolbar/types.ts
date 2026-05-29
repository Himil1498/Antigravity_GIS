/**
 * TypeScript type definitions for MapToolbar feature
 */

import type { GISToolType } from "../../../../types/gisToolTypes/index";

export interface MapToolbarProps {
  map: google.maps.Map | null;
  layersState: LayersState;
  onLayerToggle: (layer: string) => void;
  onColorModeToggle?: (layerId: string) => void;
  onOpenSettings?: () => void;
  onDataSaved?: () => void;
  userFilter?: "me" | "all" | "user";
  selectedUserId?: number;
  onUserFilterChange?: (filter: "me" | "all" | "user") => void;
  onSelectedUserIdChange?: (userId: number | undefined) => void;
  onOpenNetworkCatalog?: () => void;
  networkCatalogOpen?: boolean;
  networkCatalogMinimized?: boolean;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  isZoomedIn?: boolean;
  onToggleFeasibility?: () => void;
  isFeasibilityActive?: boolean;
  onToggleAutoFeasibility?: () => void;
  isAutoFeasibilityActive?: boolean;
  hideNetworkCatalog?: boolean;
  hideStaffSurveys?: boolean;
  hideGeometrySuite?: boolean;
  hideTip?: boolean;
  hideBoundaries?: boolean;
  hideSearch?: boolean;
  hideLocation?: boolean;
  hideSettings?: boolean;
  hideResetView?: boolean;
  extraTools?: React.ReactNode;
  leftAccessory?: React.ReactNode;
}

export interface LayersState {
  Distance: { visible: boolean; count: number };
  Polygon: { visible: boolean; count: number };
  Circle: { visible: boolean; count: number };
  Infrastructure?: { visible: boolean; count: number };
  Customer?: { visible: boolean; count: number };
  Elevation: { visible: boolean; count: number };
  SectorRF: { visible: boolean; count: number };
  RegionBoundaries?: { visible: boolean; count: number; monochrome?: boolean };
}

export interface Tool {
  id: GISToolType;
  name: string;
  icon: React.ElementType;
  requiredPermission?: string;
}

export interface Layer {
  id: string;
  name: string;
  icon: string;
  count: number;
  visible: boolean;
}

export interface UserOption {
  id: number;
  username: string;
  full_name?: string;
  email: string;
  role: string;
}

