import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as turf from '@turf/turf';
import { useRegionEditor } from "./hooks/useRegionEditor";
import { useRegionData } from "./hooks/useRegionData";
import { useRegionMap } from "./hooks/useRegionMap";
import { useRegionActions } from "./hooks/useRegionActions";
import { useRegionImportExport } from "./hooks/useRegionImportExport";
import { useInfraLayer, InfraPoint } from "./hooks/useInfraLayer";
import { EditorStatus } from "./components/EditorStatus";
import { PolygonManagerPanel } from "./components/PolygonManagerPanel";
import { SaveBoundaryDialog } from "./components/SaveBoundaryDialog";
import { QuickPublishDialog } from "./components/QuickPublishDialog";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { ResetBoundaryDialog } from "./components/ResetBoundaryDialog";
import { ImportGeoJSONDialog } from "./components/ImportGeoJSONDialog";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
  ImpactAnalysis,
  publishDraftBoundary,
  getAllPublishedBoundaries,
} from "../../../services/region/index";
import { geojsonToGooglePaths, googlePathsToGeoJSON } from "./utils/index";
import MapToolbar from "../../map/components/MapToolbar/index";
import RegionEditorToolbarTools from "./components/RegionEditorToolbarTools";
import { showToast } from "../../../utils/toastUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { darkMapStyle } from "../../map/utils/mapStyles";

const POLYGON_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#10B981", // Green
];

interface RegionBoundaryEditorProps {
  regionId: number;
  onClose?: () => void;
}

const RegionBoundaryEditor: React.FC<RegionBoundaryEditorProps> = ({
  regionId,
  onClose,
}) => {
  const editor = useRegionEditor();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Multi-Region Co-Editing State
  const [activeRegionId, setActiveRegionId] = useState<number>(regionId);
  const [draftStash, setDraftStash] = useState<Record<number, google.maps.LatLng[][][]>>({});

  useEffect(() => {
    setActiveRegionId(regionId);
  }, [regionId]);

  // Local state for actions/UI not covered by useRegionEditor
  const [changeReason, setChangeReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(
    null,
  );
  const [analyzingImpact, setAnalyzingImpact] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showInfra, setShowInfra] = useState(false);
  const [deletedPaths, setDeletedPaths] = useState<google.maps.LatLng[][][]>(
    [],
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCandidateIndex, setDeleteCandidateIndex] = useState<
    number | null
  >(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Crosshair Mode State
  const [activeMode, setActiveMode] = useState<'select' | 'add_point' | 'boolean'>('select');
  const activeModeRef = useRef(activeMode);
  
  // Advanced Tool States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [booleanPrompt, setBooleanPrompt] = useState<{ isOpen: boolean, regionName: string, refPoly: google.maps.Polygon | null }>({ isOpen: false, regionName: "", refPoly: null });
  const overlapPolygonRefs = useRef<google.maps.Polygon[]>([]);
  const gapPolygonRefs = useRef<google.maps.Polygon[]>([]);
  
  // Real-time tick to force React to update the live vertex count without relying on un-mutated boolean "hasChanges"
  const [vertexTick, setVertexTick] = useState(0);
  
  // Debounce timer ref for history saves during vertex dragging
  const historySaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoSnapping, setIsAutoSnapping] = useState(false);

  // Ref to hold the boolean operation function so useEffect can use it without dependencies
  const handleBooleanOperationRef = useRef<any>(null);

  // Helper: snapshot the current live polygon state from Google Maps instances
  const snapshotCurrentPaths = useCallback((): google.maps.LatLng[][][] => {
    return polygonRefs.current.map(poly => {
      const result: google.maps.LatLng[][] = [];
      const paths = poly.getPaths();
      for (let i = 0; i < paths.getLength(); i++) {
        const ring = paths.getAt(i);
        const coords: google.maps.LatLng[] = [];
        for (let j = 0; j < ring.getLength(); j++) {
          coords.push(ring.getAt(j));
        }
        result.push(coords);
      }
      return result;
    });
  }, []);
  
  // Toggle Original Boundary
  const handleToggleShowOriginal = () => {
    setShowOriginal((prev) => !prev);
  };

  const [contextSwitchTarget, setContextSwitchTarget] = useState<{id: number, name: string} | null>(null);

  // Stable ref so that reference polygon click handlers always call the latest logic
  // without needing to re-create the handlers (which would re-trigger the reference useEffect)
  const activeRegionIdRef = useRef(activeRegionId);
  useEffect(() => { activeRegionIdRef.current = activeRegionId; }, [activeRegionId]);

  const handleSwitchContext = useCallback((clickedRegionId: number, clickedRegionName: string) => {
    if (activeRegionIdRef.current === clickedRegionId) return;
    setContextSwitchTarget({ id: clickedRegionId, name: clickedRegionName });
  }, []); // stable — never recreated

  // 2. Load Region Data
  const {
    region,
    boundaryData,
    error: loadError,
    loading: dataLoading,
    mapCenter,
    mapZoom,
  } = useRegionData(activeRegionId);

  // Infra Layer Data
  const {
    points: infraPoints,
    loading: infraLoading,
    setPoints: setInfraPoints,
  } = useInfraLayer(activeRegionId, showInfra);

  // 3. Initialize Map Logic
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { mapRef, polygonRefs, drawingManagerRef, clearMap, fitBounds } =
    useRegionMap();

  // Crosshair Mode Cursor Sync
  useEffect(() => {
    activeModeRef.current = activeMode;
    if (mapRef.current) {
      mapRef.current.setOptions({
        draggableCursor: activeMode === 'add_point' ? 'crosshair' : null
      });
    }
  }, [activeMode, mapRef.current]);

  // Reference Boundaries State
  const [showReferences, setShowReferences] = useState(false);
  const referencePolygonRefs = useRef<google.maps.Polygon[]>([]);

  // Track which regionId we last fitted bounds for, to prevent re-zoom on undo/redo
  const lastFittedRegionRef = useRef<number | null>(null);

  // Save initial polygon state to history when entering edit mode
  useEffect(() => {
    if (editor.editMode && polygonRefs.current.length > 0) {
      // Small delay to ensure polygons are rendered with editable handles
      const timer = setTimeout(() => {
        const initialPaths = snapshotCurrentPaths();
        if (initialPaths.length > 0) {
          editor.history.clearHistory();
          editor.history.saveToHistory(initialPaths);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [editor.editMode]);

  // Reference Boundaries Fetch and Render
  useEffect(() => {
    if (!mapRef.current) return;

    if (!showReferences) {
      referencePolygonRefs.current.forEach(p => p.setMap(null));
      referencePolygonRefs.current = [];
      return;
    }

    // Stale-check flag: prevents old async fetches from wiping out newer results
    let cancelled = false;

    const loadReferences = async () => {
      try {
        const res = await getAllPublishedBoundaries();
        
        // If this effect was cleaned up while we were fetching, abort
        if (cancelled) return;

        if (res.success && res.boundaries) {
          // Clear any previously rendered references
          referencePolygonRefs.current.forEach(p => p.setMap(null));
          referencePolygonRefs.current = [];
          
          // Calculate active region bounding box for spatial filtering
          const activeBounds = new google.maps.LatLngBounds();
          polygonRefs.current.forEach(poly => {
            const paths = poly.getPaths();
            for (let i = 0; i < paths.getLength(); i++) {
              const ring = paths.getAt(i);
              for (let j = 0; j < ring.getLength(); j++) {
                activeBounds.extend(ring.getAt(j));
              }
            }
          });

          // Pad bounds by ~0.5 degrees (approx 50km) to include adjacent/nearby states
          let activeBoundsExpanded: google.maps.LatLngBounds | null = null;
          if (!activeBounds.isEmpty()) {
            const ne = activeBounds.getNorthEast();
            const sw = activeBounds.getSouthWest();
            activeBoundsExpanded = new google.maps.LatLngBounds(
              new google.maps.LatLng(sw.lat() - 0.5, sw.lng() - 0.5),
              new google.maps.LatLng(ne.lat() + 0.5, ne.lng() + 0.5)
            );
          }
          
          console.log(`Loaded ${res.boundaries.length} published boundaries`);
          
          res.boundaries.forEach(b => {
             // Exclude current region safely mapping both to Numbers
             if (Number(b.regionId) === Number(activeRegionId)) {
               console.log(`Skipping active region: ${b.regionId}`);
               return;
             }
             if (!b.boundaryGeoJSON) {
               console.log(`Region ${b.regionId} has no GeoJSON`);
               return;
             }
             
             try {
               const refPaths = geojsonToGooglePaths(b.boundaryGeoJSON);

               // Spatial Filter: Nearest Reference Filter (only show if intersects expanded bounds)
               if (activeBoundsExpanded) {
                 const refBounds = new google.maps.LatLngBounds();
                 refPaths.forEach(polygonPath => {
                   polygonPath.forEach(ring => {
                     ring.forEach((pt: any) => {
                       const lat = typeof pt.lat === 'function' ? pt.lat() : pt.lat;
                       const lng = typeof pt.lng === 'function' ? pt.lng() : pt.lng;
                       refBounds.extend(new google.maps.LatLng(lat, lng));
                     });
                   });
                 });
                 if (!activeBoundsExpanded.intersects(refBounds)) {
                   // Too far away, skip rendering this reference
                   return;
                 }
               }

               refPaths.forEach(path => {
                  const polygon = new google.maps.Polygon({
                    paths: path,
                    strokeColor: isDarkMode ? "#9CA3AF" : "#6B7280",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: isDarkMode ? "#374151" : "#E5E7EB",
                    fillOpacity: 0.1,
                    editable: false,
                    clickable: true,
                    map: mapRef.current,
                    zIndex: -1
                  });
                  
                  google.maps.event.addListener(polygon, 'click', () => {
                     if (activeModeRef.current === 'boolean') {
                       setBooleanPrompt({ isOpen: true, regionName: b.regionName, refPoly: polygon });
                     } else {
                       handleSwitchContext(b.regionId, b.regionName);
                     }
                  });

                  referencePolygonRefs.current.push(polygon);
               });
             } catch(e) {
               console.warn("Failed to render reference boundary for region", b.regionId, e);
             }
          });

          // Also render stashed (unsaved/draft) boundaries as reference overlays
          // so regions that have no published boundary still appear after context switch
          Object.entries(draftStash).forEach(([stashedIdStr, stashedPaths]) => {
            const stashedId = Number(stashedIdStr);
            if (stashedId === Number(activeRegionId)) return; // skip active region
            // Skip if this region already has a published boundary rendered above
            const alreadyRendered = res.boundaries.some(
              (b) => Number(b.regionId) === stashedId
            );
            if (alreadyRendered) return;

            stashedPaths.forEach(path => {
              const polygon = new google.maps.Polygon({
                paths: path,
                strokeColor: "#06B6D4", // Cyan to distinguish stashed drafts
                strokeOpacity: 0.7,
                strokeWeight: 2,
                fillColor: "#06B6D4",
                fillOpacity: 0.05,
                editable: false,
                clickable: true,
                map: mapRef.current,
                zIndex: -1
              });

              google.maps.event.addListener(polygon, 'click', () => {
                handleSwitchContext(stashedId, `Stashed Region #${stashedId}`);
              });

              referencePolygonRefs.current.push(polygon);
            });
          });
        }
      } catch(err) {
        console.error("Failed to load reference boundaries", err);
      }
    };
    
    loadReferences();

    return () => {
       cancelled = true; // Mark stale so the async fetch above aborts
       referencePolygonRefs.current.forEach(p => p.setMap(null));
       referencePolygonRefs.current = [];
       overlapPolygonRefs.current.forEach(p => p.setMap(null));
       overlapPolygonRefs.current = [];
       gapPolygonRefs.current.forEach(p => p.setMap(null));
       gapPolygonRefs.current = [];
    };
  }, [showReferences, activeRegionId, isDarkMode, mapRef.current, boundaryData]);

  // Keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor.editMode) return;

      // Undo: Ctrl+Z (not Shift)
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const paths = editor.history.undo();
        if (paths) {
          editor.setEditablePaths(paths);
          setVertexTick(t => t + 1);
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        const paths = editor.history.redo();
        if (paths) {
          editor.setEditablePaths(paths);
          setVertexTick(t => t + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor.editMode]);

  // Initialize Map Instance
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeId: isDarkMode ? "roadmap" : "roadmap",
        styles: isDarkMode ? darkMapStyle : [],
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        backgroundColor: "#1a1a1a",
      });
      mapRef.current = map;
      console.log("RegionBoundaryEditor: Map initialized");
    }

    return () => {
      // Map cleanup on unmount
      if (mapRef.current) {
        clearMap();
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  }, [mapCenter, mapZoom, clearMap]);

  // Dynamic Map Style Updater for Dark Mode
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({
        styles: isDarkMode ? darkMapStyle : [],
        colorScheme: isDarkMode ? 'DARK' : 'LIGHT'
      });
    }
  }, [isDarkMode, mapRef.current]);

  // Mock Data Injection for Demo (Remove in Prod)
  useEffect(() => {
    if (showInfra && infraPoints.length <= 2 && mapRef.current) {
      // Generate random points around center
      const center = mapRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        const newPoints: InfraPoint[] = [];
        for (let i = 0; i < 20; i++) {
          newPoints.push({
            id: 10 + i,
            lat: lat + (Math.random() - 0.5) * 0.5,
            lng: lng + (Math.random() - 0.5) * 0.5,
            type: Math.random() > 0.5 ? "customer" : "pop",
            status: "live",
            name: `Asset ${i}`,
          });
        }
        setInfraPoints((prev) => [...prev, ...newPoints]);
      }
    }
  }, [showInfra, mapRef.current]);

  // Render Infra Points
  const infraMarkersRef = useRef<google.maps.Circle[]>([]);
  useEffect(() => {
    // Clear existing
    infraMarkersRef.current.forEach((m) => m.setMap(null));
    infraMarkersRef.current = [];

    if (!showInfra || !mapRef.current) return;

    infraPoints.forEach((point) => {
      // Check if inside any polygon
      const pointLatLng = new google.maps.LatLng(point.lat, point.lng);
      let isInside = false;

      if (editor.editablePaths.length > 0) {
        // We need to construct polygons to check 'containsLocation' if paths changed
        // But 'google.maps.geometry.poly.containsLocation' works on a Polygon object.
        // We can use polygonRefs if they are synced.
        isInside = polygonRefs.current.some((poly) =>
          google.maps.geometry.poly.containsLocation(pointLatLng, poly),
        );
      } else if (boundaryData?.geojson) {
        // Fallback check
      }

      const marker = new google.maps.Circle({
        strokeColor: isInside ? "#22c55e" : "#ef4444",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: isInside ? "#22c55e" : "#ef4444",
        fillOpacity: 0.6,
        map: mapRef.current,
        center: pointLatLng,
        radius: 500, // meters
        zIndex: 100,
      });

      infraMarkersRef.current.push(marker);
    });
  }, [showInfra, infraPoints, editor.editablePaths, mapRef.current]);

  // Memoize Google Paths to avoid recalculating on every render
  const googlePaths = useMemo(() => {
    if (!boundaryData?.geojson) return [];
    return geojsonToGooglePaths(boundaryData.geojson as any);
  }, [boundaryData]);

  // Render Boundary Data or Auto-Zoom
  useEffect(() => {
    if (!mapRef.current || !boundaryData) return;

    // ROBUST GUARD: Do NOT render if boundaryData belongs to a different region.
    // This prevents the race condition where activeRegionId has changed but
    // useRegionData hasn't finished fetching the new region's data yet.
    if (Number(boundaryData.regionId) !== Number(activeRegionId)) return;

    // Clear existing polygons
    clearMap();

    // Use requestAnimationFrame to avoid blocking main thread during rendering
    const renderFrame = requestAnimationFrame(() => {
      const pathsToRender = editor.editablePaths.length > 0 ? editor.editablePaths : googlePaths;
      
      // Create polygons
      pathsToRender.forEach((path, index) => {
        const color = POLYGON_COLORS[index % POLYGON_COLORS.length];
        const polygon = new google.maps.Polygon({
          paths: path,
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 2.5,
          fillColor: color,
          fillOpacity: 0.25,
          editable: editor.editMode,
          draggable: false, // Usually vertices are draggable, not the whole polygon
          map: mapRef.current,
        });

        // Add listeners for editing
        if (editor.editMode) {
          // Allow deleting vertices on right click
          google.maps.event.addListener(polygon, "rightclick", (e: any) => {
            if (e.vertex !== undefined) {
              const pathIdx = e.path !== undefined ? e.path : 0;
              const paths = polygon.getPaths();
              const path = paths.getAt(pathIdx);
              
              if (path) {
                if (path.getLength() > 3) {
                  path.removeAt(e.vertex);
                } else {
                  // Deleting a vertex from a triangle destroys the polygon ring
                  paths.removeAt(pathIdx);
                  
                  // If no paths left, remove the polygon completely
                  if (paths.getLength() === 0) {
                      polygon.setMap(null);
                      polygonRefs.current = polygonRefs.current.filter(p => p !== polygon);
                  }
                  
                  // Sync changes to state and history
                  editor.setHasChanges(true);
                  const currentPaths = snapshotCurrentPaths();
                  editor.history.saveToHistory(currentPaths);
                  editor.setEditablePaths(currentPaths); // Force re-render to reflect destroyed polygons
                }
              }
            }
          });

          // Add vertex on edge click if in add_point mode
          google.maps.event.addListener(polygon, "click", (e: any) => {
            if (activeModeRef.current === 'add_point' && e.latLng) {
              const paths = polygon.getPaths();
              let pIndex = e.path !== undefined ? e.path : -1;
              let eIndex = e.edge !== undefined ? e.edge : -1;

              // Fallback geometry math if they clicked the fill instead of the exact 1px edge
              if (eIndex === -1) {
                let minDistance = Infinity;
                const pLat = e.latLng.lat();
                const pLng = e.latLng.lng();

                // Iterate all paths to find closest geometric segment to cursor
                for (let pIdx = 0; pIdx < paths.getLength(); pIdx++) {
                  const path = paths.getAt(pIdx);
                  const len = path.getLength();
                  for (let i = 0; i < len; i++) {
                    const p1 = path.getAt(i);
                    const p2 = path.getAt((i + 1) % len);
                    
                    const x0 = pLng, y0 = pLat;
                    const x1 = p1.lng(), y1 = p1.lat();
                    const x2 = p2.lng(), y2 = p2.lat();
                    
                    const C = x2 - x1;
                    const D = y2 - y1;
                    const dot = (x0 - x1) * C + (y0 - y1) * D;
                    const lenSq = C * C + D * D;
                    let param = -1;
                    if (lenSq !== 0) param = dot / lenSq;
                    
                    let xx, yy;
                    if (param < 0) { xx = x1; yy = y1; }
                    else if (param > 1) { xx = x2; yy = y2; }
                    else { xx = x1 + param * C; yy = y1 + param * D; }
                    
                    const dx = x0 - xx;
                    const dy = y0 - yy;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < minDistance) {
                        minDistance = distSq;
                        pIndex = pIdx;
                        eIndex = i;
                    }
                  }
                }
              }

              // Insert point
              if (pIndex !== -1 && eIndex !== -1) {
                const clickedPath = paths.getAt(pIndex);
                if (clickedPath) {
                  clickedPath.insertAt(eIndex + 1, e.latLng);
                  // Manually sync changes so the application knows we successfully broke polygon boundaries natively
                  editor.setHasChanges(true); 
                  setVertexTick(t => t + 1);
                }
              }
            }
          });

          // Bind vertex edit tracking to EVERY path ring (exterior and holes) within the polygon
          const polyPaths = polygon.getPaths();
          let isSnapping = false; // Mutex to prevent recursive set_at triggers
          let snapTimer: any = null; // Debounce for Turf edge snapping

          for (let pIdx = 0; pIdx < polyPaths.getLength(); pIdx++) {
            const ringPath = polyPaths.getAt(pIdx);
            ["set_at", "insert_at", "remove_at"].forEach((evt) => {
              google.maps.event.addListener(ringPath, evt, (vertexIndex: number) => {
                editor.setHasChanges(true);
                
                // --- MAGNETIC EDGE SNAPPING ---
                if ((evt === "set_at" || evt === "insert_at") && vertexIndex !== undefined && !isSnapping) {
                   if (snapTimer) clearTimeout(snapTimer);
                   
                   if (showReferences && referencePolygonRefs.current.length > 0) {
                       snapTimer = setTimeout(() => {
                           try {
                               const vertex = ringPath.getAt(vertexIndex);
                               if (!vertex) return;
                               
                               let minDistance = Infinity;
                               let nearestPt: google.maps.LatLng | null = null;
                               const turfPt = turf.point([vertex.lng(), vertex.lat()]);
                               
                               referencePolygonRefs.current.forEach(refPoly => {
                                   if (!refPoly.getMap()) return;
                                   const refPaths = refPoly.getPaths();
                                   const refRings: google.maps.LatLng[][] = [];
                                   for (let i = 0; i < refPaths.getLength(); i++) {
                                       const refRing = refPaths.getAt(i);
                                       const pts: google.maps.LatLng[] = [];
                                       for (let j = 0; j < refRing.getLength(); j++) {
                                           pts.push(refRing.getAt(j));
                                       }
                                       refRings.push(pts);
                                   }
                                   if (refRings.length === 0) return;
                                   
                                   const refGeojson = googlePathsToGeoJSON([refRings]);
                                   const refFeature = { type: 'Feature', properties: {}, geometry: refGeojson };
                                   const refLines = turf.polygonToLine(refFeature as any);
                                   
                                   const nearest = turf.nearestPointOnLine(refLines as any, turfPt);
                                   if (nearest && nearest.properties && nearest.properties.dist < minDistance) {
                                       minDistance = nearest.properties.dist;
                                       nearestPt = new google.maps.LatLng(nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]);
                                   }
                               });
        
                               // Snap if within ~2km (2 in Turf distance which is km)
                               if (nearestPt && minDistance < 2) {
                                   isSnapping = true;
                                   ringPath.setAt(vertexIndex, nearestPt);
                                   isSnapping = false;
                                   
                                   if (historySaveTimerRef.current) clearTimeout(historySaveTimerRef.current);
                                   const currentPaths = snapshotCurrentPaths();
                                   editor.history.saveToHistory(currentPaths);
                               }
                           } catch(e) {
                               console.warn("Magnetic snap failed silently:", e);
                           }
                       }, 150); // 150ms debounce so it snaps just after user stops dragging
                   }
                }
                // ------------------------------
                
                // Force vertex count UI re-render only when vertices are dynamically added/removed
                if (evt === "insert_at" || evt === "remove_at") {
                  setVertexTick(t => t + 1);
                  // Save history immediately for structural changes
                  const currentPaths = snapshotCurrentPaths();
                  editor.history.saveToHistory(currentPaths);
                }

                // Debounced history save for drag operations (set_at fires on every pixel)
                if (evt === "set_at") {
                  if (historySaveTimerRef.current) clearTimeout(historySaveTimerRef.current);
                  historySaveTimerRef.current = setTimeout(() => {
                    const currentPaths = snapshotCurrentPaths();
                    editor.history.saveToHistory(currentPaths);
                  }, 500);
                }

                // Debounce/Throttle infra checks to avoid performance hit on drag
                if (infraMarkersRef.current.length > 0) {
                  if (!showInfra) return;
                  infraMarkersRef.current.forEach((marker, idx) => {
                    const pt = infraPoints[idx];
                    if (pt) {
                      const latLng = new google.maps.LatLng(pt.lat, pt.lng);
                      const inside = polygonRefs.current.some((poly) =>
                        google.maps.geometry.poly.containsLocation(latLng, poly),
                      );
                      marker.setOptions({
                        strokeColor: inside ? "#22c55e" : "#ef4444",
                        fillColor: inside ? "#22c55e" : "#ef4444",
                      });
                    }
                  });
                }
              });
            });
          }
        }

        // Add to refs
        polygonRefs.current.push(polygon);
      });

      // Initialize editor state with paths if starting fresh
      if (editor.editablePaths.length === 0) {
        const stash = draftStash[activeRegionId];
        if (stash && stash.length > 0) {
           editor.setEditablePaths(stash);
           editor.setEditMode(true);
           editor.setHasChanges(true);
        } else if (googlePaths.length > 0) {
           editor.setEditablePaths(googlePaths);
        }
      }

      // Auto-Zoom to Polygon ONLY on initial load or region switch (not on undo/redo)
      if (pathsToRender.length > 0 && lastFittedRegionRef.current !== activeRegionId) {
        fitBounds(pathsToRender);
        lastFittedRegionRef.current = activeRegionId;
      }
    });

    return () => {
      cancelAnimationFrame(renderFrame);
    };
  }, [
    googlePaths, // Use memoized paths
    editor.editablePaths, // React to imported/reset paths
    mapRef.current,
    clearMap,
    editor.editMode,
    fitBounds,
    draftStash,
    activeRegionId
    // NOTE: infraPoints and showInfra intentionally removed — they have their own useEffect for rendering infra markers.
    // Including them here would re-run this effect on infra state changes, calling clearMap() and destroying polygon click listeners.
  ]);

  // Render Original Boundary (Ghost)
  const ghostPolygonRefs = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing ghost polygons
    ghostPolygonRefs.current.forEach((p) => p.setMap(null));
    ghostPolygonRefs.current = [];

    const fetchAndRenderOriginal = async () => {
      if (!showOriginal || !region?.name) return;

      try {
        // Try fetching from india.json
        const response = await fetch("/india.json");
        const indiaData = await response.json();
        const normalize = (str: string) =>
          str
            ?.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, "") || "";
        const targetName = normalize(region.name);

        let regionBoundary = indiaData.features?.find((f: any) => {
          const pName = normalize(f.properties?.name);
          const pStNm = normalize(f.properties?.st_nm);
          return pName === targetName || pStNm === targetName;
        });

        // Special Case: Handle merged "Dadra and Nagar Haveli and Daman and Diu"
        if (
          !regionBoundary &&
          targetName.includes("dadra") &&
          targetName.includes("daman")
        ) {
          const dnh = indiaData.features?.find(
            (f: any) =>
              normalize(f.properties?.st_nm) === "dadraandnagarhaveli",
          );
          const dd = indiaData.features?.find(
            (f: any) => normalize(f.properties?.st_nm) === "damananddiu",
          );

          if (dnh && dd) {
            // Merge into a MultiPolygon
            const dnhCoords =
              dnh.geometry.type === "Polygon"
                ? [dnh.geometry.coordinates]
                : dnh.geometry.coordinates;
            const ddCoords =
              dd.geometry.type === "Polygon"
                ? [dd.geometry.coordinates]
                : dd.geometry.coordinates;

            // Diu Island (Approximate Polygon for fallback)
            const DIU_COORDINATES = [
              [70.9, 20.71],
              [70.99, 20.71],
              [71.02, 20.713],
              [71.02, 20.73],
              [70.99, 20.73],
              [70.9, 20.73],
              [70.9, 20.71],
            ];

            regionBoundary = {
              type: "Feature",
              properties: { st_nm: region.name },
              geometry: {
                type: "MultiPolygon",
                coordinates: [...dnhCoords, ...ddCoords, [DIU_COORDINATES]],
              },
            };
          }
        }

        if (regionBoundary?.geometry) {
          const googlePaths = geojsonToGooglePaths(regionBoundary.geometry);
          googlePaths.forEach((path: any) => {
            const ghost = new google.maps.Polygon({
              paths: path,
              strokeColor: "#06B6D4", // Cyan for original
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#06B6D4",
              fillOpacity: 0.1,
              clickable: false,
              editable: false,
              zIndex: 0, // Behind editable polygon
              map: mapRef.current,
            });
            ghostPolygonRefs.current.push(ghost);
          });
        } else {
          console.warn(
            "Could not find original boundary in india.json for ghost overlay",
          );
          // Optional: Fallback to current boundaryData if we want to show *something*
          // but user specifically asked for india.json data.
        }
      } catch (e) {
        console.error("Failed to load ghost boundary:", e);
      }
    };

    fetchAndRenderOriginal();

    // Cleanup on unmount or disable
    return () => {
      ghostPolygonRefs.current.forEach((p) => p.setMap(null));
      ghostPolygonRefs.current = [];
    };
  }, [showOriginal, region, mapRef.current]);

  // 4. Initialize Actions
  const actions = useRegionActions({
    regionId: activeRegionId,
    editMode: editor.editMode,
    hasChanges: editor.hasChanges,
    saving: editor.saving,
    changeReason,
    polygonRefs,
    editablePaths: editor.editablePaths,
    setSaving: editor.setSaving,
    setError: setActionError,
    setSuccess: setActionSuccess,
    setHasChanges: editor.setHasChanges,
    setEditMode: editor.setEditMode,
    setEditablePaths: editor.setEditablePaths,
    setHistory: editor.history.setHistory,
    setHistoryIndex: editor.history.setHistoryIndex,
    setChangeReason,
    setShowSaveDialog: editor.setShowSaveDialog,
    setShowQuickPublishDialog: editor.setShowQuickPublishDialog,
    setImpactAnalysis,
    setAnalyzingImpact,
    onClose,
  });

  // 5. Initialize Import/Export
  const importExport = useRegionImportExport(
    region,
    boundaryData,
    activeRegionId,
    editor.setEditablePaths,
    editor.setEditMode,
    editor.setHasChanges,
    editor.history.saveToHistory,
    setActionSuccess,
    setActionError,
    () => {
      // Export currently visible paths if in edit mode and paths exist
      if (editor.editMode && polygonRefs.current && polygonRefs.current.length > 0) {
        const currentPaths = snapshotCurrentPaths();
        if (currentPaths.length > 0) {
          return googlePathsToGeoJSON(currentPaths);
        }
      }
      return boundaryData?.geojson;
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate live vertex count dynamically to accurately reflect native map drag/insert/delete actions in real time
  const liveVertexCount = useMemo(() => {
    // If in edit mode, read real-time state directly from Google Maps instances
    if (editor.editMode && polygonRefs.current.length > 0) {
      let count = 0;
      polygonRefs.current.forEach(poly => {
        const paths = poly.getPaths();
        if (paths) {
          for (let i = 0; i < paths.getLength(); i++) {
            const pathArray = paths.getAt(i);
            if (pathArray) count += pathArray.getLength();
          }
        }
      });
      return count;
    }

    // Fallback to React state or server boundary data
    if (editor.editablePaths.length > 0) {
      return editor.editablePaths.reduce(
        (acc, path) => acc + path.reduce((pAcc, ring) => pAcc + ring.length, 0),
        0
      );
    }
    return boundaryData?.vertexCount || 0;
  }, [
    editor.editablePaths, 
    boundaryData, 
    editor.editMode, 
    editor.hasChanges, // Triggers re-render instantly on any native vertex interaction
    vertexTick         // Forces explicit React DOM bypass evaluating purely the Native Maps Arrays
  ]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            Failed to Load Region
          </h3>
          <p className="text-gray-500 mb-4">{loadError}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close Editor
          </button>
        </div>
      </div>
    );
  }

  const handleAutoSnap = () => {
    if (!polygonRefs.current.length) {
      setActionError("No active boundary to snap.");
      return;
    }
    if (!referencePolygonRefs.current.length || !showReferences) {
      setActionError("Please turn on 'Refs' to snap to reference boundaries.");
      return;
    }

    setIsAutoSnapping(true);
    document.body.style.cursor = 'wait'; // Show loading cursor on the entire map/page
    
    // Give browser time to paint loading state before blocking thread
    setTimeout(() => {
      let snappedCount = 0;
      const newEditablePaths: google.maps.LatLng[][][] = [];

      // For each path in our editable polygon
      polygonRefs.current.forEach(polygon => {
        const paths = polygon.getPaths();
        const polygonPaths: google.maps.LatLng[][] = [];

      for (let p = 0; p < paths.getLength(); p++) {
        const ring = paths.getAt(p);
        const ringPaths: google.maps.LatLng[] = [];

        // Helper to find nearest reference point
        const getNearestRef = (pt: google.maps.LatLng) => {
          let minD = Infinity;
          let nearestPt: any = null;
          referencePolygonRefs.current.forEach(refPoly => {
            if (!refPoly.getMap()) return;
            const refPaths = refPoly.getPaths();
            for (let i = 0; i < refPaths.getLength(); i++) {
              const refRing = refPaths.getAt(i);
              for (let j = 0; j < refRing.getLength(); j++) {
                const refVertex = refRing.getAt(j);
                const d = google.maps.geometry.spherical.computeDistanceBetween(pt, refVertex);
                if (d < minD) { minD = d; nearestPt = refVertex; }
              }
            }
          });
          return { minD, nearestPt };
        };

        // Pre-calculate reference bounding boxes per-ring with ~15km padding (0.15 degrees)
        const refBoundingBoxes: google.maps.LatLngBounds[] = [];
        referencePolygonRefs.current.forEach(refPoly => {
          if (!refPoly.getMap()) return;
          const refPaths = refPoly.getPaths();
          for (let i = 0; i < refPaths.getLength(); i++) {
            const bounds = new google.maps.LatLngBounds();
            const refRing = refPaths.getAt(i);
            for (let j = 0; j < refRing.getLength(); j++) {
               bounds.extend(refRing.getAt(j));
            }
            if (!bounds.isEmpty()) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              refBoundingBoxes.push(new google.maps.LatLngBounds(
                new google.maps.LatLng(sw.lat() - 0.15, sw.lng() - 0.15),
                new google.maps.LatLng(ne.lat() + 0.15, ne.lng() + 0.15)
              ));
            }
          }
        });

        const snappedRing: google.maps.LatLng[] = [];
        
        // Process each segment of the ring
        for (let v = 0; v < ring.getLength(); v++) {
          const p1 = ring.getAt(v);
          const p2 = ring.getAt((v + 1) % ring.getLength());
          
          // 1. Process original point p1 (always keep it)
          const { minD: minD1, nearestPt: near1 } = getNearestRef(p1);
          if (near1 && minD1 < 15000 && minD1 > 0.01) {
            snappedRing.push(new google.maps.LatLng(near1.lat(), near1.lng()));
            snappedCount++;
          } else {
            snappedRing.push(new google.maps.LatLng(p1.lat(), p1.lng()));
          }

          // 2. Dynamically densify the segment if it's near a reference boundary
          const segmentLen = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
          const isNearRef = refBoundingBoxes.some(b => b.contains(p1) || b.contains(p2));

          if (segmentLen > 100 && isNearRef) {
            const steps = Math.min(Math.ceil(segmentLen / 100), 300); // 100m resolution, safety cap at 30km
            for (let s = 1; s < steps; s++) {
              const injectedPt = google.maps.geometry.spherical.interpolate(p1, p2, s / steps);
              
              // CRITICAL: Only keep injected points if they ACTUALLY snap to a reference!
              // This completely prevents bloating straight lines with unnecessary points.
              const { minD: minDInj, nearestPt: nearInj } = getNearestRef(injectedPt);
              if (nearInj && minDInj < 15000 && minDInj > 0.01) {
                snappedRing.push(new google.maps.LatLng(nearInj.lat(), nearInj.lng()));
                snappedCount++;
              }
            }
          }
        }
        
        // Step 3: Deduplicate consecutive identical points to prevent map lag (e.g., 50 points snapping to the same vertex)
        const finalRingPaths: google.maps.LatLng[] = [];
        for (let i = 0; i < snappedRing.length; i++) {
          const pt = snappedRing[i];
          if (finalRingPaths.length === 0) {
            finalRingPaths.push(pt);
          } else {
            const lastPt = finalRingPaths[finalRingPaths.length - 1];
            const dist = google.maps.geometry.spherical.computeDistanceBetween(lastPt, pt);
            // If distance > 1 meter, it's a distinct point. Otherwise skip it.
            if (dist > 1) {
              finalRingPaths.push(pt);
            }
          }
        }
        
        // Ensure polygon closes properly if needed, but Google Maps handles polygon closure implicitly.
        polygonPaths.push(finalRingPaths);
      }
      newEditablePaths.push(polygonPaths);
    });

    if (snappedCount > 0) {
      editor.setHasChanges(true);
      editor.setEditablePaths(newEditablePaths);
      editor.history.saveToHistory(newEditablePaths);
      setVertexTick(t => t + 1);
      setActionSuccess(`Auto-snapped ${snappedCount} points to nearest references!`);
    } else {
      setActionSuccess("Points are already aligned or too far to snap (must be within 15km).");
    }
    setIsAutoSnapping(false);
    document.body.style.cursor = 'default';
    }, 50);
  };

  const handleAnalyze = () => {
    if (showAnalysis) {
      overlapPolygonRefs.current.forEach(p => p.setMap(null));
      overlapPolygonRefs.current = [];
      setShowAnalysis(false);
      return;
    }

    if (!showReferences || !referencePolygonRefs.current.length) {
      setActionError("Please turn on 'Refs' to analyze overlaps with neighbors.");
      return;
    }
    if (!region || !editor.editablePaths || editor.editablePaths.length === 0) return;
    
    setIsAnalyzing(true);
    overlapPolygonRefs.current.forEach(p => p.setMap(null));
    overlapPolygonRefs.current = [];
    gapPolygonRefs.current.forEach(p => p.setMap(null));
    gapPolygonRefs.current = [];

    setTimeout(() => {
      try {
        const activeGeojson = googlePathsToGeoJSON(editor.editablePaths);
        let overlapFound = false;

        referencePolygonRefs.current.forEach(refPoly => {
          if (!refPoly.getMap()) return;
          const refPaths = refPoly.getPaths();
          const refRings: google.maps.LatLng[][] = [];
          for (let i = 0; i < refPaths.getLength(); i++) {
            const ring = refPaths.getAt(i);
            const pts: google.maps.LatLng[] = [];
            for (let j = 0; j < ring.getLength(); j++) {
              pts.push(ring.getAt(j));
            }
            refRings.push(pts);
          }
          if (refRings.length === 0) return;
          const refGeojson = googlePathsToGeoJSON([refRings]);
          
          const activeFeature = { type: 'Feature', properties: {}, geometry: activeGeojson };
          const refFeature = { type: 'Feature', properties: {}, geometry: refGeojson };
          const overlap = turf.intersect(turf.featureCollection([activeFeature, refFeature] as any));
          if (overlap) {
            overlapFound = true;
            const overlapPaths = geojsonToGooglePaths(overlap.geometry as any);
            overlapPaths.forEach(paths => {
              const poly = new google.maps.Polygon({
                paths,
                fillColor: "#FF0000",
                fillOpacity: 0.6,
                strokeColor: "#FF0000",
                strokeWeight: 2,
                zIndex: 100,
                map: mapRef.current
              });
              overlapPolygonRefs.current.push(poly);
            });
          }
        });

        setShowAnalysis(true);
        if (overlapFound) {
          setActionError("Overlaps detected! Highlighted in Red.");
        } else {
          setActionSuccess("No overlaps detected!");
        }
      } catch(err) {
        console.error("Analyze failed:", err);
        setActionError("Failed to analyze boundary.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 50);
  };

  handleBooleanOperationRef.current = (operation: 'merge' | 'subtract', refPoly: google.maps.Polygon) => {
    if (!region || !editor.editablePaths || editor.editablePaths.length === 0) return;
    try {
      const activeGeojson = googlePathsToGeoJSON(editor.editablePaths);
      
      const refPaths = refPoly.getPaths();
      const refRings: google.maps.LatLng[][] = [];
      for (let i = 0; i < refPaths.getLength(); i++) {
        const ring = refPaths.getAt(i);
        const pts: google.maps.LatLng[] = [];
        for (let j = 0; j < ring.getLength(); j++) {
          pts.push(ring.getAt(j));
        }
        refRings.push(pts);
      }
      const refGeojson = googlePathsToGeoJSON([refRings]);
      
      const activeFeature = { type: 'Feature', properties: {}, geometry: activeGeojson };
      const refFeature = { type: 'Feature', properties: {}, geometry: refGeojson };
      
      let resultFeature: any = null;
      if (operation === 'merge') {
        resultFeature = turf.union(turf.featureCollection([activeFeature, refFeature] as any));
      } else if (operation === 'subtract') {
        resultFeature = turf.difference(turf.featureCollection([activeFeature, refFeature] as any));
        if (!resultFeature) {
           setBooleanPrompt(prev => ({ ...prev, isOpen: false }));
           setActionError("Subtracting this region completely deletes your active region!");
           return;
        }
      }

      if (resultFeature && resultFeature.geometry) {
        const newPaths = geojsonToGooglePaths(resultFeature.geometry as any);
        if (newPaths && newPaths.length > 0) {
          editor.setEditablePaths(newPaths);
          editor.history.saveToHistory(newPaths);
          setVertexTick(t => t + 1);
          setBooleanPrompt(prev => ({ ...prev, isOpen: false }));
          setActionSuccess(`Successfully ${operation === 'merge' ? 'merged' : 'subtracted'} the region!`);
        }
      }
    } catch(err) {
      console.error(`Boolean operation ${operation} failed:`, err);
      setBooleanPrompt(prev => ({ ...prev, isOpen: false }));
      setActionError(`Failed to ${operation} regions. The shapes might be too complex.`);
    }
  };

  return (
    <div
      id="region-map-wrapper"
      className="fixed inset-x-0 bottom-0 top-[65px] z-[10] bg-gray-900 overflow-hidden flex flex-col"
    >


      {/* 1. Unified MapToolbar */}
      {mapRef.current && (
        <MapToolbar
          map={mapRef.current}
          layersState={{} as any}
          onLayerToggle={() => {}}
          onColorModeToggle={toggleDarkMode}
          onOpenSettings={() => {}}
          onDataSaved={() => {}}
          hideNetworkCatalog={true}
          hideGeometrySuite={true}
          hideBoundaries={true}
          hideSearch={true}
          hideLocation={true}
          hideSettings={true}
          hideResetView={false}
          hideTip={true}
          extraTools={
            <RegionEditorToolbarTools
              editMode={editor.editMode}
              activeMode={activeMode}
              onChangeMode={setActiveMode}
              showPolygonManager={editor.showPolygonManager}
              onTogglePolygonManager={() => editor.setShowPolygonManager(!editor.showPolygonManager)}
              onAutoSnap={handleAutoSnap}
              isAutoSnapping={isAutoSnapping}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onImportClick={() => fileInputRef.current?.click()}
              onExportClick={importExport.handleExportGeoJSON}
              onResetClick={() => editor.setShowResetDialog(true)}
              showReferences={showReferences}
              onToggleReferences={() => setShowReferences(prev => !prev)}
              showOriginal={showOriginal}
              onToggleOriginal={() => setShowOriginal(prev => !prev)}
              canUndo={editor.history.canUndo}
              canRedo={editor.history.canRedo}
              onUndo={() => {
                const paths = editor.history.undo();
                if (paths) {
                  editor.setEditablePaths(paths);
                  polygonRefs.current.forEach(p => p.setMap(null));
                  polygonRefs.current = [];
                  paths.forEach((pathRings, index) => {
                    const color = POLYGON_COLORS[index % POLYGON_COLORS.length];
                    const polygon = new google.maps.Polygon({
                      paths: pathRings,
                      strokeColor: color, strokeOpacity: 1, strokeWeight: 2.5,
                      fillColor: color, fillOpacity: 0.25,
                      editable: true, draggable: false,
                      map: mapRef.current,
                    });
                    polygonRefs.current.push(polygon);
                  });
                  setVertexTick(t => t + 1);
                }
              }}
              onRedo={() => {
                const paths = editor.history.redo();
                if (paths) {
                  editor.setEditablePaths(paths);
                  polygonRefs.current.forEach(p => p.setMap(null));
                  polygonRefs.current = [];
                  paths.forEach((pathRings, index) => {
                    const color = POLYGON_COLORS[index % POLYGON_COLORS.length];
                    const polygon = new google.maps.Polygon({
                      paths: pathRings,
                      strokeColor: color, strokeOpacity: 1, strokeWeight: 2.5,
                      fillColor: color, fillOpacity: 0.25,
                      editable: true, draggable: false,
                      map: mapRef.current,
                    });
                    polygonRefs.current.push(polygon);
                  });
                  setVertexTick(t => t + 1);
                }
              }}
              onSave={() => editor.setShowSaveDialog(true)}
              hasChanges={editor.hasChanges}
              saving={editor.saving}
              onFitBounds={() => {
                if (editor.editablePaths.length > 0) {
                  fitBounds(editor.editablePaths);
                } else if (googlePaths.length > 0) {
                  fitBounds(googlePaths);
                }
              }}
            />
          }
          leftAccessory={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (editor.hasChanges) {
                    setShowBackConfirm(true);
                  } else {
                    onClose?.();
                  }
                }}
                className="flex items-center justify-center bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all rounded-xl h-8 w-8 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/50 dark:border-white/10 group"
                title="Go Back"
              >
                <svg
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              
              <div className="w-px h-5 bg-slate-300/50 dark:bg-slate-600/50 mx-0.5"></div>
              
              <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl px-2 h-8 border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-inner shadow-blue-400/30 mr-1.5">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                  {region?.name || "Select Region"}
                </span>
                
                <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-600/50 mx-2"></div>
                
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${editor.editMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {editor.editMode ? "Editing" : "View"}
                </span>
              </div>

              {!editor.editMode && (
                <button
                  onClick={() => editor.setEditMode(true)}
                  className="px-3 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
                >
                  Edit Boundary
                </button>
              )}
              {editor.editMode && (
                <button
                  onClick={() => editor.setShowCancelDialog(true)}
                  className="px-3 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] border border-slate-300/50 dark:border-white/5"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          }
        />
      )}



      {/* 3. Floating Status (Bottom Right) */}
      <EditorStatus
        vertexCount={liveVertexCount}
        loading={dataLoading || infraLoading}
        editMode={editor.editMode}
      />

      {/* 4. Map Canvas */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 bg-gray-900"
        id="region-boundary-map"
      />

      {/* Overlay: Data Loading */}
      {dataLoading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Overlay: Polygon Manager Panel */}
      {editor.editMode && (
        <PolygonManagerPanel
          paths={editor.editablePaths}
          deletedPaths={deletedPaths}
          selectedIndex={editor.selectedPolygonIndex}
          onSelect={editor.setSelectedPolygonIndex}
          onFocus={(index) => {
            const poly = polygonRefs.current[index];
            if (poly && mapRef.current) {
              const bounds = new google.maps.LatLngBounds();
              poly.getPath().forEach((latLng) => bounds.extend(latLng));
              mapRef.current.fitBounds(bounds);

              // If very small, zoom out a bit (optional) or ensure not too zoomed in
              const listener = google.maps.event.addListenerOnce(
                mapRef.current,
                "idle",
                () => {
                  if (mapRef.current!.getZoom()! > 16)
                    mapRef.current!.setZoom(16);
                },
              );
            }
          }}
          onDelete={(index) => {
            setDeleteCandidateIndex(index);
            setShowDeleteConfirm(true);
          }}
          onRestore={(index) => {
            const pathObj = deletedPaths[index];
            const newDeleted = [...deletedPaths];
            newDeleted.splice(index, 1);
            setDeletedPaths(newDeleted);

            const newPaths = [...editor.editablePaths, pathObj];
            editor.setEditablePaths(newPaths);
            editor.setHasChanges(true);
            editor.history.saveToHistory(newPaths);

            // Sync map (add restored polygon)
            if (mapRef.current) {
              const restoredIndex = editor.editablePaths.length;
              const color = POLYGON_COLORS[restoredIndex % POLYGON_COLORS.length];
              const polygon = new google.maps.Polygon({
                paths: pathObj,
                strokeColor: color,
                strokeOpacity: 1,
                strokeWeight: 2.5,
                fillColor: color,
                fillOpacity: 0.25,
                editable: true,
                draggable: false,
                map: mapRef.current,
              });

              const gPath = polygon.getPath();
              ["set_at", "insert_at", "remove_at"].forEach((evt) => {
                google.maps.event.addListener(gPath, evt, () => {
                  editor.setHasChanges(true);
                });
              });

              polygonRefs.current.push(polygon);
            }
            setActionSuccess("Restored boundary part.");
          }}
          isOpen={editor.showPolygonManager}
          onToggle={() =>
            editor.setShowPolygonManager(!editor.showPolygonManager)
          }
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".geojson,.json"
        onChange={importExport.handleImportFile}
        className="hidden"
      />

      {/* Dialogs */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteCandidateIndex(null);
        }}
        onConfirm={() => {
          if (deleteCandidateIndex === null) return;

          const index = deleteCandidateIndex;
          const pathToDelete = editor.editablePaths[index];

          // Move to deleted
          setDeletedPaths((prev) => [...prev, pathToDelete]);

          // Remove from active
          const newPaths = [...editor.editablePaths];
          newPaths.splice(index, 1);
          editor.setEditablePaths(newPaths);
          editor.setHasChanges(true);
          editor.history.saveToHistory(newPaths);

          // Sync Map
          if (mapRef.current) {
            const polyToRemove = polygonRefs.current[index];
            if (polyToRemove) polyToRemove.setMap(null);
            polygonRefs.current.splice(index, 1);
          }

          setShowDeleteConfirm(false);
          setDeleteCandidateIndex(null);
          setActionSuccess(
            "Boundary part deleted. You can restore it from the Manage Parts panel.",
          );
        }}
      />

      <SaveBoundaryDialog
        isOpen={editor.showSaveDialog}
        onClose={() => editor.setShowSaveDialog(false)}
        onConfirm={actions.handleConfirmSave}
        onSaveAndPublish={actions.handleSaveAndPublish}
        changeReason={changeReason}
        setChangeReason={setChangeReason}
        saving={editor.saving}
        analyzingImpact={analyzingImpact}
      />

      <QuickPublishDialog
        isOpen={editor.showQuickPublishDialog}
        onClose={() => editor.setShowQuickPublishDialog(false)}
        onConfirm={async () => {
          try {
            editor.setSaving(true);
            setActionError(null);

            await publishDraftBoundary(regionId);

            setActionSuccess("Boundary published successfully!");
            editor.setShowQuickPublishDialog(false);
            editor.setHasChanges(false);
            editor.setEditMode(false);
            setChangeReason("");
            setDraftStash(prev => {
                const p = {...prev};
                delete p[activeRegionId];
                return p;
            });

            const { boundaryCache } =
              await import("../../../services/region/boundaryCache");
            await boundaryCache.clear();

            setTimeout(() => window.location.reload(), 2000);
          } catch (err: any) {
            console.error("Failed to publish:", err);
            setActionError(
              err.response?.data?.error || "Failed to publish boundary",
            );
            editor.setSaving(false);
          }
        }}
        impactAnalysis={impactAnalysis}
        publishReason={changeReason}
        setPublishReason={setChangeReason}
        publishing={editor.saving}
        setImpactAnalysis={setImpactAnalysis}
      />

      <CancelEditDialog
        isOpen={editor.showCancelDialog}
        onClose={() => editor.setShowCancelDialog(false)}
        onConfirm={() => {
          editor.setEditMode(false);
          editor.setHasChanges(false);
          editor.setShowCancelDialog(false);
          
          if (boundaryData && boundaryData.geojson) {
             editor.setEditablePaths([]);
             setDraftStash(prev => {
                const p = {...prev};
                delete p[activeRegionId];
                return p;
             });
          }
        }}
      />

      <ResetBoundaryDialog
        isOpen={editor.showResetDialog}
        onClose={() => editor.setShowResetDialog(false)}
        onConfirm={async () => {
          if (!region?.name) return;

          try {
            const response = await fetch("/india.json");
            const indiaData = await response.json();
            const normalize = (str: string) =>
              str
                ?.toLowerCase()
                .trim()
                .replace(/[^a-z0-9]/g, "") || "";
            const targetName = normalize(region.name);

            let regionBoundary = indiaData.features?.find((f: any) => {
              const pName = normalize(f.properties?.name);
              const pStNm = normalize(f.properties?.st_nm);
              const pId = f.properties?.id;
              return (
                pName === targetName || pStNm === targetName || pId == regionId
              );
            });

            // Special Case: Handle merged "Dadra and Nagar Haveli and Daman and Diu"
            if (
              !regionBoundary &&
              targetName.includes("dadra") &&
              targetName.includes("daman")
            ) {
              const dnh = indiaData.features?.find(
                (f: any) =>
                  normalize(f.properties?.st_nm) === "dadraandnagarhaveli",
              );
              const dd = indiaData.features?.find(
                (f: any) => normalize(f.properties?.st_nm) === "damananddiu",
              );

              if (dnh && dd) {
                // Merge into a MultiPolygon
                const dnhCoords =
                  dnh.geometry.type === "Polygon"
                    ? [dnh.geometry.coordinates]
                    : dnh.geometry.coordinates;
                const ddCoords =
                  dd.geometry.type === "Polygon"
                    ? [dd.geometry.coordinates]
                    : dd.geometry.coordinates;

                // Diu Island (Approximate Polygon for fallback)
                const DIU_COORDINATES = [
                  [70.9, 20.71],
                  [70.99, 20.71],
                  [71.02, 20.713],
                  [71.02, 20.73],
                  [70.99, 20.73],
                  [70.9, 20.73],
                  [70.9, 20.71],
                ];

                regionBoundary = {
                  type: "Feature",
                  properties: { st_nm: region.name },
                  geometry: {
                    type: "MultiPolygon",
                    coordinates: [...dnhCoords, ...ddCoords, [DIU_COORDINATES]],
                  },
                };
              }
            }

            if (regionBoundary?.geometry) {
              const googlePaths = geojsonToGooglePaths(regionBoundary.geometry);
              
              editor.setEditablePaths(googlePaths);
              editor.setHasChanges(true);
              editor.setEditMode(true);
              editor.setShowResetDialog(false);
              editor.history.saveToHistory(googlePaths);
              setActionSuccess("Reset to original boundary from india.json");
            } else {
              setActionError("Could not find original boundary in india.json");
              editor.setShowResetDialog(false);
            }
          } catch (e) {
            console.error("Failed to reset:", e);
            setActionError("Failed to load original boundary");
            editor.setShowResetDialog(false);
          }
        }}
        loading={false}
        hasChanges={editor.hasChanges}
        regionName={region?.name}
      />

      <ImportGeoJSONDialog
        isOpen={importExport.showImportDialog}
        onClose={() => importExport.setShowImportDialog(false)}
        onConfirm={importExport.handleConfirmImport}
        importPreview={importExport.importPreview}
        importedFile={importExport.importedFile}
        setImportedFile={importExport.setImportedFile}
        setImportPreview={importExport.setImportPreview}
      />

      {booleanPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Boolean Operation</h3>
            <p className="text-slate-300 text-sm mb-6">
              What would you like to do with <span className="text-blue-400 font-semibold">{booleanPrompt.regionName}</span> against your active boundary?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (booleanPrompt.refPoly) handleBooleanOperationRef.current?.('merge', booleanPrompt.refPoly);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 transition-colors"
              >
                <span className="font-semibold">Merge (Union)</span>
                <span className="text-xs opacity-70">Combine shapes together</span>
              </button>
              
              <button
                onClick={() => {
                  if (booleanPrompt.refPoly) handleBooleanOperationRef.current?.('subtract', booleanPrompt.refPoly);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-colors"
              >
                <span className="font-semibold">Subtract (Difference)</span>
                <span className="text-xs opacity-70">Punch a hole / Cut out</span>
              </button>
              
              <button
                onClick={() => setBooleanPrompt(prev => ({ ...prev, isOpen: false }))}
                className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={() => {
          setShowBackConfirm(false);
          onClose?.();
        }}
        title="Unsaved Changes"
        message="You have unsaved changes to the boundary. Are you sure you want to go back? All your edits will be lost."
        confirmText="Yes, Go Back"
        cancelText="Stay Here"
        type="warning"
      />

      <ConfirmDialog
        isOpen={contextSwitchTarget !== null}
        onClose={() => setContextSwitchTarget(null)}
        onConfirm={() => {
          if (!contextSwitchTarget) return;
          // Stash current edits before switching
          const currentPaths = snapshotCurrentPaths();
          setDraftStash(prev => ({ ...prev, [activeRegionId]: currentPaths }));

          // IMMEDIATELY clear map polygons so old editable handles disappear
          clearMap();

          // Clear editor state so the new region's data loads fresh
          editor.setEditablePaths([]);
          editor.setHasChanges(false);
          editor.history.clearHistory();
          
          // Reset fitBounds tracking so the new region gets zoomed to
          lastFittedRegionRef.current = null;
          
          setActiveRegionId(contextSwitchTarget.id);
          setContextSwitchTarget(null);
          
          // Auto-deactivate references button as requested by user
          // They can manually turn it back on after the new region loads.
          setShowReferences(false);
        }}
        title="Switch Editing Context"
        message={`Do you want to stash your current edits and switch to editing ${contextSwitchTarget?.name}?`}
        confirmText="Yes, Switch Context"
        cancelText="Cancel"
        type="warning"
      />

      {/* Toast Notifications */}
      {(actionError || actionSuccess) && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50">
          {actionError && (
            <div className="bg-red-500/90 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce-in">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {actionError}
              <button
                onClick={() => setActionError(null)}
                className="ml-2 opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}
          {actionSuccess && (
            <div className="bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce-in">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {actionSuccess}
              <button
                onClick={() => setActionSuccess(null)}
                className="ml-2 opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionBoundaryEditor;
