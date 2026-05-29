import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch } from "../../../store/index";
import { addNotification } from "../../../store/slices/ui/index";
import { INITIAL_LAYERS_STATE } from "../constants/index";
import { LayerState, BoundarySettings } from "../types/index";
import { DataHubEntry } from "../../../types/gisToolTypes/index";
import { User } from "../../../types/auth/authCore";
import * as apiService from "../../../services/api/index";
import { websocketService } from "../../../services/websocket/index";
import { loadBoundariesWithFallback } from "../../../services/region/publicBoundaryService";
import { reloadIndiaBoundary } from "../../../utils/indiaBoundary/index";
import { getAllColors } from "../../../utils/boundaryColors";
import {
  setOverlaysVisibility,
} from "../../../utils/layerVisualization/index";
import { debounce } from "../../../utils/gisDebounce";
import {
  buildUserFilter,
  getActionText,
  filterBoundariesByRegion,
  renderBoundaryPolygons,
} from "../utils/mapLayerUtils";

export const useMapLayers = (
  mapInstance: google.maps.Map | null,
  user: User | null,
  activeGISTool: string | null,
  assignedRegions: string[],
  boundarySettings: BoundarySettings
) => {
  const dispatch = useAppDispatch();
  const [layersState, setLayersState] =
    useState<LayerState>(INITIAL_LAYERS_STATE);
  // DataHub entries removed - tools no longer save to DB
  const [userFilter, setUserFilter] = useState<"me" | "all" | "user">("me");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined,
  );

  // Refs
  const regionBoundaryPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const dataLayerRef = useRef<google.maps.Data | null>(null);
  const activeGISToolRef = useRef<string | null>(null);
  const prevAssignedRegionsRef = useRef<string[]>([]);
  const prevLayerVisibleRef = useRef<boolean>(false);
  const layersStateRef = useRef(layersState);
  const callbacksRef = useRef<Record<string, () => void>>({});

  useEffect(() => {
    activeGISToolRef.current = activeGISTool;
  }, [activeGISTool]);
  useEffect(() => {
    layersStateRef.current = layersState;
  }, [layersState]);

  // Infrastructure and Customer module removed

  const loadRegionBoundariesLayer = useCallback(
    async (forceRefresh = false) => {
      if (!mapInstance) return;
      regionBoundaryPolygonsRef.current.forEach((p) => {
        google.maps.event.clearInstanceListeners(p);
        p.setMap(null);
      });
      regionBoundaryPolygonsRef.current = [];
      if (!layersState.RegionBoundaries?.visible) return;

      const currentRequestId = Date.now();
      (loadRegionBoundariesLayer as any).activeRequestId = currentRequestId;

      try {
        const boundaries = await loadBoundariesWithFallback(forceRefresh);

        if (
          (loadRegionBoundariesLayer as any).activeRequestId !==
          currentRequestId
        )
          return;

        const filtered = filterBoundariesByRegion(boundaries, assignedRegions);

        const isMonochrome = layersState.RegionBoundaries?.monochrome || false;
        renderBoundaryPolygons(
          mapInstance,
          filtered,
          getAllColors(isMonochrome),
          isMonochrome,
          activeGISToolRef,
          regionBoundaryPolygonsRef,
        );

        setLayersState((prev) => ({
          ...prev,
          RegionBoundaries: {
            ...prev.RegionBoundaries,
            count: filtered.length,
          },
        }));
      } catch (e) {
        console.error("Error loading boundaries", e);
      }
    },
    [
      mapInstance,
      layersState.RegionBoundaries?.visible,
      layersState.RegionBoundaries?.monochrome,
      assignedRegions,
    ],
  );

  const loadLayerData = useCallback(async () => {
    callbacksRef.current = {
      loadRegionBoundariesLayer,
    };
  }, [
    loadRegionBoundariesLayer,
    userFilter,
    selectedUserId,
  ]);

  const handleLayerToggle = (layerType: string) => {
    // Read overlays from the ref (always latest) to avoid stale closure issues
    // when overlays were created asynchronously by processType/loadSectorRFData
    const latestLayer = layersStateRef.current[layerType as keyof typeof layersStateRef.current];
    const latestOverlays = latestLayer?.overlays || [];

    setLayersState((prev) => {
      const layer = prev[layerType as keyof typeof prev];
      const newVisibility = !layer.visible;

      if (layerType === "RegionBoundaries") {
        if (!newVisibility) {
          regionBoundaryPolygonsRef.current.forEach((p) => {
            google.maps.event.clearInstanceListeners(p);
            p.setMap(null);
          });
        }
      } else {
        // Default case
        setOverlaysVisibility(latestOverlays, newVisibility, mapInstance);
      }
      return { ...prev, [layerType]: { ...layer, visible: newVisibility } };
    });
  };

  const handleColorModeToggle = (layerType: string) => {
    if (layerType === "RegionBoundaries")
      setLayersState((prev) => ({
        ...prev,
        RegionBoundaries: {
          ...prev.RegionBoundaries,
          monochrome: !prev.RegionBoundaries.monochrome,
        },
      }));
  };

  useEffect(() => {
    loadLayerData();
  }, [userFilter, selectedUserId, loadLayerData]);

  // Distance/Polygon/Circle/Elevation layer distribution removed
  // Tools no longer save to DB - Geometry Suite is a real-time utility only

  // Sync visibility when layersState changes
  useEffect(() => {
    if (!mapInstance) return;

    Object.entries(layersState).forEach(([key, layer]) => {
      if (layer && Array.isArray(layer.overlays)) {
        setOverlaysVisibility(layer.overlays, layer.visible, mapInstance);
      }
    });
  }, [layersState, mapInstance]);

  useEffect(() => {
    if (mapInstance) {
      // loadLayerData(); // Already called in the effect above
      // Only load boundaries if visible - consolidated from multiple effects
      if (layersState.RegionBoundaries?.visible) {
        loadRegionBoundariesLayer();
      }
    }
  }, [mapInstance]); // eslint-disable-line

  useEffect(() => {
    const regionsChanged =
      assignedRegions.length !== prevAssignedRegionsRef.current.length ||
      assignedRegions.some((r, i) => r !== prevAssignedRegionsRef.current[i]);
    const visChanged =
      layersState.RegionBoundaries?.visible !== prevLayerVisibleRef.current;
    
    // Check for monochrome change
    const currentMono = layersState.RegionBoundaries?.monochrome || false;
    const monoChanged = (loadRegionBoundariesLayer as any).prevMonochrome !== currentMono;

    if (regionsChanged) prevAssignedRegionsRef.current = [...assignedRegions];
    if (visChanged)
      prevLayerVisibleRef.current =
        layersState.RegionBoundaries?.visible || false;
    
    // Store current mono for next check
    (loadRegionBoundariesLayer as any).prevMonochrome = currentMono;

    if (
      mapInstance &&
      layersState.RegionBoundaries?.visible &&
      (regionsChanged || visChanged || monoChanged)
    )
      loadRegionBoundariesLayer();
  }, [
    assignedRegions,
    mapInstance,
    layersState.RegionBoundaries?.visible,
    layersState.RegionBoundaries?.monochrome,
    loadRegionBoundariesLayer,
  ]);

  // Removed duplicate useEffect - consolidated into the one above

  useEffect(() => {
    let subscriptionId: string | null = null,
      refreshTimeout: any;
    const setupSubscription = () => {
      // 1. Subscribe to GIS Data Updates
      subscriptionId = websocketService.subscribe(
        "gis_data_updated",
        (data: any) => {
          dispatch(
            addNotification({
              type: "info",
              title: "GIS Data Update",
              message: `${data.toolType?.charAt(0).toUpperCase()}${data.toolType?.slice(1) || "Item"} ${getActionText(data.action)}`,
              autoClose: true,
              duration: 3000,
            }),
          );
          callbacksRef.current.loadInfrastructureCounts?.();
          const toolType = data.toolType?.toLowerCase(),
            currentLayers = layersStateRef.current,
            callbacks = callbacksRef.current;
          if (refreshTimeout) clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
            if (
              (toolType === "region" || toolType === "boundary") &&
              currentLayers.RegionBoundaries?.visible
            ) {
              // Force refresh for boundary updates
              (callbacks.loadRegionBoundariesLayer as any)?.(true);
              reloadIndiaBoundary().catch((err) =>
                console.error("Failed to reload geofence boundary:", err)
              );
            }
          }, 500);
        },
      );

      // 2. Subscribe to Boundary Published Events (CRITICAL FIX)
      // The backend emits 'boundary_published' separately from 'gis_data_updated'
      const boundarySubId = websocketService.subscribe(
        "boundary_published",
        (data: any) => {
          dispatch(
            addNotification({
              type: "success",
              title: "Boundary Published",
              message: `Region ${data.regionName} boundary has been updated (v${data.versionNumber})`,
              autoClose: true,
              duration: 4000,
            }),
          );

          // Force refresh boundaries
          if (layersStateRef.current.RegionBoundaries?.visible) {
            (callbacksRef.current.loadRegionBoundariesLayer as any)?.(true);
          }

          // Force refresh geofence boundaries
          reloadIndiaBoundary().catch((err) =>
            console.error("Failed to reload geofence boundary:", err)
          );
        },
      );

      // We need to track multiple subscriptions now
      (setupSubscription as any).boundarySubId = boundarySubId;
    };
    if (!websocketService.isConnected())
      websocketService.connect().then((c) => {
        if (c) setupSubscription();
      });
    else setupSubscription();

    return () => {
      if (subscriptionId) websocketService.unsubscribe(subscriptionId);
      if ((setupSubscription as any).boundarySubId)
        websocketService.unsubscribe((setupSubscription as any).boundarySubId);
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, []);

  useEffect(() => {
    if (mapInstance && dataLayerRef.current) dataLayerRef.current.setMap(null);
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance) return;
    const panorama = mapInstance.getStreetView();
    const l = panorama.addListener("visible_changed", () => {
      if (panorama.getVisible())
        setTimeout(
          () =>
            Object.values(layersState).forEach((layer) => {
              if (layer.visible && layer.overlays.length)
                layer.overlays.forEach((item: any) => {
                  const o = item.overlay as any;
                  if (o.setOptions)
                    o.setOptions({ zIndex: 999999, visible: true });
                  else if (o.setVisible) {
                    o.setZIndex(1000000);
                    o.setVisible(true);
                  }
                });
            }),
          100,
        );
    });

    return () => {
      google.maps.event.removeListener(l);
    };
  }, [mapInstance, layersState]);

  // Cleanup boundary polygons on unmount
  useEffect(() => {
    return () => {
      // Clean up all boundary polygons when component unmounts
      regionBoundaryPolygonsRef.current.forEach((p) => {
        google.maps.event.clearInstanceListeners(p);
        p.setMap(null);
      });
      regionBoundaryPolygonsRef.current = [];

      // Clean up all layer overlays
      Object.values(layersState).forEach((layer) => {
        if (layer.overlays && layer.overlays.length > 0) {
          layer.overlays.forEach((item: any) => {
            if (item.overlay && typeof item.overlay.setMap === "function") {
              item.overlay.setMap(null);
            }
          });
        }
      });

      // Clean up clusterers

      // CRITICAL FIX: Clear the Global Overlay Registry
      // This prevents "Zombie" entries from blocking recreation of overlays on map remount
      // If we don't do this, createOverlaysFromData thinks filters already exist and skips creating them for the new map
      const { overlayRegistry } = require("../../../utils/overlayRegistry");
      overlayRegistry.clear();
      console.log("🧹 [useMapLayers] content: Registry cleared.");

      // console.log('🧹 [useMapLayers] Cleaned up all layers on unmount');
    };
  }, []);

  return {
    layersState,
    setLayersState,
    userFilter,
    setUserFilter,
    selectedUserId,
    setSelectedUserId,
    loadLayerData,
    handleLayerToggle,
    handleColorModeToggle,
  };
};

