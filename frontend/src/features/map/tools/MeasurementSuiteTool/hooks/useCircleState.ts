import { useState } from "react";

export interface UseCircleStateProps {
  isToolboxCollapsedInitial?: boolean;
}

export const useCircleState = ({
  isToolboxCollapsedInitial = false,
}: UseCircleStateProps = {}) => {
  const [startTime] = useState<number>(Date.now());

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [circles, setCircles] = useState<{ 
    id: string; 
    lat: number; 
    lng: number; 
    radius: number; 
    color: string; 
    fillOpacity: number 
  }[]>([]);
  const [activeCircleIndex, setActiveCircleIndex] = useState<number | null>(null);

  const [radius, setRadius] = useState<number>(1000); // default 1km
  const [area, setArea] = useState<number>(0);
  const [perimeter, setPerimeter] = useState<number>(0);
  
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#FF0000");
  const [fillOpacity, setFillOpacity] = useState<number>(0.35);
  const [description, setDescription] = useState<string>("");
  const [storageType, setStorageType] = useState<"permanent" | "temporary">(
    "permanent"
  );
  
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const [isPlacingCenter, setIsPlacingCenter] = useState<boolean>(true);
  
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState<boolean>(
    isToolboxCollapsedInitial
  );
  const [saving, setSaving] = useState<boolean>(false);
  
  // Validation & race-condition protection
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  return {
    startTime,
    center, setCenter,
    circles, setCircles,
    activeCircleIndex, setActiveCircleIndex,
    radius, setRadius,
    area, setArea,
    perimeter, setPerimeter,
    name, setName,
    color, setColor,
    fillOpacity, setFillOpacity,
    description, setDescription,
    storageType, setStorageType,
    showSaveDialog, setShowSaveDialog,
    showCloseWarning, setShowCloseWarning,
    isPlacingCenter, setIsPlacingCenter,
    notification, setNotification,
    isToolboxCollapsed, setIsToolboxCollapsed,
    saving, setSaving,
    isPlacingMarker, setIsPlacingMarker,
    isValidating, setIsValidating
  };
};

