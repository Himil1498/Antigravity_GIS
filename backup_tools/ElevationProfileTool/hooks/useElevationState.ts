import { useState, useRef } from 'react';
import type { Building, Obstacle } from '../../../../../utils/buildingData/index';
import type { LOSAnalysisResult } from '../../../../../utils/losAnalysis/index';

export const useElevationState = () => {
  const [startTime] = useState<number>(Date.now());
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [elevationData, setElevationData] = useState<any[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [highPoint, setHighPoint] = useState<any>(null);
  const [lowPoint, setLowPoint] = useState<any>(null);
  const [elevationGain, setElevationGain] = useState<number>(0);
  const [elevationLoss, setElevationLoss] = useState<number>(0);
  const [bearing, setBearing] = useState<number | null>(null); // Bearing/Azimuth angle between two points
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const [storageType, setStorageType] = useState<'permanent' | 'temporary'>('permanent');
  const [showFullGraph, setShowFullGraph] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false); // Collapse/minimize state
  const [highPointMarker, setHighPointMarker] =
    useState<google.maps.Marker | null>(null);
  const [lowPointMarker, setLowPointMarker] =
    useState<google.maps.Marker | null>(null);

  const [hoverMarker, setHoverMarker] = useState<google.maps.Marker | null>(
    null
  );
  const [clickMarker, setClickMarker] = useState<google.maps.Marker | null>(
    null
  );
  const [clickInfoWindow, setClickInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoverInfoWindow, setHoverInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);
  const [isHoverEnabled, setIsHoverEnabled] = useState<boolean>(true);

  const elevatorRef = useRef<google.maps.ElevationService | null>(null);
  const chartRef = useRef<any>(null);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });

  // ✨ LOS Analysis state variables
  const [buildingData, setBuildingData] = useState<Building[]>([]);
  const [obstacleData, setObstacleData] = useState<Obstacle[]>([]);
  const [losAnalysis, setLosAnalysis] = useState<LOSAnalysisResult | null>(null);
  const [showLOSAnalysis, setShowLOSAnalysis] = useState<boolean>(false);
  const [antennaHeight1, setAntennaHeight1] = useState<number>(30);
  const [antennaHeight2, setAntennaHeight2] = useState<number>(30);
  const [rfFrequency, setRfFrequency] = useState<number>(2400);
  const [loadingBuildings, setLoadingBuildings] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // 🎬 3D View State
  const [show3DView, setShow3DView] = useState<boolean>(false);
  const [view3DOverlays, setView3DOverlays] = useState<Array<google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow>>([]);
  const [view3DControls, setView3DControls] = useState<{ reset: () => void; adjustTilt: (tilt: number) => void; rotate: (degrees: number) => void } | null>(null);

  // 🆕 Multi-point mode
  const [multiPointMode, setMultiPointMode] = useState<boolean>(false);
  const [pointToElevationIndexMap, setPointToElevationIndexMap] = useState<Map<string, number>>(new Map());
  const [segmentElevationStats, setSegmentElevationStats] = useState<any[]>([]);

  return {
    points, setPoints,
    startTime,
    markers, setMarkers,
    polyline, setPolyline,
    elevationData, setElevationData,
    totalDistance, setTotalDistance,
    highPoint, setHighPoint,
    lowPoint, setLowPoint,
    elevationGain, setElevationGain,
    elevationLoss, setElevationLoss,
    bearing, setBearing,
    loading, setLoading,
    name, setName,
    description, setDescription,
    showSaveDialog, setShowSaveDialog,
    showCloseWarning, setShowCloseWarning,
    storageType, setStorageType,
    showFullGraph, setShowFullGraph,
    isExpanded, setIsExpanded,
    isMinimized, setIsMinimized,
    highPointMarker, setHighPointMarker,
    lowPointMarker, setLowPointMarker,
    hoverMarker, setHoverMarker,
    clickMarker, setClickMarker,
    clickInfoWindow, setClickInfoWindow,
    hoveredDataIndex, setHoveredDataIndex,
    hoverInfoWindow, setHoverInfoWindow,
    isHoverEnabled, setIsHoverEnabled,
    elevatorRef,
    chartRef,
    notification, setNotification,
    buildingData, setBuildingData,
    obstacleData, setObstacleData,
    losAnalysis, setLosAnalysis,
    showLOSAnalysis, setShowLOSAnalysis,
    antennaHeight1, setAntennaHeight1,
    antennaHeight2, setAntennaHeight2,
    rfFrequency, setRfFrequency,
    loadingBuildings, setLoadingBuildings,
    saving, setSaving,
    isEditMode, setIsEditMode,
    show3DView, setShow3DView,
    view3DOverlays, setView3DOverlays,
    view3DControls, setView3DControls,
    multiPointMode, setMultiPointMode,
    pointToElevationIndexMap, setPointToElevationIndexMap,
    segmentElevationStats, setSegmentElevationStats
  };
};

