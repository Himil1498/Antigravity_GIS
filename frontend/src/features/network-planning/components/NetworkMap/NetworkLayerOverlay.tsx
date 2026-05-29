import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { MVTLayer } from "@deck.gl/geo-layers";
import { MVTLoader } from "@loaders.gl/mvt"; // Explicit Loader import
import { LineLayer, IconLayer } from "@deck.gl/layers"; // 1. Import LineLayer and IconLayer
import {
  ICON_DEFS,
  getIconMapping,
  getIconColor,
  generateIconAtlas,
  generateIconAtlasAsync,
  getIconKey,
  getFolderIconKey,
} from "./MapIcons";
import { DataFilterExtension } from "@deck.gl/extensions";
import { useAppSelector, useAppDispatch } from "../../../../store/index";
import { networkPlanningService } from "../../services/api";

interface NetworkLayerOverlayProps {
  map: google.maps.Map | null;
  visibleFileIds: number[];
  infoWindowRef?: React.MutableRefObject<google.maps.InfoWindow | null>;
  onFeatureClick?: (feature: { properties: Record<string, string>; geometry: Record<string, unknown>; }, location: Record<string, unknown>, event: Record<string, unknown>) => void;
  regionIds?: number[] | null;
  showLabels?: boolean;
  showPlanned?: boolean;
}

const NetworkLayerOverlay: React.FC<NetworkLayerOverlayProps> = ({
  map,
  visibleFileIds,
  infoWindowRef,
  onFeatureClick,
  regionIds,
  showLabels = false,
  showPlanned = true,
}) => {
  // Use provided infoWindowRef or create a local one as fallback
  const localInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeInfoWindowRef = infoWindowRef || localInfoWindowRef;

  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);

  // Server-side filtering: Pass file IDs to tile URL for efficient filtering
  const regionIdsKey = regionIds ? regionIds.sort().join(",") : "";
  const visibleFileIdsKey =
    visibleFileIds.length > 0 ? [...visibleFileIds].sort().join(",") : "";
  const tileUrl = useMemo(
    () =>
      networkPlanningService.getTileUrl(
        undefined,
        regionIds,
        visibleFileIds.length > 0 ? visibleFileIds : undefined,
      ),
    [regionIdsKey, visibleFileIdsKey], // Stable Keys
  );

  // Initialize Overlay
  const [triggerUpdate, setTriggerUpdate] = React.useState(0);

  // Allowed Folders Logic & Icon Mapping
  const [allowedFolderIds, setAllowedFolderIds] = React.useState<Set<number>>(
    new Set(),
  );
  const [folderIconMap, setFolderIconMap] = React.useState<
    Record<number, string>
  >({});
  const { user } = useAppSelector((state) => state.auth);

  // 🚀 Performance: Generate Icon Atlas (sync SVG first, then async PNG upgrade)
  const [iconAtlas, setIconAtlas] = useState<HTMLCanvasElement | null>(null);
  const [iconMapping, setIconMapping] = useState<Record<string, any>>({});
  const [atlasVersion, setAtlasVersion] = useState(0);
  const atlasInitialized = useRef(false);

  useEffect(() => {
    if (atlasInitialized.current) return;
    atlasInitialized.current = true;

    // Phase 1: Instant sync render with SVG fallbacks
    const { atlas: syncAtlas, mapping: syncMapping } = generateIconAtlas();
    setIconAtlas(syncAtlas);
    setIconMapping(syncMapping);

    // Phase 2: Async upgrade — load PNG telco logos and overdraw
    generateIconAtlasAsync().then(({ atlas, mapping }) => {
      // DECK.GL FIX: Deck.gl doesn't automatically detect mutations to an HTMLCanvasElement
      // that is already uploaded to WebGL as a texture. We MUST create a new canvas reference
      // to force Deck.gl to upload the newly loaded PNG logos!
      const newCanvas = document.createElement("canvas");
      newCanvas.width = atlas.width;
      newCanvas.height = atlas.height;
      const ctx = newCanvas.getContext("2d");
      if (ctx) ctx.drawImage(atlas, 0, 0);

      setIconAtlas(newCanvas);
      // Clone mapping to force reference check
      setIconMapping({ ...mapping });
      setAtlasVersion(v => v + 1);
      console.log("🎨 Icon atlas upgraded with telco PNG logos, forced layer redraw");
    }).catch((err) => {
      console.warn("⚠️ Async atlas upgrade failed, using SVG fallbacks:", err);
    });
  }, []);

  const isCatalogLoaded = useRef(false);

  useEffect(() => {
    if (!map) return;
    if (!activeInfoWindowRef.current) {
      activeInfoWindowRef.current = new google.maps.InfoWindow();
    }
  }, [map, activeInfoWindowRef]);
  const isCatalogFetching = useRef(false);

  useEffect(() => {
    if (user?.id && !isCatalogLoaded.current && !isCatalogFetching.current) {
      const fetchCatalog = async () => {
        try {
          isCatalogFetching.current = true;
          console.log("Fetching catalog strictly...");
          const catalog = await networkPlanningService.getUnifiedCatalog(
            Number(user.id),
          );

          const customerFolderIds = new Set<number>();
          const iconMap: Record<number, string> = {};

          // Helper to recurse and build maps
          const processFolder = (folder: { id: number; name: string; children?: any[]; files?: any[] }, parentName?: string) => {
            // 1. Build Icon Map
            const iconKey = getFolderIconKey(folder, parentName);
            if (iconKey) {
              iconMap[folder.id] = iconKey;
            }

            if (folder.children && Array.isArray(folder.children)) {
              (folder.children || []).forEach((child: { id: number; name: string; children?: any[]; files?: any[] }) =>
                processFolder(child, (folder as { name: string }).name),
              );
            }
          };

          // Process Generic Infrastructure
          if (catalog.infrastructure) {
            (catalog.infrastructure || []).forEach((f: { id: number; name: string; children?: any[]; files?: any[] }) =>
              processFolder(f, "INFRASTRUCTURE"),
            );
          }

          // Process Customers
          if (catalog.customers) {
            const collectCustomerIds = (folder: { id: number; name: string; children?: any[]; files?: any[] }, parentName?: string) => {
              customerFolderIds.add(folder.id);
              // Also process icons
              processFolder(folder, parentName);
              if (folder.children) {
                (folder.children || []).forEach((c: { id: number; name: string; children?: any[]; files?: any[] }) =>
                  collectCustomerIds(c, (folder as { name: string }).name),
                );
              }
            };
            (catalog.customers || []).forEach((f: { id: number; name: string; children?: any[]; files?: any[] }) =>
              collectCustomerIds(f, "CUSTOMER"),
            );
          }

          // Legacy/Array fallback
          if (Array.isArray(catalog)) {
            catalog.forEach((f: { id: number; name: string; children?: any[]; files?: any[] }) => processFolder(f));
          }

          console.log(
            `Allowed ${customerFolderIds.size} customer folders. Mapped ${Object.keys(iconMap).length} folder icons.`,
          );
          
          setAllowedFolderIds(customerFolderIds);
          setFolderIconMap(iconMap);
          isCatalogLoaded.current = true;
        } catch (e) {
          console.error("Failed to fetch catalog for restrictions", e);
        } finally {
          isCatalogFetching.current = false;
        }
      };
      // Only fetch catalog if not already loaded to prevent infinite loops
      fetchCatalog();
    }
  }, [user?.id]);

  useEffect(() => {
    let animationFrameId: number;

    if (map && !overlayRef.current) {
      // Wait for next frame to ensure map is fully mounted/ready
      animationFrameId = requestAnimationFrame(() => {
        if (!map) return;

        try {
          const overlay = new GoogleMapsOverlay({
            layers: [],
          });
          overlay.setMap(map);
          overlayRef.current = overlay;

          // Force update to render layers
          setTriggerUpdate((n) => n + 1);
        } catch (e) {
          console.error("Failed to initialize GoogleMapsOverlay", e);
        }
      });
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (overlayRef.current) {
        try {
          overlayRef.current.setMap(null);
          (overlayRef.current as { finalize: () => void }).finalize();
        } catch (e) {
          // ignore
        }
        overlayRef.current = null;
      }
    };
  }, [map]);

  // Update Layers
  useEffect(() => {
    if (!overlayRef.current || !map) return;

    // Allow empty folders if region is selected?
    // Actually if folders are selected, we show them.
    // If none selected, we show nothing (as per original logic).
    // Show if folders selected

    if (visibleFileIds.length === 0 || !iconAtlas || Object.keys(iconMapping).length === 0) {
      overlayRef.current.setProps({ layers: [] });
      // ROOT CAUSE FIX: Close orphaned InfoWindow when icons are removed from map
      if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
      return;
    }

    // 🚀 High Performance Style Cache
    // Prevents running complex object lookups 300,000+ times per frame
    const styleCache = new Map<string, { icon: string; color: number[] }>();

    const resolveFeatureStyle = (properties: Record<string, unknown>) => {
      if (!properties) return { icon: "DEFAULT", color: [200, 200, 200, 255] };
      
      const fid = properties.folder_id;
      const folderName = properties.folder_name;
      const iconType = properties.icon_type;
      const name = properties.name || properties.Name || "";
      const cacheKey = `${fid}_${folderName}_${iconType}_${name}`;

      let cached = styleCache.get(cacheKey);
      if (cached) return cached;

      let resolvedIconKey = "DEFAULT";
      let resolvedColor: number[] = getIconColor(iconType as string);

      // Resolve Icon Key — icon_type is already correctly resolved by backend COALESCE
      if (iconType) {
        const key = getIconKey(iconType as string, properties);
        if (key && iconMapping[key]) resolvedIconKey = key;
      }
      // Fallback: folderIconMap (pre-built from catalog)
      if (resolvedIconKey === "DEFAULT" && fid && folderIconMap[Number(fid)] && iconMapping[folderIconMap[Number(fid)]]) {
        resolvedIconKey = folderIconMap[Number(fid)];
      }
      // Fallback: folder name keyword matching
      if (resolvedIconKey === "DEFAULT" && folderName) {
        const folderKey = getFolderIconKey({ name: folderName as string });
        if (folderKey && iconMapping[folderKey]) {
          resolvedIconKey = folderKey;
        }
      }

      // Resolve Color
      if (ICON_DEFS[resolvedIconKey]?.imageUrl) {
         // PNG logos shouldn't be tinted
         resolvedColor = [255, 255, 255, 255];
      } else if (ICON_DEFS[resolvedIconKey]?.color) {
        resolvedColor = ICON_DEFS[resolvedIconKey].color as number[];
      }

      cached = { icon: resolvedIconKey, color: resolvedColor };
      styleCache.set(cacheKey, cached);
      return cached;
    };

    const layers: unknown[] = [];

    // STANDARD MODE: MVT Tiles
    layers.push(
      new MVTLayer({
        // ROOT CAUSE FIX: Do not include visibleFileIdsKey in the ID.
        // Changing the ID causes Deck.gl to completely destroy and re-create the layer, causing a blink.
        // A static ID allows Deck.gl to smoothly transition data changes in the background.
        id: `network-layer-${regionIdsKey || "global"}-${atlasVersion}`,
        data: tileUrl,
          minZoom: 0,
          maxZoom: 23,
          binary: true, // 🚀 HIGH PERFORMANCE: Keep data on GPU as typed arrays
          loaders: [MVTLoader],
          loadOptions: {
            fetch: {
              headers: { Authorization: `Bearer ${token}` },
            },
          },

          onTileError: (err) => console.warn("Tile Error", err),

          pointType: showLabels ? "circle+icon+text" : "circle+icon",
          
          // --- Circle Properties (for Planned Halo) ---
          stroked: true,
          filled: true,
          pointRadiusUnits: 'pixels',
          lineWidthUnits: 'pixels',
          
          // Force sublayers to strictly use pixels (fixes MVT oval/zoom issues)
          _subLayerProps: {
            points: {
              pointRadiusUnits: 'pixels',
              lineWidthUnits: 'pixels',
            }
          },

          getPointRadius: (d: unknown) => { const properties = (d as { properties?: { status?: string } }).properties;
            if (properties?.status === 'Planned') return 20; // Ring radius
            return 0; // No ring for others
          },
          getFillColor: [0, 0, 0, 0], // Transparent fill for ring
          // @ts-ignore - deck.gl strict types
          getLineColor: (d: unknown): number[] => { const properties = (d as { properties: Record<string, string> }).properties;
            if (properties?.status === 'Planned') return [245, 158, 11, 230]; // Amber ring for planned
            return resolveFeatureStyle(properties).color; // Use feature color for lines
          },
          getLineWidth: (d: unknown) => { const properties = (d as { properties?: { status?: string } }).properties;
            if (properties?.status === 'Planned') return 2.5; 
            return 3; // Ensure lines are visible!
          },
          // 🚀 Optimization: Use Shared Texture Atlas
          iconAtlas: iconAtlas as unknown as unknown, // Cast to any to avoid strict type mismatch if needed
          iconMapping: iconMapping,

          // getIcon now uses the high-performance cache
          getIcon: (d: unknown) => { const properties = (d as { properties: Record<string, string> }).properties;
            return resolveFeatureStyle(properties).icon;
          },

          getIconSize: (d: unknown) => {
            return 32;
          },
          // @ts-ignore - deck.gl Color type expects Uint8Array but number[] works at runtime
          getIconColor: (d: unknown): number[] => { const properties = (d as { properties: Record<string, string> }).properties;
            return resolveFeatureStyle(properties).color;
          },

          pickable: true,
          autoHighlight: true,
          highlightColor: [0, 0, 0, 0], // Transparent hover highlight removes dark blue circle fill
          pickingRadius: 20,
          uniqueIdProperty: "id",

          // Text Label Properties (active when showLabels is true)
          getText: (d: unknown) => { const properties = (d as { properties?: { Name?: string, name?: string } }).properties;
            return properties?.Name || properties?.name || "";
          },
          getTextSize: 13,
          getTextColor: [255, 255, 255, 255], // Pure White
          getTextAnchor: "middle",
          getTextAlignmentBaseline: "bottom",
          getTextPixelOffset: [0, -22],
          textFontFamily: "'Inter', 'Segoe UI', sans-serif",
          textFontWeight: 800,
          textSizeMinPixels: 10,
          textSizeMaxPixels: 16,
          
          // Outline properties (SDF must be enabled for outlines to work)
          // Increased buffer prevents the thick outline from being clipped by glyph boundaries
          textFontSettings: { sdf: true, buffer: 16, radius: 16 },
          textOutlineColor: [255, 0, 127, 255], // Solid Vibrant Pink for stronger glow
          textOutlineWidth: 8, // Significantly increased thickness
          onClick: (info, event) => {
            if (!info.object) return;

            // INDUSTRY STANDARD FIX: Stop event propagation to the underlying Google Map
            // This prevents active tools (like Distance measurement) from placing markings
            // when the user is specifically clicking on a network icon.
            if (event && event.srcEvent) {
              if (event.srcEvent.stopPropagation) event.srcEvent.stopPropagation();
              if (event.srcEvent.stopImmediatePropagation) event.srcEvent.stopImmediatePropagation();
              // For some versions of Google Maps Overlay, we also need to stop the DeckGL event itself
              if (event.stopPropagation) event.stopPropagation();
            }

            const featureProps = info.object.properties;

            // Helper to snap to feature center (Point Geometry)
            const getFeatureCenter = (i: unknown) => { const item = i as { object?: { geometry?: { type: string, coordinates: unknown }, properties?: { lat?: string|number, long?: string|number } }, coordinate?: [number, number] };
              if (item.object?.geometry) {
                const geom = item.object.geometry;
                if (geom.type === "Point" && Array.isArray(geom.coordinates)) {
                  return {
                    lng: geom.coordinates[0],
                    lat: geom.coordinates[1],
                  };
                }
              }
              if (item.object?.properties?.lat && item.object?.properties?.long) {
                return {
                  lat: Number(item.object.properties.lat),
                  lng: Number(item.object.properties.long),
                };
              }
              return item.coordinate
                ? { lat: item.coordinate[1], lng: item.coordinate[0] }
                : undefined;
            };

            // Helper functions reserved for potential future interactions
            const isCustomerFeature = (props: { folder_id?: string | number }) => {
              const fid = Number(props.folder_id);
              return allowedFolderIds.has(fid);
            };

            const isInfraFeature = (props: { folder_id?: string | number }) => {
              const fid = Number(props.folder_id);
              return !allowedFolderIds.has(fid);
            };

            // Normal Mode (or View Mode fallthrough): Show Popup
            if (info.coordinate) {
              if (onFeatureClick) {
                // Pass the exact pre-calculated icon key to the popup so it matches the map perfectly
                const resolvedStyle = resolveFeatureStyle(featureProps);
                const propertiesWithResolvedIcon = {
                  ...featureProps,
                  _resolved_icon: resolvedStyle.icon
                };

                // Let the external handler manage the UI (e.g. MapPage's React Popup)
                onFeatureClick(
                  propertiesWithResolvedIcon,
                  { lat: info.coordinate[1], lng: info.coordinate[0] },
                  event as unknown as Record<string, unknown>,
                );
              } else {
                // Fallback to internal raw HTML InfoWindow
                const googleMapsLocation = new google.maps.LatLng(
                  info.coordinate[1],
                  info.coordinate[0],
                );
                const featureStatus = featureProps.status || 'Active';
                const statusBadge = featureStatus === 'Planned'
                  ? '<span style="display:inline-block;background:#f59e0b;color:#fff;padding:1px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-left:6px">◌ Planned</span>'
                  : '<span style="display:inline-block;background:#16a34a;color:#fff;padding:1px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-left:6px">● Live</span>';
                const popupContent = `
                  <div style="font-family:'Inter','Segoe UI',sans-serif;min-width:180px">
                    <div style="display:flex;align-items:center;margin-bottom:4px">
                      <strong style="font-size:13px">${featureProps.Name || featureProps.name || "Unknown"}</strong>
                      ${statusBadge}
                    </div>
                    <div style="font-size:11px;color:#666">
                      Type: ${featureProps.icon_type || "Unknown"}<br/>
                      ID: ${featureProps.id}
                      ${featureProps.circuit_id ? '<br/>Circuit: ' + featureProps.circuit_id : ''}
                    </div>
                  </div>
                `;
                const infoWindow = activeInfoWindowRef.current;
                if (infoWindow && map) {
                  infoWindow.setContent(popupContent);
                  infoWindow.setPosition(googleMapsLocation);
                  infoWindow.open(map);
                }
              }

            }
          },

          // Client-side filtering (simplified - main filtering is server-side)
          getFilterValue: (f: unknown) => { const feat = f as { properties?: { status?: string } };
            // Global Filter: Planned Infrastructure
            if (showPlanned === false && feat.properties?.status === 'Planned') {
              return 0; // Filter out planned infrastructure
            }
            
            // Default: show all (server already filtered by fileIds)
            return 1;
          },
          filterRange: [1, 1],
          extensions: [new DataFilterExtension({ filterSize: 1 })],

          updateTriggers: {
            getIcon: [
              Object.keys(folderIconMap).length,
              JSON.stringify(folderIconMap),
              iconAtlas, // Force recalculation and invalidation of sublayer textures when canvas rebinds
            ],
            // Only update filter for planned toggles
            getFilterValue: [showPlanned],
            getLineColor: [showPlanned],
            getPointRadius: [showPlanned],
            getLineWidth: [showPlanned],
            getIconColor: [
              showPlanned,
              Object.keys(folderIconMap).length,
            ],
            getIconSize: [showPlanned],
            // ✅ Force onClick to re-capture with new allowedFolderIds
            onClick: [
              allowedFolderIds.size,
              Array.from(allowedFolderIds).join(","),
            ],
            pointType: showLabels,
          },
        }),
      );

    overlayRef.current.setProps({ layers: layers as unknown as import("@deck.gl/core").Layer[] });
  }, [
    map,
    visibleFileIds, // React will use reference equality - pass entire array
    token,
    tileUrl,
    triggerUpdate,
    regionIdsKey,
    onFeatureClick,
    dispatch,
    allowedFolderIds,
    iconAtlas,
    iconMapping,
    folderIconMap,
    showLabels,
    showPlanned,
  ]);

  return null;
};

export default NetworkLayerOverlay;
