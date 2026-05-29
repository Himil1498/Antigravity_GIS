import { useState } from "react";
import { GeoJSONGeometry } from "../types/index";
import { geojsonToGooglePaths } from "../utils/index";
import { useRegionHistory } from "./useRegionHistory";

export const useRegionEditor = () => {
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editablePaths, setEditablePaths] = useState<google.maps.LatLng[][][]>([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
  const [showPolygonManager, setShowPolygonManager] = useState(false);
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showQuickPublishDialog, setShowQuickPublishDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const history = useRegionHistory();

  return {
     editMode, setEditMode,
     hasChanges, setHasChanges,
     saving, setSaving,
     editablePaths, setEditablePaths,
     selectedPolygonIndex, setSelectedPolygonIndex,
     showPolygonManager, setShowPolygonManager,
     showSaveDialog, setShowSaveDialog,
     showQuickPublishDialog, setShowQuickPublishDialog,
     showCancelDialog, setShowCancelDialog,
     showResetDialog, setShowResetDialog,
     history
  };
};

