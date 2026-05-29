import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
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
  const [activeMode, setActiveMode] = useState<'select' | 'add_point'>('select');
  const activeModeRef = useRef(activeMode);
  
  // Real-time tick to force React to update the live vertex count without relying on un-mutated boolean "hasChanges"
  const [vertexTick, setVertexTick] = useState(0);
  
  // Debounce timer ref for history saves during vertex dragging
  const historySaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 2. Load Region Data
  const {
    region,
    boundaryData,
    error: loadError,
    loading: dataLoading,
    mapCenter,
    mapZoom,
  } = useRegionData(regionId);

  // Infra Layer Data
  const {
    points: infraPoints,
    loading: infraLoading,
    setPoints: setInfraPoints,
  } = useInfraLayer(regionId, showInfra);

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

    const loadReferences = async () => {
      try {
        const res = await getAllPublishedBoundaries();
        if (res.success && res.boundaries) {
          referencePolygonRefs.current.forEach(p => p.setMap(null));
          referencePolygonRefs.current = [];
          
          res.boundaries.forEach(b => {
             // Exclude current region safely mapping both to Numbers
             if (Number(b.regionId) === Number(regionId)) return;
             if (!b.boundaryGeoJSON) return;
             
             try {
               const refPaths = geojsonToGooglePaths(b.boundaryGeoJSON);
               refPaths.forEach(path => {
                  const polygon = new google.maps.Polygon({
                    paths: path,
                    strokeColor: isDarkMode ? "#9CA3AF" : "#6B7280",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: isDarkMode ? "#374151" : "#E5E7EB",
                    fillOpacity: 0.1,
                    editable: false,
                    clickable: false,
                    map: mapRef.current,
                    zIndex: -1
                  });
                  referencePolygonRefs.current.push(polygon);
               });
             } catch(e) {
               console.warn("Failed to render reference boundary for region", b.regionId, e);
             }
          });
        }
      } catch(err) {
        console.error("Failed to load reference boundaries", err);
      }
    };

    loadReferences();
    
    return () => {
       referencePolygonRefs.current.forEach(p => p.setMap(null));
       referencePolygonRefs.current = [];
    };
  }, [showReferences, regionId, isDarkMode, mapRef.current]);

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
        mapId: "e8aea2a23d836c7d4bd283d8", // Required for 3D Vector Maps
        mapTypeId: isDarkMode ? "roadmap" : "roadmap", // Force roadmap for WebGL 3D
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
              const path = polygon.getPath();
              // Prevent deleting if only 3 points left (minimum for a polygon)
              if (path.getLength() > 3) {
                path.removeAt(e.vertex);
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
          for (let pIdx = 0; pIdx < polyPaths.getLength(); pIdx++) {
            const ringPath = polyPaths.getAt(pIdx);
            ["set_at", "insert_at", "remove_at"].forEach((evt) => {
              google.maps.event.addListener(ringPath, evt, () => {
                editor.setHasChanges(true);
                
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
      if (editor.editablePaths.length === 0 && googlePaths.length > 0) {
        editor.setEditablePaths(googlePaths);
      }

      // Auto-Zoom to Polygon (only if we have paths)
      if (pathsToRender.length > 0) {
        fitBounds(pathsToRender);
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
    regionId,
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
    regionId,
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
