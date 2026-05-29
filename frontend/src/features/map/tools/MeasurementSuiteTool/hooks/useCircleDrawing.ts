import type { CircleData } from "../../../../../types/gisToolTypes/index";
import { useAppSelector } from "../../../../../store/index";
import { useCircleState } from "./useCircleState";
import { useCircleGeometry } from "./useCircleGeometry";
import { useCircleMap } from "./useCircleMap";
import { useCirclePersistence } from "./useCirclePersistence";

interface UseCircleDrawingProps {
  map: google.maps.Map | null;
  onSave?: (circle: CircleData) => void;
  onClose?: () => void;
  isToolboxCollapsedInitial?: boolean;
  isActive?: boolean;
}

export const useCircleDrawing = ({
  map,
  onSave,
  onClose,
  isToolboxCollapsedInitial = false,
  isActive = true,
}: UseCircleDrawingProps) => {
  const { user } = useAppSelector((state) => state.auth);

  // 1. Logic State
  const state = useCircleState({ isToolboxCollapsedInitial });
  
  // 2. Geometry Helpers
  const geometry = useCircleGeometry();

  // 3. Map Integrations
  const { clearCircle, deleteCircle } = useCircleMap({
    map,
    user,
    isActive,
    radius: state.radius,
    center: state.center,
    circles: state.circles,
    activeCircleIndex: state.activeCircleIndex,
    color: state.color,
    fillOpacity: state.fillOpacity,
    isPlacingCenter: state.isPlacingCenter,
    isPlacingMarker: state.isPlacingMarker,
    isToolboxCollapsed: state.isToolboxCollapsed,
    setCenter: state.setCenter,
    setCircles: state.setCircles,
    setActiveCircleIndex: state.setActiveCircleIndex,
    setIsPlacingCenter: state.setIsPlacingCenter,
    setIsPlacingMarker: state.setIsPlacingMarker,
    setIsValidating: state.setIsValidating,
    setRadius: state.setRadius,
    setIsToolboxCollapsed: state.setIsToolboxCollapsed,
    validateRadius: geometry.validateRadius,
    calculateGeometry: geometry.calculateGeometry,
    setArea: state.setArea,
    setPerimeter: state.setPerimeter
  });

  // 4. Persistence
  const { handleSave } = useCirclePersistence({
    center: state.center,
    name: state.name,
    radius: state.radius,
    area: state.area,
    perimeter: state.perimeter,
    color: state.color,
    fillOpacity: state.fillOpacity,
    description: state.description,
    storageType: state.storageType,
    user,
    startTime: state.startTime,
    onSave,
    setSaving: state.setSaving,
    clearCircle,
    setShowSaveDialog: state.setShowSaveDialog,
    setName: state.setName,
    setDescription: state.setDescription,
    setStorageType: state.setStorageType
  });

  const handleClose = () => {
    clearCircle();
    if (onClose) onClose();
  };

  return {
    state,
    actions: {
      setRadius: state.setRadius,
      setName: state.setName,
      setDescription: state.setDescription,
      setColor: state.setColor,
      setFillOpacity: state.setFillOpacity,
      setStorageType: state.setStorageType,
      setIsToolboxCollapsed: state.setIsToolboxCollapsed,
      setShowSaveDialog: state.setShowSaveDialog,
      setShowCloseWarning: state.setShowCloseWarning,
      setNotification: state.setNotification,
      validateRadius: geometry.validateRadius,
      clearCircle,
      handleSave,
      handleClose,
      deleteCircle,
      // handleCloseWithoutSaving,
      // handleCloseSaveData,
    },
    formatters: {
      formatArea: geometry.formatArea,
      formatDistance: geometry.formatDistance,
    },
  };
};

