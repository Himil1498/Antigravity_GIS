import React, { useState, useEffect, useMemo } from 'react';
import {
  X, MapPin, Table, ArrowRight, Info, Mountain, Activity, Edit2, Check,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Trash2, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { locationMarkerService, type MarkedLocation } from '../../../../services/gisTools/locationMarkerService';
import { toast } from 'react-toastify';
import { SurveyUploadModal } from './SurveyUploadModal';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';

interface ElevationStudy {
  customerCoords: { lat: number; lng: number };
  btsCoords: { lat: number; lng: number };
  customerName: string;
  btsName: string;
}

interface FeasibilityStudyPanelProps {
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  selectedMarker: MarkedLocation;
  setSelectedMarker: (m: MarkedLocation | null) => void;
  setActiveElevationStudy: (study: ElevationStudy | null) => void;
  handleProcessExcel: (marker: MarkedLocation) => void;
  can: (permission: string) => boolean;
  onUpdateMarker?: (m: MarkedLocation) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  map?: google.maps.Map | null;
}

const FeasibilityStudyPanel: React.FC<FeasibilityStudyPanelProps> = ({
  isDetailsOpen, setIsDetailsOpen, selectedMarker, setSelectedMarker,
  setActiveElevationStudy, handleProcessExcel, can, onUpdateMarker,
  isSidebarOpen, setIsSidebarOpen, map
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [selectedCandidateKeys, setSelectedCandidateKeys] = useState<Set<string>>(new Set());
  const [candidateToDelete, setCandidateToDelete] = useState<any>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidatePage, setCandidatePage] = useState(1);
  const CANDIDATES_PER_PAGE = 50;

  const filteredPoints = useMemo(() => {
    const points = selectedMarker.feasibility_data?.points || [];
    if (!candidateSearch.trim()) return points;
    const term = candidateSearch.toLowerCase();
    return points.filter((p: any) => 
      String(p.name || '').toLowerCase().includes(term) ||
      String(p.lat || '').includes(term) ||
      String(p.lng || '').includes(term)
    );
  }, [selectedMarker.feasibility_data?.points, candidateSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPoints.length / CANDIDATES_PER_PAGE));
  const paginatedPoints = useMemo(() => {
    const start = (candidatePage - 1) * CANDIDATES_PER_PAGE;
    return filteredPoints.slice(start, start + CANDIDATES_PER_PAGE);
  }, [filteredPoints, candidatePage]);

  // Auto-collapse left sidebar when details panel is expanded
  useEffect(() => {
    if (isDetailsOpen && isExpanded) {
      setIsSidebarOpen(false);
    } else if (isDetailsOpen && !isExpanded) {
      setIsSidebarOpen(true);
    }
  }, [isExpanded, isDetailsOpen, setIsSidebarOpen]);

  // Broadcast expanded state for MapToolbar layout logic
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('feasibilityStudyDetailsExpanded', {
        detail: { isExpanded: isDetailsOpen && isExpanded }
      })
    );
  }, [isDetailsOpen, isExpanded]);

  // Adjust map centering dynamically when panel is expanded
  useEffect(() => {
    if (!map || !selectedMarker) return;
    
    // Pan to marker
    map.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lng });
    
    // If expanded, offset the center slightly to the right so the marker stays on the left screen area
    if (isExpanded) {
      setTimeout(() => {
        const zoom = map.getZoom() || 14;
        const offset = 0.006 / Math.pow(2, zoom - 13);
        map.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lng + offset });
      }, 300);
    }
  }, [isExpanded, selectedMarker, map]);

  // Sync state with selectedMarker changes
  useEffect(() => {
    setEditName(selectedMarker.name);
    setEditRemarks(selectedMarker.remarks || selectedMarker.notes || '');
    setIsEditing(false);
    setCandidateSearch('');
    setCandidatePage(1);
    setSelectedCandidateKeys(new Set());
  }, [selectedMarker]);

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error('Site name is required');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await locationMarkerService.updateMarker(selectedMarker.id, {
        name: editName,
        remarks: editRemarks
      });
      if (onUpdateMarker) {
        onUpdateMarker({
          ...selectedMarker,
          name: updated.name,
          remarks: updated.remarks || updated.notes || undefined
        });
      }
      setIsEditing(false);
      toast.success('Study details updated successfully');
    } catch (err) {
      toast.error('Failed to update study details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!selectedMarker.feasibility_data?.points || !candidateToDelete) return;

    const remainingPoints = selectedMarker.feasibility_data.points.filter((p: any) => 
      !(String(p.name) === String(candidateToDelete.name) && 
        Number(p.lat) === Number(candidateToDelete.lat) && 
        Number(p.lng) === Number(candidateToDelete.lng))
    );

    const updatedFeasibility = {
      ...selectedMarker.feasibility_data,
      points: remainingPoints
    };

    try {
      setIsSaving(true);
      const updated = await locationMarkerService.updateFeasibility(
        selectedMarker.id,
        updatedFeasibility,
        selectedMarker.linked_file_id || undefined
      );

      if (onUpdateMarker) {
        onUpdateMarker(updated);
      }
      
      const pKey = `${candidateToDelete.name}-${candidateToDelete.lat}-${candidateToDelete.lng}`;
      const nextKeys = new Set(selectedCandidateKeys);
      nextKeys.delete(pKey);
      setSelectedCandidateKeys(nextKeys);

      toast.success('Candidate deleted successfully');
    } catch (err) {
      toast.error('Failed to delete candidate');
    } finally {
      setIsSaving(false);
      setCandidateToDelete(null);
    }
  };

  const handleBulkDeleteCandidates = async () => {
    if (!selectedMarker.feasibility_data?.points || selectedCandidateKeys.size === 0) return;

    const remainingPoints = selectedMarker.feasibility_data.points.filter((p: any) => {
      const pKey = `${p.name}-${p.lat}-${p.lng}`;
      return !selectedCandidateKeys.has(pKey);
    });

    const updatedFeasibility = {
      ...selectedMarker.feasibility_data,
      points: remainingPoints
    };

    try {
      setIsSaving(true);
      const updated = await locationMarkerService.updateFeasibility(
        selectedMarker.id,
        updatedFeasibility,
        selectedMarker.linked_file_id || undefined
      );

      if (onUpdateMarker) {
        onUpdateMarker(updated);
      }

      setSelectedCandidateKeys(new Set()); // Reset selections
      toast.success('Selected candidates deleted successfully');
    } catch (err) {
      toast.error('Failed to delete selected candidates');
    } finally {
      setIsSaving(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  return (
    <>
      {/* Open-state side toggle button centered vertically */}
      <button
        onClick={() => setIsDetailsOpen(false)}
        className={`fixed top-1/2 -translate-y-1/2 z-[41] w-5 h-16 bg-white/95 dark:bg-slate-900/95 border border-r-0 border-gray-200/50 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-l-[12px] flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300 ease-in-out cursor-pointer ${
          isDetailsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ right: isDetailsOpen ? (isExpanded ? '520px' : '300px') : '-30px' }}
        title="Hide Details"
      >
        <ChevronRight className="w-3.5 h-3.5 text-indigo-500 font-bold" />
      </button>

      {/* Catalog-style Restore Pull-Tab Button when Sidebar is Collapsed - Positioned at top-52 to avoid conflict */}
      {!isDetailsOpen && (
        <>
          <style>{`
            @keyframes bounceHorizontalLeftDetails {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-4px); }
            }
            .animate-bounce-left-details {
              animation: bounceHorizontalLeftDetails 1s infinite;
            }
          `}</style>
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="fixed top-52 right-0 z-[41] w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-l-lg border-y border-l border-emerald-400/30 bg-emerald-600/85 dark:bg-emerald-700/85 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] backdrop-blur-xl hover:bg-emerald-500/95 dark:hover:bg-emerald-600/95 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
            title="Restore Survey Details"
          >
            <ChevronLeft size={11} strokeWidth={3} className="text-white animate-bounce-left-details" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] mb-1">
              Details
            </span>
          </button>
        </>
      )}

      {/* Panel Container */}
      <div
        className="fixed top-16 right-0 z-[40] flex pointer-events-none transition-all duration-300"
        style={{ bottom: 'var(--elevation-drawer-height, 0px)' }}
      >
        <motion.div
          id="feasibility-study-panel"
          initial={false}
          animate={{ 
            width: isExpanded ? 520 : 300, 
            opacity: 1,
            x: isDetailsOpen ? 0 : '110%' 
          }}
          className="pointer-events-auto bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-l border-gray-200/50 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden will-change-transform h-full rounded-bl-3xl"
        >
          {/* Subtle top glare effect for 3D depth */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

          <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ width: isExpanded ? '520px' : '300px' }}>
            {/* Header */}
            <div className="py-2.5 px-4 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/10 dark:bg-black/10 flex-shrink-0">
              <div className="flex items-center gap-3 pl-1 min-w-0 flex-1">
                <div className="relative flex items-center justify-center w-[34px] h-[34px] rounded-[10px] bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.4)] border border-emerald-400/30 flex-shrink-0">
                  <Activity className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
                
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-[13px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 px-2.5 py-1 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                      placeholder="Site name"
                      disabled={isSaving}
                    />
                  ) : (
                    <>
                      <span className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-0.5 truncate" title={selectedMarker.name}>
                        {selectedMarker.name}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-none tracking-wide">
                        Survey Details
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={isSaving}
                      className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/40 text-green-600 dark:text-green-400 rounded-lg transition-colors flex items-center justify-center"
                      title="Save Changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setEditName(selectedMarker.name); setEditRemarks(selectedMarker.remarks || ''); }} 
                      disabled={isSaving}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 rounded-lg transition-colors flex items-center justify-center"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsExpanded(prev => !prev)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 rounded-lg transition-colors flex items-center justify-center"
                      title={isExpanded ? "Collapse View" : "Expand to Table View"}
                    >
                      {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>

                    {can('network:feasibility:edit') && (
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 rounded-lg transition-colors flex items-center justify-center"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedMarker(null)} 
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group flex items-center justify-center"
                      title="Close Panel"
                    >
                      <X className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {!isExpanded ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto py-3 px-4 space-y-3.5">
                  {/* Coordinates */}
                  <div className="bg-gray-50/50 dark:bg-black/10 py-2.5 px-3 rounded-xl border border-gray-100 dark:border-white/5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Coordinates</label>
                    <p className="text-xs font-mono mt-1 text-gray-600 dark:text-gray-400">
                      {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Remarks & Notes</label>
                    {isEditing ? (
                      <textarea
                        value={editRemarks}
                        onChange={(e) => setEditRemarks(e.target.value)}
                        rows={2}
                        className="w-full text-[12.5px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-300 leading-relaxed"
                        placeholder="Optional survey comments..."
                        disabled={isSaving}
                      />
                    ) : (
                      <div className="py-2 px-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-white/5 text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        {selectedMarker.remarks || selectedMarker.notes ? `"${selectedMarker.remarks || selectedMarker.notes}"` : 'No remarks added.'}
                      </div>
                    )}
                  </div>

                  {/* Feasibility Data */}
                  {selectedMarker.feasibility_data ? (
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      <div className="py-2.5 px-3 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex-shrink-0">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <Table className="w-4 h-4" />
                          Survey Data Attached
                        </div>
                        <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                          Analyzed <span className="font-bold text-gray-800 dark:text-white">{selectedMarker.feasibility_data.points?.length || 0}</span> candidate connections for Line of Sight.
                        </p>
                      </div>

                      {/* Candidate List */}
                      <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex-shrink-0">Candidate Connections</label>
                        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                          {selectedMarker.feasibility_data.points?.slice(0, 5).map((p: Record<string, unknown>, i: number) => {
                            const isLOSFeasible = !!p.feasible;
                            return (
                              <div 
                                key={i} 
                                className="flex flex-col py-2 px-3 rounded-xl bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-white/5 space-y-2 hover:border-indigo-500/30 transition-all"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="truncate font-bold text-gray-900 dark:text-white text-[12px] max-w-[160px]">{String(p.name)}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wide uppercase ${
                                    isLOSFeasible 
                                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                                  }`}>
                                    {isLOSFeasible ? 'LOS OK' : 'LOS Blocked'}
                                  </span>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const btsLat = Number(p.lat);
                                    const btsLng = Number(p.lng);
                                    if (!isNaN(btsLat) && !isNaN(btsLng)) {
                                      setActiveElevationStudy({
                                        customerCoords: { lat: selectedMarker.lat, lng: selectedMarker.lng },
                                        btsCoords: { lat: btsLat, lng: btsLng },
                                        customerName: selectedMarker.name,
                                        btsName: String(p.name),
                                      });
                                    } else {
                                      toast.error('Invalid coordinates for this candidate');
                                    }
                                  }}
                                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-white/10 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm rounded-xl transition-all w-full font-bold text-[11px]"
                                  title="View Elevation Profile & LOS"
                                >
                                  <Mountain className="w-3.5 h-3.5" />
                                  View Elevation Profile
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl text-center space-y-2">
                      <Info className="w-5 h-5 text-amber-500 mx-auto" />
                      <p className="text-[12px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                        No feasibility study linked yet. Add excel/kml survey to evaluate candidate links.
                      </p>
                    </div>
                  )}

                  {/* Footer Action inside Collapsed View */}
                  <div className="pt-2 border-t border-gray-200/50 dark:border-white/10 space-y-2 mt-auto flex-shrink-0">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      disabled={!can('network:feasibility:edit')}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-[12px] ${
                        can('network:feasibility:edit')
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      <span>{selectedMarker.feasibility_data ? 'Update Survey File' : 'Process New Survey File'}</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                    {!can('network:feasibility:edit') && (
                      <p className="text-[9.5px] text-center text-gray-400 font-medium leading-none">
                        Contact administrator for feasibility upload privileges.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex h-full min-h-0 overflow-hidden divide-x divide-gray-200/50 dark:divide-white/10 animate-fade-in">
                  {/* Left Pane (General Info) */}
                  <div className="w-[180px] flex-shrink-0 flex flex-col min-h-0 overflow-y-auto p-4 space-y-4">
                    {/* Coordinates */}
                    <div className="bg-gray-50/50 dark:bg-black/10 py-2.5 px-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Coordinates</label>
                      <p className="text-xs font-mono mt-1 text-gray-600 dark:text-gray-400">
                        {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}
                      </p>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Remarks & Notes</label>
                      {isEditing ? (
                        <textarea
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          rows={3}
                          className="w-full text-[12.5px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-300 leading-relaxed"
                          placeholder="Optional survey comments..."
                          disabled={isSaving}
                        />
                      ) : (
                        <div className="py-2.5 px-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-white/5 text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                          {selectedMarker.remarks || selectedMarker.notes ? `"${selectedMarker.remarks || selectedMarker.notes}"` : 'No remarks added.'}
                        </div>
                      )}
                    </div>

                    {/* Survey Meta summary */}
                    {selectedMarker.feasibility_data && (
                      <div className="py-2.5 px-3 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <Table className="w-4 h-4" />
                          Survey Connected
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                          Dataset contains <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMarker.feasibility_data.points?.length || 0}</span> scan locations.
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-200/50 dark:border-white/10 space-y-2 mt-auto">
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={!can('network:feasibility:edit')}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-[12px] ${
                          can('network:feasibility:edit')
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Table className="w-4 h-4" />
                        <span>{selectedMarker.feasibility_data ? 'Update Survey' : 'Upload Survey'}</span>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Right Pane (Candidate Connections Grid) */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50/20 dark:bg-black/5">
                    {selectedMarker.feasibility_data ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Header bar of candidate table */}
                        <div className="p-3 bg-gray-50/40 dark:bg-slate-900/40 border-b border-gray-200/50 dark:border-white/10 flex flex-col gap-2 flex-shrink-0">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Candidate Connections ({filteredPoints.length})</span>
                            {selectedCandidateKeys.size > 0 && can('network:feasibility:edit') && (
                              <button
                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                className="flex items-center gap-1 py-0.5 px-2 bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded border border-rose-500/20 transition-all font-bold text-[10px] cursor-pointer"
                                title="Bulk Delete Candidates"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Selected ({selectedCandidateKeys.size})</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              className="w-full pl-3 pr-3 py-1 text-[11px] bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                              placeholder="Filter candidates..."
                              value={candidateSearch}
                              onChange={(e) => {
                                setCandidateSearch(e.target.value);
                                setCandidatePage(1);
                              }}
                            />
                          </div>
                        </div>

                        {/* Scrollable Table Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200/50 dark:border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-wider z-10">
                                {can('network:feasibility:edit') && (
                                  <th className="py-2.5 px-3 w-8">
                                    <input
                                      type="checkbox"
                                      checked={
                                        paginatedPoints.length > 0 &&
                                        paginatedPoints.every((p: any) =>
                                          selectedCandidateKeys.has(`${p.name}-${p.lat}-${p.lng}`)
                                        )
                                      }
                                      onChange={(e) => {
                                        const nextKeys = new Set(selectedCandidateKeys);
                                        paginatedPoints.forEach((p: any) => {
                                          const pKey = `${p.name}-${p.lat}-${p.lng}`;
                                          if (e.target.checked) {
                                            nextKeys.add(pKey);
                                          } else {
                                            nextKeys.delete(pKey);
                                          }
                                        });
                                        setSelectedCandidateKeys(nextKeys);
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                  </th>
                                )}
                                <th className="py-2.5 px-3">Site / Target</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                              {paginatedPoints.map((p: any, i: number) => {
                                const isLOSFeasible = !!p.feasible;
                                const pKey = `${p.name}-${p.lat}-${p.lng}`;
                                const isSelected = selectedCandidateKeys.has(pKey);
                                return (
                                  <tr key={i} className={`hover:bg-slate-500/5 transition-colors group ${isSelected ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''}`}>
                                    {can('network:feasibility:edit') && (
                                      <td className="py-2 px-3 w-8">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const nextKeys = new Set(selectedCandidateKeys);
                                            if (e.target.checked) {
                                              nextKeys.add(pKey);
                                            } else {
                                              nextKeys.delete(pKey);
                                            }
                                            setSelectedCandidateKeys(nextKeys);
                                          }}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                      </td>
                                    )}
                                    {/* Name & Coordinates */}
                                    <td className="py-2 px-3 max-w-[150px]">
                                      <div className="font-bold text-[11.5px] text-gray-800 dark:text-white break-words leading-tight" title={String(p.name)}>
                                        {String(p.name)}
                                      </div>
                                      <div className="text-[9.5px] text-gray-400 font-mono mt-0.5">
                                        {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
                                      </div>
                                    </td>
                                    {/* Status Badges */}
                                    <td className="py-2 px-3">
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                                        isLOSFeasible 
                                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                                      }`}>
                                        {isLOSFeasible ? 'LOS OK' : 'LOS Blocked'}
                                      </span>
                                    </td>
                                    {/* Actions */}
                                    <td className="py-2 px-3 text-right">
                                      <div className="inline-flex items-center gap-1.5 justify-end">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const btsLat = Number(p.lat);
                                            const btsLng = Number(p.lng);
                                            if (!isNaN(btsLat) && !isNaN(btsLng)) {
                                              setActiveElevationStudy({
                                                customerCoords: { lat: selectedMarker.lat, lng: selectedMarker.lng },
                                                btsCoords: { lat: btsLat, lng: btsLng },
                                                customerName: selectedMarker.name,
                                                btsName: String(p.name),
                                              });
                                            } else {
                                              toast.error('Invalid coordinates for this candidate');
                                            }
                                          }}
                                          className="inline-flex items-center gap-1.5 py-1 px-2 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm rounded-lg transition-all font-bold text-[10px]"
                                          title="View Elevation Profile & LOS"
                                        >
                                          <Mountain className="w-3.5 h-3.5" />
                                          <span>Profile</span>
                                        </button>
                                        {can('network:feasibility:edit') && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCandidateToDelete(p);
                                            }}
                                            className="inline-flex items-center justify-center p-1 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-500 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                                            title="Delete Candidate"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="px-3 py-2 border-t border-gray-200/50 dark:border-white/10 flex items-center justify-between bg-white dark:bg-slate-900 flex-shrink-0">
                            <button
                              onClick={() => setCandidatePage(p => Math.max(1, p - 1))}
                              disabled={candidatePage === 1}
                              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              Page {candidatePage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCandidatePage(p => Math.min(totalPages, p + 1))}
                              disabled={candidatePage === totalPages}
                              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                        <Info className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-[12.5px] font-semibold text-gray-500 dark:text-gray-400">No data connected</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-[200px] mt-1">Upload an Excel/KML file to scan paths.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <SurveyUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        marker={selectedMarker}
        onSuccess={async () => {
          if (onUpdateMarker) {
            try {
              const updatedMarkers = await locationMarkerService.getMarkers(true);
              const updated = updatedMarkers.find(m => m.id === selectedMarker.id);
              if (updated) {
                onUpdateMarker(updated);
              }
            } catch (err) {
              console.error('Failed to fetch updated marker', err);
            }
          }
        }}
      />

      {/* Delete Candidate Confirmation Modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="p-5">
              <div className="flex items-center gap-3 text-rose-500 mb-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">Confirm Delete Candidate</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                Are you sure you want to delete the candidate <strong className="text-gray-900 dark:text-white font-bold">{candidateToDelete.name}</strong>? This action will remove it from the feasibility study dataset.
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCandidateToDelete(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleDeleteCandidate();
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Candidates Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="p-5">
              <div className="flex items-center gap-3 text-rose-500 mb-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">Confirm Bulk Delete</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white font-bold">{selectedCandidateKeys.size}</strong> selected candidates? This will permanently remove them from the feasibility study dataset.
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleBulkDeleteCandidates();
                    setIsBulkDeleteModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeasibilityStudyPanel;
