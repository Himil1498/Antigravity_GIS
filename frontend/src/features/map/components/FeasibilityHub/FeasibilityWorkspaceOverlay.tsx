/**
 * FeasibilityWorkspaceOverlay
 * Pure UI overlay for Feasibility Mode on the Main Map.
 * Renders sidebars, modals, and elevation panel as absolute overlays.
 * Uses useFeasibilityMapObjects hook for imperative map markers/polylines.
 * Does NOT render its own <GoogleMap> — it operates on the Main Map instance.
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MapPin, ArrowRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePermission } from '../../../../hooks/usePermission';
import { locationMarkerService, MarkedLocation } from '../../../../services/gisTools/locationMarkerService';
import { useFeasibilityMapObjects } from '../../hooks/useFeasibilityMapObjects';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import FeasibilitySurveysSidebar from './FeasibilitySurveysSidebar';
import FeasibilityStudyPanel from './FeasibilityStudyPanel';
import FeasibilityElevationPanel from './FeasibilityElevationPanel';
import api from '../../../../services/api';
import { INDIA_ADMIN_REGIONS } from '../../../../shared/constants/india-regions';
import { detectStateFromCoordinates } from '../../../../utils/regionMapping/geometry';

// Helper to determine region (state/UT) from coordinates
const getRegionForCoords = (lat: number, lng: number): string => {
  try {
    const stateName = detectStateFromCoordinates(lat, lng);
    if (stateName) return stateName;
  } catch (e) {
    // Ignore and fallback
  }

  // Fallback: simple distance calculation to find the closest region center
  let closestRegion = INDIA_ADMIN_REGIONS[0].name;
  let minDistance = Infinity;

  for (const region of INDIA_ADMIN_REGIONS) {
    const dLat = region.lat - lat;
    const dLng = region.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closestRegion = region.name;
    }
  }

  return closestRegion;
};

interface ElevationStudy {
  customerCoords: { lat: number; lng: number };
  btsCoords: { lat: number; lng: number };
  customerName: string;
  btsName: string;
}

interface FeasibilityWorkspaceOverlayProps {
  map: google.maps.Map;
  onClose: () => void;
}

const FeasibilityWorkspaceOverlay: React.FC<FeasibilityWorkspaceOverlayProps> = ({ map, onClose }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, isAdmin, isManager } = usePermission();
  const robustCan = useCallback((permission: string) => {
    if (permission === 'network:feasibility:edit' && (isAdmin || isManager)) {
      return true;
    }
    return can(permission);
  }, [can, isAdmin, isManager]);

  // ── Core State ──
  const [markers, setMarkers] = useState<MarkedLocation[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleMarkerIds, setVisibleMarkerIds] = useState<Set<number>>(new Set());
  const [showConnections, setShowConnections] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // ── Region Filter State ──
  const [apiRegions, setApiRegions] = useState<any[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);

  // Fetch regions on mount
  useEffect(() => {
    api.get("/regions")
      .then(res => {
        setApiRegions(res.data.regions || []);
      })
      .catch(err => {
        console.error("Failed to fetch regions for feasibility hub:", err);
      });
  }, []);

  const regionOptions = useMemo(() => {
    return apiRegions.map((r: any) => {
      const constRegion = INDIA_ADMIN_REGIONS.find((c) => c.name === r.name);
      return {
        id: r.id,
        name: r.name,
        lat: constRegion?.lat || 20.5937,
        lng: constRegion?.lng || 78.9629,
        zoom: constRegion?.zoom || 4,
      };
    });
  }, [apiRegions]);

  const handleRegionChange = useCallback((newIds: number[]) => {
    setSelectedRegionIds(newIds);
    if (map && newIds.length > 0) {
      if (newIds.length === 1) {
        const region = regionOptions.find((r) => r.id === newIds[0]);
        if (region) {
          map.panTo({ lat: region.lat, lng: region.lng });
          map.setZoom(region.zoom);
        }
      } else {
        const bounds = new google.maps.LatLngBounds();
        let valid = false;
        newIds.forEach((id) => {
          const region = regionOptions.find((r) => r.id === id);
          if (region) {
            bounds.extend(new google.maps.LatLng(region.lat, region.lng));
            valid = true;
          }
        });
        if (valid) {
          map.fitBounds(bounds);
        }
      }
    }
  }, [map, regionOptions]);

  const filteredMarkers = useMemo(() => {
    return markers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedRegionIds.length === 0) return matchesSearch;
      
      const regionName = getRegionForCoords(m.lat, m.lng);
      const matchedRegionOption = regionOptions.find(ro => ro.name === regionName);
      if (!matchedRegionOption) return false;
      
      return selectedRegionIds.includes(matchedRegionOption.id) && matchesSearch;
    });
  }, [markers, searchQuery, selectedRegionIds, regionOptions]);

  // Sync add mode to window global for AddressInspector suppression
  useEffect(() => {
    (window as any).isFeasibilityAddMode = isAddMode;
    return () => {
      delete (window as any).isFeasibilityAddMode;
    };
  }, [isAddMode]);

  // ── Sidebar State ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  // Broadcast panel state for MapToolbar layout logic
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("feasibilityPanelsState", { 
        detail: { 
          isSidebarOpen, 
          isDetailsOpen: !!selectedMarker && isDetailsOpen 
        } 
      })
    );
  }, [isSidebarOpen, isDetailsOpen, selectedMarker]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("feasibilityPanelsState", { 
          detail: { isSidebarOpen: false, isDetailsOpen: false } 
        })
      );
    };
  }, []);

  // Listen to MapToolbar collapse events (e.g. from Geometry Suite Elevation Profile)
  useEffect(() => {
    const handleCollapse = (e: any) => {
      if (e.detail && typeof e.detail.collapse === "boolean") {
        const isCollapsed = e.detail.collapse;
        setIsSidebarOpen(!isCollapsed);
        setIsDetailsOpen(!isCollapsed);
        (window as any).isGisFocusActive = isCollapsed;
      }
    };
    window.addEventListener("setMapToolbarCollapse" as any, handleCollapse);
    return () => window.removeEventListener("setMapToolbarCollapse" as any, handleCollapse);
  }, []);

  // ── Elevation State ──
  const [activeElevationStudy, setActiveElevationStudy] = useState<ElevationStudy | null>(null);

  // Sync elevation study visibility with checkbox states
  useEffect(() => {
    if (activeElevationStudy) {
      const correspondingMarker = markers.find(
        m => m.name === activeElevationStudy.customerName
      );
      if (correspondingMarker && !visibleMarkerIds.has(correspondingMarker.id)) {
        setActiveElevationStudy(null);
        // Also restore sidebars & toolbars
        setIsSidebarOpen(true);
        setIsDetailsOpen(true);
        (window as any).isGisFocusActive = false;
        window.dispatchEvent(
          new CustomEvent("setMapToolbarCollapse", { detail: { collapse: false } })
        );
      }
    }
  }, [visibleMarkerIds, activeElevationStudy, markers]);

  // Clear elevation study if selected marker is closed
  useEffect(() => {
    if (!selectedMarker && activeElevationStudy) {
      setActiveElevationStudy(null);
      (window as any).isGisFocusActive = false;
      window.dispatchEvent(
        new CustomEvent("setMapToolbarCollapse", { detail: { collapse: false } })
      );
    }
  }, [selectedMarker, activeElevationStudy]);

  // ── Naming Modal State ──
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);

  // ── Map click listener for adding study sites ──
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      // Only capture clicks in add mode
      if (!isAddMode) return;
      setPendingCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setNewName('New Staff Survey');
      setIsNamingModalOpen(true);
    });

    return () => google.maps.event.removeListener(listener);
  }, [map, isAddMode]);

  // ── Wire imperative map objects ──
  useFeasibilityMapObjects({
    map,
    markers: filteredMarkers,
    visibleMarkerIds,
    selectedMarkerId: selectedMarker?.id ?? null,
    showConnections,
    activeElevationStudy,
    onMarkerClick: (m) => {
      setSelectedMarker(m);
      setIsDetailsOpen(true);
    },
    onCandidateClick: (candidate) => {
      // Open candidate elevation study
      const studyMarker = markers.find(mk => mk.name === candidate.studyName);
      if (studyMarker) {
        setActiveElevationStudy({
          customerCoords: { lat: Number(studyMarker.lat), lng: Number(studyMarker.lng) },
          btsCoords: { lat: Number(candidate.lat), lng: Number(candidate.lng) },
          customerName: String(studyMarker.name),
          btsName: String(candidate.name || 'Candidate'),
        });
      }
    },
  });

  // ── Data Fetching ──
  const fetchMarkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationMarkerService.getMarkers(true);
      setMarkers(data);
      setVisibleMarkerIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load feasibility studies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMarkers(); }, [fetchMarkers]);

  // Auto-select marker from URL and force refresh for persistent map
  useEffect(() => {
    const autoMarkerId = searchParams.get('markerId');
    const isMapPage = window.location.pathname.includes('/map') || window.location.pathname.includes('/network-planning');
    if (autoMarkerId && isMapPage) {
      // Because MapPage is persistent and doesn't unmount, we must force a fresh fetch
      // when we detect a navigation return with a markerId.
      locationMarkerService.getMarkers(true).then((freshData) => {
        setMarkers(freshData);
        
        const found = freshData.find(m => m.id === Number(autoMarkerId));
        if (found) {
          setVisibleMarkerIds(new Set([found.id]));
          setSelectedMarker(found);
          setIsDetailsOpen(true);
          if (map) {
            map.panTo({ lat: found.lat, lng: found.lng });
            map.setZoom(14);
          }
        } else {
          setVisibleMarkerIds(new Set());
        }
        
        // Clean up URL safely without breaking router state
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.delete('markerId');
          return next;
        }, { replace: true });
      }).catch(console.error);
    }
  }, [searchParams, map, selectedMarker?.id, setSearchParams]);

  // ── Actions ──
  const handleSaveNewStudy = async () => {
    if (!pendingCoords || !newName.trim()) return;
    try {
      const newMarker = await locationMarkerService.saveMarker({
        name: newName, lat: pendingCoords.lat, lng: pendingCoords.lng,
        is_feasibility: true, remarks: newRemarks,
      });
      setMarkers(prev => [newMarker, ...prev]);
      setVisibleMarkerIds(prev => {
        const next = new Set(prev);
        next.add(newMarker.id);
        return next;
      });
      setSelectedMarker(newMarker);
      setIsAddMode(false);
      setIsNamingModalOpen(false);
      setPendingCoords(null);
      setNewRemarks('');
      toast.success('Location marked for feasibility');
    } catch (err) {
      toast.error('Failed to save marker');
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await locationMarkerService.deleteMarker(deleteConfirmId);
      setMarkers(prev => prev.filter(m => m.id !== deleteConfirmId));
      setVisibleMarkerIds(prev => {
        const next = new Set(prev);
        next.delete(deleteConfirmId);
        return next;
      });
      if (selectedMarker?.id === deleteConfirmId) setSelectedMarker(null);
      toast.success('Study deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleProcessExcel = (marker: MarkedLocation) => {
    navigate(`/tools/excel-to-kml?mode=feasibility&markerId=${marker.id}`);
  };


  const toggleVisibility = useCallback((id: number) => {
    setVisibleMarkerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisibility = useCallback(() => {
    setVisibleMarkerIds(prev => {
      const next = new Set(prev);
      const allVisible = filteredMarkers.length > 0 && filteredMarkers.every(m => prev.has(m.id));
      if (allVisible) {
        filteredMarkers.forEach(m => next.delete(m.id));
      } else {
        filteredMarkers.forEach(m => next.add(m.id));
      }
      return next;
    });
  }, [filteredMarkers]);

  return (
    <>
      {/* ── Left Sidebar: Site Surveys ── */}
      <FeasibilitySurveysSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        markers={markers}
        filteredMarkers={filteredMarkers}
        selectedMarker={selectedMarker}
        setSelectedMarker={setSelectedMarker}
        setIsDetailsOpen={setIsDetailsOpen}
        visibleMarkerIds={visibleMarkerIds}
        toggleVisibility={toggleVisibility}
        toggleAllVisibility={toggleAllVisibility}
        showConnections={showConnections}
        setShowConnections={setShowConnections}
        isAddMode={isAddMode}
        setIsAddMode={setIsAddMode}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setDeleteConfirmId={setDeleteConfirmId}
        map={map}
        can={robustCan}
        onClose={onClose}
        fetchMarkers={fetchMarkers}
        selectedRegionIds={selectedRegionIds}
        regionOptions={regionOptions}
        onRegionChange={handleRegionChange}
      />

      {/* ── Right Sidebar: Study Details ── */}
      {selectedMarker && (
        <FeasibilityStudyPanel
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          setActiveElevationStudy={setActiveElevationStudy}
          handleProcessExcel={handleProcessExcel}
          can={robustCan}
          onUpdateMarker={(updated) => {
            setMarkers(prev => prev.map(m => m.id === updated.id ? updated : m));
            setSelectedMarker(updated);
          }}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          map={map}
        />
      )}

      {/* ── Add Mode Banner ── */}
      <AnimatePresence>
        {isAddMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl flex items-center gap-3 z-[60] pointer-events-none"
          >
            <MapPin className="w-5 h-5 animate-bounce" />
            <span className="font-semibold">Click on map to mark customer location</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Naming Modal ── */}
      <AnimatePresence>
        {isNamingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Staff Survey</h3>
                  <p className="text-sm text-gray-500">Provide a name for this survey location</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Survey / Staff Name</label>
                  <input
                    autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewStudy()}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all text-lg shadow-inner"
                    placeholder="e.g. Acme HQ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Remarks / Description</label>
                  <textarea
                    value={newRemarks} onChange={(e) => setNewRemarks(e.target.value)} rows={2}
                    className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-inner"
                    placeholder="Optional survey comments..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsNamingModalOpen(false)} className="flex-1 py-4 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl transition-all">Cancel</button>
                  <button onClick={handleSaveNewStudy} className="flex-1 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                    Create Survey <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Staff Survey?"
        message="Are you sure you want to remove this site survey? This will permanently delete the survey data and connection markers."
        confirmText="Delete Survey"
        type="danger"
      />

      {/* ── Elevation Profile Panel ── */}
      {activeElevationStudy && (
        <FeasibilityElevationPanel
          key="feasibility-elevation-panel"
          customerCoords={activeElevationStudy.customerCoords}
          btsCoords={activeElevationStudy.btsCoords}
          customerName={activeElevationStudy.customerName}
          btsName={activeElevationStudy.btsName}
          onClose={() => {
            setActiveElevationStudy(null);
            setIsSidebarOpen(true);
            setIsDetailsOpen(true);
            (window as any).isGisFocusActive = false;
            window.dispatchEvent(
              new CustomEvent("setMapToolbarCollapse", { detail: { collapse: false } })
            );
          }}
          map={map}
          onFocusMap={() => {
            const currentlyFocused = !isSidebarOpen && !isDetailsOpen;
            setIsSidebarOpen(currentlyFocused);
            setIsDetailsOpen(currentlyFocused);
            (window as any).isGisFocusActive = !currentlyFocused;
            
            // Also collapse or restore MapToolbar
            window.dispatchEvent(
              new CustomEvent("setMapToolbarCollapse", { detail: { collapse: !currentlyFocused } })
            );
          }}
          isFocusActive={!isSidebarOpen && !isDetailsOpen}
        />
      )}
    </>
  );
};

export default FeasibilityWorkspaceOverlay;
