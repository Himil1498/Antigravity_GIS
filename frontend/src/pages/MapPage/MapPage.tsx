import { createRoot } from "react-dom/client";
import React, {
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  useEffect,
} from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/index";
import { toast } from "react-toastify";
import { setActiveGISTool, setNetworkCatalogOpen, setNetworkCatalogMinimized, setVisibleFileIds as setVisibleFileIdsAction, addVisibleFileId, removeVisibleFileId, setWorkspaceMode } from "../../store/slices/mapSlice";
import PageContainer from "../../components/ui/PageContainer";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import MapErrorFallback from "../../components/ui/MapErrorFallback";
import MapPopup from "../../features/network-planning/components/NetworkMap/MapPopup";
import MapToolbar from "../../features/map/components/MapToolbar/index";
import LiveCoordinates from "../../features/map/components/LiveCoordinates";
import NetworkLayerOverlay from "../../features/network-planning/components/NetworkMap/NetworkLayerOverlay";
import {
  MapErrorScreen,
  MapLoadingScreen,
} from "../../features/map/components/MapLoadingStates";
import { ToolActiveTip } from "../../components/ui/ToolActiveTip";
import { useMapInitialization } from "../../features/map/hooks/useMapInitialization";
import { useMapUser } from "../../features/map/hooks/useMapUser";
import { useMapLayers } from "../../features/map/hooks/useMapLayers";
import { useMap360View } from "../../features/map/hooks/useMap360View";
import { useAddressInspector } from "../../features/map/hooks/useAddressInspector";
import {
  handleSettingsChange,
  handleSaveAllPreferences,
} from "../../features/map/utils/mapSettingsHandlers";
import { networkPlanningService } from "../../features/network-planning/services/api";


import { AutoFeasibilityModal } from "../../features/network-planning/components/AutoFeasibility/AutoFeasibilityModal";
import { AutoFeasibilityResults } from "../../features/network-planning/components/AutoFeasibility/AutoFeasibilityResults";
import { AutoFeasibilityLayerOverlay } from "../../features/network-planning/components/AutoFeasibility/AutoFeasibilityLayerOverlay";
import AdvancedElevationDrawer from "../../features/map/tools/MeasurementSuiteTool/components/AdvancedElevationDrawer";

// Lazy Load Heavy Components
const MapSettings = lazy(
  () => import("../../features/map/components/MapSettings/index"),
);

const StreetView360Modal = lazy(
  () => import("../../features/map/components/StreetView360Modal"),
);
const NetworkDataCatalog = lazy(
  () => import("../../features/network-planning/components/NetworkDataCatalog"),
);
const FeasibilityWorkspaceOverlay = lazy(
  () => import("../../features/map/components/FeasibilityHub/FeasibilityWorkspaceOverlay"),
);


const MapPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isMapLoaded, activeGISTool, networkCatalogOpen: showNetworkCatalog, networkCatalogMinimized: isNetworkCatalogMinimized, visibleFileIds, workspaceMode } =
    useAppSelector((state) => state.map);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Labels toggle state
  const [showLabels, setShowLabels] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(5);

  const [isAutoFeasibilityActive, setIsAutoFeasibilityActive] = useState(false);
  const [autoFeasibilityResults, setAutoFeasibilityResults] = useState<any[]>([]);
  const [feasibilityElevationPoints, setFeasibilityElevationPoints] = useState<{lat: number, lng: number}[]>([]);
  const [afPanelFocused, setAfPanelFocused] = useState(false);

  // Derived: Visible Folder IDs (for UI expansion/checking parents)
  // We can derive this if needed, but we don't store it as primary state anymore.

  // Store detailed folder info for Active Layers Legend and Toggling Logic
  const [folderNamesMap, setFolderNamesMap] = useState<
    Record<
      number,
      {
        name: string;
        type: "infrastructure" | "customer";
        iconType?: string; // Added iconType
        files: { id: number; name: string }[];
      }
    >
  >({});
  // Track Modifier Keys Global State (Robust fallback for event wrappers)
  const modifiersRef = React.useRef({ ctrl: false, meta: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") modifiersRef.current.ctrl = true;
      if (e.key === "Meta") modifiersRef.current.meta = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") modifiersRef.current.ctrl = false;
      if (e.key === "Meta") modifiersRef.current.meta = false;
    };

    const handleBlur = () => {
      modifiersRef.current = { ctrl: false, meta: false };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Sync afPanelFocused with global Focus Map mode
  useEffect(() => {
    const handleFocusToggle = (e: any) => {
      if (e.detail && typeof e.detail.collapse === "boolean") {
        setAfPanelFocused(e.detail.collapse);
      }
    };
    window.addEventListener("setMapToolbarCollapse" as any, handleFocusToggle);
    return () => window.removeEventListener("setMapToolbarCollapse" as any, handleFocusToggle);
  }, []);




  const {
    mapContainerRef,
    mapInstance,
    isLoaded,
    loadError,
    boundarySettings,
    setBoundarySettings,
    setUserPreferences,
    userPreferences,
  } = useMapInitialization();
  const { user, assignedRegions } = useMapUser();

  // 🆕 URL and Breadcrumb Logic
  const location = useLocation();
  const isOnMapRoute = location.pathname === "/map";
  const [searchParams, setSearchParams] = useSearchParams();
  const toolFromUrl = isOnMapRoute ? searchParams.get("tool") : null;
  const catalogFromUrl = isOnMapRoute ? searchParams.get("network-catalog") === "open" : false;
  const settingsFromUrl = isOnMapRoute ? searchParams.get("settings") === "open" : false;
  const workspaceFromUrl = isOnMapRoute ? searchParams.get("workspace") : null;
  const autoFeasibilityFromUrl = isOnMapRoute ? searchParams.get("auto-feasibility") === "open" : false;

  // Stable ref for searchParams to avoid dependency-loop in State→URL effect
  const searchParamsRef = React.useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Guard: suppress State→URL effect while URL→State is applying
  const isSyncingFromUrl = React.useRef(false);

  // Helper to get tool label
  const getToolLabel = useCallback((toolId: string | null) => {
    switch (toolId) {
      case "distance": return "Distance Measurement";
      case "polygon": return "Polygon Drawing";
      case "circle": return "Circle/Radius";
      case "elevation": return "Elevation Profile";
      case "sectorRF": return "Sector RF Coverage";
      default: return null;
    }
  }, []);

  // Sync URL -> Redux/State on mount and URL change
  useEffect(() => {
    isSyncingFromUrl.current = true;
    // URL → State: Only apply if URL explicitly HAS the param.
    // Absence of a param should NOT override persisted Redux state.
    if (toolFromUrl && toolFromUrl !== activeGISTool) {
      dispatch(setActiveGISTool(toolFromUrl as any));
    }
    if (catalogFromUrl && !showNetworkCatalog) {
      // URL says open, Redux says closed → open it
      dispatch(setNetworkCatalogOpen(true));
    }
    if (settingsFromUrl && !showSettingsModal) {
      setShowSettingsModal(true);
    }
    if (workspaceFromUrl && workspaceFromUrl !== workspaceMode) {
      dispatch(setWorkspaceMode(workspaceFromUrl as any));
    }
    if (autoFeasibilityFromUrl && !isAutoFeasibilityActive && autoFeasibilityResults.length === 0) {
      setIsAutoFeasibilityActive(true);
    }
    // Release guard after React processes the state updates
    Promise.resolve().then(() => { isSyncingFromUrl.current = false; });
  }, [toolFromUrl, catalogFromUrl, settingsFromUrl, workspaceFromUrl, autoFeasibilityFromUrl, dispatch]);

  // Sync Redux/State -> URL (STABLE: no searchParams in deps, uses ref)
  useEffect(() => {
    // Skip if we're currently applying URL→State to avoid ping-pong
    if (isSyncingFromUrl.current) return;
    // Only sync state to URL when actually on the map route
    if (!isOnMapRoute) return;

    const currentParams = searchParamsRef.current;
    const targetParams = new URLSearchParams(currentParams);
    let hasChanges = false;

    const setParamIf = (key: string, condition: string | boolean | null, val: string = "open") => {
      if (condition) {
        if (targetParams.get(key) !== val) {
          targetParams.set(key, val);
          hasChanges = true;
        }
      } else {
        if (targetParams.has(key)) {
          targetParams.delete(key);
          hasChanges = true;
        }
      }
    };

    setParamIf("tool", activeGISTool, activeGISTool || "");
    setParamIf("network-catalog", showNetworkCatalog, "open");
    setParamIf("settings", showSettingsModal, "open");
    setParamIf("workspace", workspaceMode !== "view", workspaceMode);
    setParamIf("auto-feasibility", isAutoFeasibilityActive || autoFeasibilityResults.length > 0, "open");

    if (hasChanges) {
      setSearchParams(targetParams, { replace: true });
    }
  }, [activeGISTool, showNetworkCatalog, showSettingsModal, workspaceMode, isAutoFeasibilityActive, autoFeasibilityResults.length, setSearchParams, isOnMapRoute]);

  // Document Title (separate effect — only modify when on map route)
  useEffect(() => {
    if (!isOnMapRoute) return;
    const toolLabel = getToolLabel(activeGISTool);
    let title = "Main Map | OptiConnect GIS";
    if (showSettingsModal) {
      title = `Map Preferences | OptiConnect GIS`;
    } else if (showNetworkCatalog) {
      title = `Network Data Catalog ${toolLabel ? `(${toolLabel})` : ""} | OptiConnect GIS`;
    } else if (toolLabel) {
      title = `${toolLabel} | OptiConnect GIS`;
    }
    document.title = title;
    return () => { document.title = "OptiConnect GIS"; };
  }, [activeGISTool, showNetworkCatalog, showSettingsModal, getToolLabel, isOnMapRoute]);


  const {
    layersState,
    userFilter,
    setUserFilter,
    selectedUserId,
    setSelectedUserId,
    loadLayerData,
    handleLayerToggle,
    handleColorModeToggle,
  } = useMapLayers(
    mapInstance,
    user,
    activeGISTool,
    assignedRegions,
    boundarySettings
  );
  const {
    show360View,
    setShow360View,
    show360ViewPosition,
    setShow360ViewPosition,
  } = useMap360View(mapInstance, layersState);

  // Enable click-to-address (Reverse Geocoding)
  useAddressInspector(mapInstance, activeGISTool);

  const onSettingsChange = useCallback(
    (newSettings: any) =>
      handleSettingsChange(newSettings, setBoundarySettings, dispatch),
    [setBoundarySettings, dispatch],
  );
  const onSaveAllPreferences = useCallback(
    (allPrefs: any) =>
      handleSaveAllPreferences(
        allPrefs,
        setBoundarySettings,
        setUserPreferences,
        userPreferences,
        dispatch,
      ),
    [setBoundarySettings, setUserPreferences, userPreferences, dispatch],
  );


  /* Shared Region State for Catalog Filtering and Overlay */
  const [selectedCatalogRegionIds, setSelectedCatalogRegionIds] = useState<
    number[] | null
  >(null);

  const handleOpenSettings = useCallback(() => setShowSettingsModal(true), []);
  const handleToggleLabels = useCallback(() => setShowLabels((prev) => !prev), []);

  // Track zoom level for label visibility
  useEffect(() => {
    if (!mapInstance) return;
    const listener = mapInstance.addListener("zoom_changed", () => {
      setCurrentZoom(mapInstance.getZoom() || 5);
    });
    return () => google.maps.event.removeListener(listener);
  }, [mapInstance]);

  const handleToggleNetworkCatalog = useCallback(() => {
    if (showNetworkCatalog) {
      dispatch(setNetworkCatalogOpen(false));
      dispatch(setVisibleFileIdsAction([])); 
      setSelectedCatalogRegionIds(null);
    } else {
      dispatch(setNetworkCatalogOpen(true));
      dispatch(setNetworkCatalogMinimized(false)); // Reset to expanded when opening
    }
  }, [showNetworkCatalog, dispatch]);



  const handleRemoveLayer = useCallback((id: number) => {
    dispatch(removeVisibleFileId(id));
  }, [dispatch]);

  const handleClearAllLayers = useCallback(() => dispatch(setVisibleFileIdsAction([])), [dispatch]);

  const handleCloseNetworkCatalog = useCallback(() => {
    dispatch(setNetworkCatalogOpen(false));
    dispatch(setVisibleFileIdsAction([]));
    setSelectedCatalogRegionIds(null);
  }, [dispatch]);

  const handleToggleFile = useCallback((fileId: number, visible: boolean) => {
    if (visible) {
      dispatch(addVisibleFileId(fileId));
    } else {
      dispatch(removeVisibleFileId(fileId));
    }
  }, [dispatch]);

  const handleToggleFolder = useCallback(
    (folderId: number, visible: boolean) => {
      const folderInfo = folderNamesMap[folderId];
      if (!folderInfo || !folderInfo.files) return;

      const fileIds = folderInfo.files.map((f) => f.id);

      if (visible) {
        // Add all folder file IDs atomically
        fileIds.forEach((id) => dispatch(addVisibleFileId(id)));
      } else {
        // Remove all folder file IDs atomically
        fileIds.forEach((id) => dispatch(removeVisibleFileId(id)));
      }
    },
    [folderNamesMap, dispatch],
  );

  const handleCloseSettings = useCallback(
    () => setShowSettingsModal(false),
    [],
  );

  const handleClose360View = useCallback(() => {
    setShow360View(false);
    setShow360ViewPosition(null);
  }, [setShow360View, setShow360ViewPosition]);



  // Store detailed folder info for Active Layers Legend

  const handleRegionSelect = useCallback(
    (lat: number, lng: number, zoom: number, regionIds: number[] | null) => {
      setSelectedCatalogRegionIds(regionIds);
      if (mapInstance && regionIds && regionIds.length > 0) {
        // Only pan if we have coordinates (Logic in Catalog handles zooming to lat/lng)
        // The lat/lng passed here is already calculated by Catalog (State center or India center)
        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(zoom);
      }
    },
    [mapInstance],
  );

  // InfoWindow Ref for Network Features
  const infoWindowRef = React.useRef<google.maps.InfoWindow | null>(null);

  // INDUSTRY STANDARD FIX: Ensure InfoWindow closes when locations/icons are removed from the map
  useEffect(() => {
    if (visibleFileIds.length === 0 && infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [visibleFileIds]);

  const handleNetworkFeatureClick = useCallback(
    (
      properties: any,
      pos: { lat: number; lng: number },
      eventWrapper?: any,
    ) => {
      // Check global key state (most reliable) OR event modifiers
      const isGlobalModifierPressed =
        modifiersRef.current.ctrl || modifiersRef.current.meta;

      // Also check event object just in case (fallback)
      const nativeEvent = eventWrapper?.srcEvent || eventWrapper;
      const isEventModifierPressed =
        (nativeEvent && (nativeEvent.ctrlKey || nativeEvent.metaKey)) ||
        (eventWrapper && (eventWrapper.ctrlKey || eventWrapper.metaKey));

      const isModifierPressed =
        isGlobalModifierPressed || isEventModifierPressed;

      if (!mapInstance) return;

      // Strict Blocking: Block Info Window if ANY tool is active AND no modifier
      if (activeGISTool && !isModifierPressed) {
        // Show a helpful tip to the user
        toast.info("Hold Ctrl+Click for Features, or Alt+Click for Address while tool is active", {
          toastId: "ctrl-click-tip", // Prevent duplicate toasts
          autoClose: 3000,
          position: "bottom-left"
        });
        return;
      }

      const container = document.createElement("div");
      if (document.documentElement.classList.contains("dark")) {
        container.classList.add("dark");
      }
      container.style.fontFamily = "Inter, sans-serif";
      container.style.position = "relative";
      container.style.zIndex = "99999";

      const root = createRoot(container);
      root.render(
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <MapPopup 
            properties={properties || {}} 
            onClose={() => {
              if (infoWindowRef.current) infoWindowRef.current.close();
            }}
          />
          <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/50 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic font-medium">
              Tip: Hold <span className="font-bold text-blue-500 dark:text-blue-400">Ctrl + Click</span> to view features anytime
            </p>
          </div>
        </div>,
      );

      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 320,
          minWidth: 240,
          pixelOffset: new google.maps.Size(0, -10),
          zIndex: 999999, // Critical fix for DeckGL overlay
        });
      }

      infoWindowRef.current.setContent(container);
      infoWindowRef.current.setPosition(pos);
      infoWindowRef.current.open(mapInstance);
    },
    [mapInstance, activeGISTool],
  );





  if (loadError) return <MapErrorScreen error={loadError} />;
  if (!isLoaded) return <MapLoadingScreen />;

  return (
    <>
      <PageContainer className="overflow-hidden">
        <ErrorBoundary
          fallback={<MapErrorFallback />}
          onError={(error) => console.error("Map Page Error:", error)}
        >
          <div className="relative w-full h-full overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />

            {isMapLoaded && mapInstance && (
              <MapToolbar
                map={mapInstance}
                layersState={layersState}
                onLayerToggle={handleLayerToggle}
                onColorModeToggle={handleColorModeToggle}
                onOpenSettings={handleOpenSettings}
                onDataSaved={loadLayerData}

                userFilter={userFilter}
                selectedUserId={selectedUserId}
                onUserFilterChange={setUserFilter}
                onSelectedUserIdChange={setSelectedUserId}
                onOpenNetworkCatalog={handleToggleNetworkCatalog}
                networkCatalogOpen={showNetworkCatalog}
                networkCatalogMinimized={isNetworkCatalogMinimized}
                isZoomedIn={currentZoom >= 9}
                onToggleFeasibility={() => dispatch(setWorkspaceMode(workspaceMode === 'feasibility' ? 'view' : 'feasibility'))}
                isFeasibilityActive={workspaceMode === 'feasibility'}
                onToggleAutoFeasibility={() => {
                  if (isAutoFeasibilityActive || autoFeasibilityResults.length > 0) {
                    setIsAutoFeasibilityActive(false);
                    setAutoFeasibilityResults([]);
                    setFeasibilityElevationPoints([]);
                  } else {
                    setIsAutoFeasibilityActive(true);
                  }
                }}
                isAutoFeasibilityActive={isAutoFeasibilityActive || autoFeasibilityResults.length > 0}
              />
            )}

            {/* Network Planning Overlays - render as long as there are visible files, even if catalog panel is closed */}
            {isMapLoaded && mapInstance && (showNetworkCatalog || visibleFileIds.length > 0) && (
              <NetworkLayerOverlay
                map={mapInstance}
                visibleFileIds={visibleFileIds}
                onFeatureClick={handleNetworkFeatureClick as unknown as (feature: { properties: Record<string, string>; geometry: Record<string, unknown>; }, location: Record<string, unknown>, event: Record<string, unknown>) => void}
                regionIds={
                  selectedCatalogRegionIds && selectedCatalogRegionIds.length > 0
                    ? selectedCatalogRegionIds
                    : boundarySettings?.selectedRegion
                      ? [Number(boundarySettings.selectedRegion)]
                      : null
                }
                showLabels={showLabels && currentZoom >= 9}
              />
            )}


            <Suspense fallback={null}>
              <NetworkDataCatalog
                isOpen={showNetworkCatalog}
                onClose={handleCloseNetworkCatalog}
                isMinimized={isNetworkCatalogMinimized}
                onMinimizeChange={(minimized: boolean) => dispatch(setNetworkCatalogMinimized(minimized))}
                visibleFolderIds={[]} // Legacy prop (unused)
                visibleFileIds={visibleFileIds}
                onToggleFolder={handleToggleFolder}
                onToggleFile={handleToggleFile}
                onRegionSelect={handleRegionSelect}
                onCatalogLoaded={setFolderNamesMap}
                showLabels={showLabels}
                onToggleLabels={visibleFileIds.length > 0 ? handleToggleLabels : undefined}
              />
            </Suspense>

            {/* Left Panel Stack - Dynamic Positioning */}
            <div
              id="map-left-panel-stack"
              className="absolute top-16 left-12 z-10 flex flex-col gap-2 pointer-events-none"
            >
              {/* Active Layers Legend removed as per request */}


            </div>

            {/* Root Level Panels Overlay - Z-Index 100 */}
            {/* <div className="absolute inset-0 pointer-events-none z-[100]"> */}
              {/* <Suspense fallback={null}> */}

              {/* </Suspense> */}
            {/* </div> */}

            <LiveCoordinates map={mapInstance} />

            <Suspense fallback={null}>
              <MapSettings
                isOpen={showSettingsModal}
                onClose={handleCloseSettings}
                settings={boundarySettings}
                map={mapInstance}
                currentPreferences={
                  userPreferences
                    ? {
                        default_zoom: userPreferences.default_zoom || 10,
                        default_center: userPreferences.default_center,
                        default_region_id: userPreferences.default_region_id,
                        default_map_type: userPreferences.default_map_type,
                        boundary: boundarySettings,
                      }
                    : undefined
                }
                onSettingsChange={onSettingsChange}
                onSaveAllPreferences={onSaveAllPreferences}
              />
            </Suspense>

            {show360View && show360ViewPosition && (
              <Suspense
                fallback={
                  <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/50 text-white">
                    Loading 360 View...
                  </div>
                }
              >
                <StreetView360Modal
                  show360ViewPosition={show360ViewPosition}
                  onClose={handleClose360View}
                />
              </Suspense>
            )}

            {/* ── Feasibility Workspace Overlay ── */}
            {isMapLoaded && mapInstance && workspaceMode === 'feasibility' && (
              <Suspense fallback={null}>
                <FeasibilityWorkspaceOverlay
                  map={mapInstance}
                  onClose={() => dispatch(setWorkspaceMode('view'))}
                />
              </Suspense>
            )}

            {/* ── Auto Feasibility Checker ── */}
            <AutoFeasibilityModal
              isOpen={isAutoFeasibilityActive}
              onClose={() => setIsAutoFeasibilityActive(false)}
              onResults={(results) => {
                setAutoFeasibilityResults(results);
                setIsAutoFeasibilityActive(false);
              }}
            />
            <AutoFeasibilityResults
              results={autoFeasibilityResults}
              onUpdateResults={setAutoFeasibilityResults}
              isFocused={afPanelFocused}
              setIsFocused={setAfPanelFocused}
              onClose={() => {
                setAutoFeasibilityResults([]);
                setFeasibilityElevationPoints([]);
              }}
              onClear={() => {
                setAutoFeasibilityResults([]);
                setFeasibilityElevationPoints([]);
              }}
              onShowElevationProfile={(r) => {
                const targetInfra = (r.available_infras && r.available_infras.length > 0) 
                  ? r.available_infras[r.selectedAltIndex || 0] 
                  : r.nearest_infra;
                  
                if (r.is_feasible && targetInfra?.geom?.coordinates) {
                  const path = [
                    { lat: r.lat, lng: r.lng },
                    { lat: targetInfra.geom.coordinates[1], lng: targetInfra.geom.coordinates[0] }
                  ];
                  setFeasibilityElevationPoints(path);
                  
                  // Auto Focus Map & Preserve 3D State
                  if (mapInstance) {
                    const currentTilt = mapInstance.getTilt() || 0;
                    const currentHeading = mapInstance.getHeading() || 0;
                    
                    const bounds = new google.maps.LatLngBounds();
                    bounds.extend(new google.maps.LatLng(r.lat, r.lng));
                    bounds.extend(new google.maps.LatLng(targetInfra.geom.coordinates[1], targetInfra.geom.coordinates[0]));
                    mapInstance.fitBounds(bounds, { top: 100, bottom: 400, left: 100, right: 350 });
                    
                    // If map was in 3D, restore tilt and heading immediately after bounds calculation
                    if (currentTilt > 0) {
                      setTimeout(() => {
                        mapInstance.setTilt(currentTilt);
                        mapInstance.setHeading(currentHeading);
                      }, 50); // slight delay to let fitBounds apply zoom/center first
                    }
                  }
                }
              }}
            />
            <AutoFeasibilityLayerOverlay
              map={mapInstance}
              results={autoFeasibilityResults}
              visible={autoFeasibilityResults.length > 0}
              onPointClick={(info) => {
                if (info.object && info.object.is_feasible && info.object.nearest_infra) {
                  // Show the advanced elevation drawer with the path
                  const path = [
                    { lat: info.object.lat, lng: info.object.lng },
                    { lat: info.object.nearest_infra.geom.coordinates[1], lng: info.object.nearest_infra.geom.coordinates[0] }
                  ];
                  setFeasibilityElevationPoints(path);
                }
              }}
            />

            {/* Render Advanced Elevation Drawer for Feasibility Paths */}
            {feasibilityElevationPoints.length > 0 && (
              <AdvancedElevationDrawer
                map={mapInstance}
                points={feasibilityElevationPoints}
                markers={[]}
                onClose={() => setFeasibilityElevationPoints([])}
                measurementLabel="Feasibility Path"
                onFocusMap={() => {
                  const nextState = !afPanelFocused;
                  setAfPanelFocused(nextState);
                  (window as any).isGisFocusActive = nextState;
                  window.dispatchEvent(
                    new CustomEvent("setMapToolbarCollapse", { detail: { collapse: nextState } })
                  );
                }}
                isFocusActive={afPanelFocused}
              />
            )}

          </div>
        </ErrorBoundary>
      </PageContainer>
    </>
  );
};

export default MapPage;
