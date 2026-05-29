/**
 * FeasibilitySurveysSidebar
 * Left sidebar for the Feasibility Workspace — displays the list of site surveys,
 * search, visibility toggles, and the "Add New Study" button.
 */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Users, Plus, X, Eye, EyeOff, Activity, Search,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MapPin, Trash2, Clock, Mountain, Upload, AlertTriangle, Target,
  Maximize2, Minimize2
} from 'lucide-react';
import { locationMarkerService, type MarkedLocation } from '../../../../services/gisTools/locationMarkerService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import MultiSelectDropdown from '../../../../features/network-planning/components/Shared/MultiSelectDropdown';

interface FeasibilitySurveysSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  markers: MarkedLocation[];
  filteredMarkers: MarkedLocation[];
  selectedMarker: MarkedLocation | null;
  setSelectedMarker: (m: MarkedLocation | null) => void;
  setIsDetailsOpen: (open: boolean) => void;
  visibleMarkerIds: Set<number>;
  toggleVisibility: (id: number) => void;
  toggleAllVisibility: () => void;
  showConnections: boolean;
  setShowConnections: (v: boolean) => void;
  isAddMode: boolean;
  setIsAddMode: (v: boolean) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setDeleteConfirmId: (id: number | null) => void;
  map: google.maps.Map | null;
  can: (permission: string) => boolean;
  onClose: () => void;
  fetchMarkers?: () => Promise<void>;
  selectedRegionIds: number[];
  regionOptions: any[];
  onRegionChange: (ids: number[]) => void;
}

const FeasibilitySurveysSidebar: React.FC<FeasibilitySurveysSidebarProps> = ({
  isSidebarOpen, setIsSidebarOpen, markers, filteredMarkers, selectedMarker,
  setSelectedMarker, setIsDetailsOpen, visibleMarkerIds, toggleVisibility,
  toggleAllVisibility, showConnections, setShowConnections, isAddMode,
  setIsAddMode, isLoading, searchQuery, setSearchQuery, setDeleteConfirmId,
  map, can, onClose, fetchMarkers, selectedRegionIds, regionOptions, onRegionChange
}) => {
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('feasibilitySurveysSidebarExpanded', {
        detail: { isExpanded: isSidebarOpen && isExpanded }
      })
    );
  }, [isExpanded, isSidebarOpen]);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const handleLocateChecked = () => {
    if (!map || visibleMarkerIds.size === 0) return;
    const bounds = new google.maps.LatLngBounds();
    let hasCoords = false;
    markers.forEach(m => {
      if (visibleMarkerIds.has(m.id)) {
        bounds.extend({ lat: m.lat, lng: m.lng });
        hasCoords = true;
      }
    });
    if (hasCoords) {
      map.fitBounds(bounds);
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom()! > 16) {
          map.setZoom(16);
        }
      });
      setTimeout(() => google.maps.event.removeListener(listener), 2000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    setIsUploading(true);
    toast.info('Processing file...', { autoClose: 1500 });
    
    try {
      const markersToCreate: { name: string, lat: number, lng: number, notes?: string, feasibility_data?: any }[] = [];

      if (fileExt === 'xlsx' || fileExt === 'csv') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        jsonData.forEach((row: any) => {
          const keys = Object.keys(row);
          const latKey = keys.find(k => ['lat', 'latitude'].includes(k.toLowerCase()));
          const lngKey = keys.find(k => ['lng', 'longitude', 'long'].includes(k.toLowerCase()));
          const nameKey = keys.find(k => ['name', 'site'].includes(k.toLowerCase()));
          
          const lat = latKey ? parseFloat(row[latKey]) : NaN;
          const lng = lngKey ? parseFloat(row[lngKey]) : NaN;
          const name = nameKey ? String(row[nameKey]) : `Site ${markersToCreate.length + 1}`;
          
          const attributes: Record<string, any> = {};
          keys.forEach(k => {
            if (k !== latKey && k !== lngKey && k !== nameKey) {
              attributes[k] = row[k];
            }
          });

          const notesKey = keys.find(k => ['notes', 'remarks'].includes(k.toLowerCase()));
          const notes = notesKey ? String(row[notesKey]) : undefined;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            markersToCreate.push({ name, lat, lng, notes, feasibility_data: { attributes } });
          }
        });
      } else if (fileExt === 'kml') {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        const placemarks = xmlDoc.getElementsByTagName('Placemark');
        for (let i = 0; i < placemarks.length; i++) {
          const placemark = placemarks[i];
          const name = placemark.getElementsByTagName('name')[0]?.textContent || `Site ${markersToCreate.length + 1}`;
          const coordsText = placemark.getElementsByTagName('coordinates')[0]?.textContent;
          const description = placemark.getElementsByTagName('description')[0]?.textContent;
          
          const attributes: Record<string, string> = {};
          const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
          if (extendedData) {
            const dataElements = extendedData.getElementsByTagName('Data');
            for (let j = 0; j < dataElements.length; j++) {
               const attrName = dataElements[j].getAttribute('name');
               const value = dataElements[j].getElementsByTagName('value')[0]?.textContent;
               if (attrName && value) attributes[attrName] = value;
            }
          }

          if (coordsText) {
            const [lngStr, latStr] = coordsText.trim().split(',');
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            if (!isNaN(lat) && !isNaN(lng)) {
              markersToCreate.push({ name, lat, lng, notes: description || undefined, feasibility_data: { attributes } });
            }
          }
        }
      } else {
        toast.error('Unsupported file type. Please use .xlsx, .csv, or .kml');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (markersToCreate.length === 0) {
        toast.warning('No valid coordinates found in file');
      } else {
        // Bulk creation
        try {
          const createdMarkers = await locationMarkerService.saveBulkMarkers(markersToCreate.map(m => ({
            name: m.name,
            lat: m.lat,
            lng: m.lng,
            is_feasibility: true,
            notes: m.notes,
            feasibility_data: m.feasibility_data
          })));
          
          toast.success(`Successfully added ${createdMarkers.length} locations`);
          if (fetchMarkers) {
            await fetchMarkers();
          }
        } catch (e) {
          console.error('Failed to save bulk markers', e);
          toast.error('Failed to create markers on the server.');
        }
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      toast.error('Failed to parse file content');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleBulkDelete = async () => {
    const isAllVisible = filteredMarkers.every(m => visibleMarkerIds.has(m.id));
    const idsToDelete = isAllVisible 
      ? filteredMarkers.map(m => m.id)
      : filteredMarkers.filter(m => visibleMarkerIds.has(m.id)).map(m => m.id);

    if (idsToDelete.length === 0) return;
    
    try {
      await locationMarkerService.deleteBulkMarkers(idsToDelete);
      toast.success(`Deleted ${idsToDelete.length} locations`);
      if (fetchMarkers) {
        await fetchMarkers();
      }
    } catch (err) {
      toast.error('Failed to bulk delete locations.');
    } finally {
      setIsBulkDeleteModalOpen(false);
    }
  };

  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMarkers.length / ITEMS_PER_PAGE));
  const paginatedMarkers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMarkers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMarkers, currentPage]);
  const someHidden = useMemo(() => {
    return filteredMarkers.some(m => !visibleMarkerIds.has(m.id));
  }, [filteredMarkers, visibleMarkerIds]);


  const groupedMarkers = useMemo(() => {
    const groups: Record<string, { displayDate: string; items: MarkedLocation[] }> = {};
    paginatedMarkers.forEach(m => {
      const date = new Date(m.created_at);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const groupKey = `${yyyy}-${mm}-${dd}`;
      const displayDate = `${dd}/${mm}/${yyyy}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = { displayDate, items: [] };
      }
      groups[groupKey].items.push(m);
    });
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, val]) => ({ key, displayDate: val.displayDate, items: val.items }));
  }, [paginatedMarkers]);

  // (Auto-collapse logic removed as per user request to keep data expanded by default)

  const toggleDate = (dateStr: string) => {
    setCollapsedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  };

  const allVisible = filteredMarkers.length > 0 && filteredMarkers.every(m => visibleMarkerIds.has(m.id));
  const noneVisible = filteredMarkers.length > 0 && filteredMarkers.every(m => !visibleMarkerIds.has(m.id));

  return (
    <>
      {/* Sidebar Container */}
      <div
        id="feasibility-surveys-sidebar"
        className="fixed top-16 left-0 z-[40] transition-all duration-300 pointer-events-auto"
        style={{ 
          width: isExpanded ? '550px' : '300px',
          transform: !isSidebarOpen ? 'translateX(-110%)' : 'none',
          bottom: 'var(--elevation-drawer-height, 0px)' 
        }}
      >
        <div
          className="h-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden rounded-br-3xl"
          style={{ width: isExpanded ? '550px' : '300px' }}
        >
          {/* Subtle top glare effect for 3D depth */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />
          {/* Header & Controls */}
          <div className="p-4 border-b border-gray-200/50 dark:border-white/10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-[34px] h-[34px] rounded-[10px] bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.4)] border border-blue-400/30 flex-shrink-0">
                  <Users className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-0.5">
                    Site Surveys
                  </span>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-none tracking-wide">
                    Feasibility Workspace
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-[10px] border border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:shadow-sm'}`}
                  title={isExpanded ? "Collapse List" : "Expand to Grid View"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all"
                  title="Close Workspace"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] flex-nowrap overflow-x-auto no-scrollbar w-full">
              <div className="px-2 py-1 flex items-center justify-center border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
                <input 
                  type="checkbox"
                  checked={filteredMarkers.length > 0 && filteredMarkers.every(m => visibleMarkerIds.has(m.id))}
                  onChange={toggleAllVisibility}
                  className="w-3.5 h-3.5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                  title="Toggle Visibility of All on Page"
                />
              </div>

              <button 
                onClick={handleLocateChecked} 
                disabled={visibleMarkerIds.size === 0}
                className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                  visibleMarkerIds.size > 0 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`} 
                title="Locate Selected Sites"
              >
                <Target size={16} />
                {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">Locate</span>}
              </button>

              <button 
                onClick={toggleAllVisibility} 
                className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                  someHidden
                    ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400 hover:bg-rose-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 hover:text-rose-500 dark:hover:text-rose-400'
                }`}
                title={someHidden ? "Show All Data on Map" : "Hide All Data from Map"}
              >
                {someHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">{someHidden ? "Show" : "Hide"}</span>}
              </button>

              <button 
                onClick={() => setShowConnections(!showConnections)} 
                className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                  showConnections 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`} 
                title="Toggle Connections"
              >
                <Activity size={16} />
                {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">Links</span>}
              </button>

              {can('network:feasibility:markers') && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                      isUploading 
                        ? 'bg-teal-500/10 text-teal-600 animate-pulse' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                    }`}
                    title="Bulk Upload Sites (Excel/CSV/KML)"
                  >
                    <Upload size={16} />
                    {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">Upload</span>}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".xlsx,.csv,.kml" 
                    className="hidden" 
                  />

                  <button 
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    disabled={filteredMarkers.length === 0 || visibleMarkerIds.size === 0}
                    className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                      (filteredMarkers.length > 0 && visibleMarkerIds.size > 0)
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' 
                        : 'text-slate-300 dark:text-slate-750 cursor-not-allowed'
                    }`}
                    title="Delete Visible Locations"
                  >
                    <Trash2 size={16} />
                    {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">Delete</span>}
                  </button>

                  <button 
                    onClick={() => setIsAddMode(!isAddMode)} 
                    className={`h-8 ${isExpanded ? 'px-3 w-auto' : 'w-8'} rounded-lg flex justify-center items-center gap-2 transition-all duration-300 flex-shrink-0 ${
                      isAddMode 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                        : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    }`}
                    title={isAddMode ? "Cancel Add Mode" : "Add Survey manually"}
                  >
                    {isAddMode ? <X size={16} /> : <Plus size={16} />}
                    {isExpanded && <span className="text-xs font-semibold whitespace-nowrap">{isAddMode ? "Cancel" : "Add"}</span>}
                  </button>
                </>
              )}
            </div>

            {/* Search & Region Filter */}
            <div className="space-y-2 mt-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" />
                <input 
                  className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Search surveys..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <MultiSelectDropdown
                  options={regionOptions}
                  selectedIds={selectedRegionIds}
                  onChange={onRegionChange}
                  placeholder="All States & UTs"
                  compact={true}
                  alignLeft={true}
                  showClearButton={false}
                />
              </div>
            </div>
          </div>

          {/* Scrollable List or Grid Table */}
          <div className="flex-1 min-h-0 relative flex flex-col overflow-y-auto">
            {!isExpanded && (
              <div className="sticky top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/95 dark:from-slate-900/95 to-transparent z-10 pointer-events-none shrink-0" />
            )}

            <div className="flex-1 min-h-0 flex flex-col">
              {isLoading ? (
                <div className="p-3 space-y-1.5 flex-1">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800/50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : isExpanded ? (
                paginatedMarkers.length > 0 ? (
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200/50 dark:border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-wider z-10">
                            <th className="py-2.5 px-3 w-10 text-center">View</th>
                            <th className="py-2.5 px-3 text-center">Site / Target</th>
                            <th className="py-2.5 px-3 text-center">Coordinates</th>
                            <th className="py-2.5 px-3 text-center">Date</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {paginatedMarkers.map(m => {
                            const isSelected = selectedMarker?.id === m.id;
                            const isVisible = visibleMarkerIds.has(m.id);
                            const dateStr = m.created_at
                              ? new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'N/A';
                            return (
                              <tr
                                key={m.id}
                                className={`hover:bg-slate-500/5 transition-colors group cursor-pointer ${
                                  isSelected ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                                }`}
                                onClick={() => {
                                  setSelectedMarker(m);
                                  setIsDetailsOpen(true);
                                  if (!visibleMarkerIds.has(m.id)) {
                                    toggleVisibility(m.id);
                                  }
                                  if (map) {
                                    map.panTo({ lat: m.lat, lng: m.lng });
                                    map.setZoom(Math.max(map.getZoom() || 10, 14));
                                  }
                                }}
                              >
                                {/* View Toggle Checkbox */}
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={() => toggleVisibility(m.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                </td>
                                {/* Site Name */}
                                <td className="py-2 px-3 text-left font-bold text-[11.5px] text-gray-800 dark:text-white leading-tight break-words max-w-[220px]" title={m.name}>
                                  {m.name}
                                </td>
                                {/* Coordinates */}
                                <td className="py-2 px-3 text-center text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                  {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
                                </td>
                                {/* Date */}
                                <td className="py-2 px-3 text-center text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                                  {dateStr}
                                </td>
                                {/* Actions */}
                                <td className="py-2 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMarker(m);
                                          setIsDetailsOpen(true);
                                          if (!visibleMarkerIds.has(m.id)) {
                                            toggleVisibility(m.id);
                                          }
                                          if (map) {
                                            map.panTo({ lat: m.lat, lng: m.lng });
                                            map.setZoom(Math.max(map.getZoom() || 10, 14));
                                          }
                                          setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('triggerGisInfoWindow', { detail: { markerId: m.id } }));
                                          }, 100);
                                        }}
                                        className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-indigo-500 hover:text-indigo-600 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye size={13} />
                                      </button>
                                    {can('network:feasibility:markers') && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirmId(m.id);
                                        }}
                                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={13} />
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
                  ) : (
                    <div className="flex flex-col items-center py-16 text-gray-400 flex-1 justify-center">
                      <Mountain className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No studies found</p>
                    </div>
                  )
                ) : (
                  <div className="p-3 space-y-1.5">
                    {groupedMarkers.length > 0 ? (
                      groupedMarkers.map(({ key, displayDate, items }) => (
                        <div key={key} className="space-y-1 pt-1.5 first:pt-0">
                          <div className="flex items-center gap-2 pt-0 pb-1 px-1">
                            <button 
                              onClick={() => toggleDate(key)} 
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-all flex-shrink-0"
                            >
                              <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                              <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">{displayDate}</span>
                              <span className="text-[9px] bg-indigo-200 dark:bg-indigo-500/40 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>
                              {collapsedDates.has(key) ? <ChevronDown className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> : <ChevronUp className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />}
                            </button>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-200 dark:from-indigo-900/60 to-transparent rounded-full" />
                          </div>

                          {!collapsedDates.has(key) && items.map(m => {
                            const isSelected = selectedMarker?.id === m.id;
                            const isVisible = visibleMarkerIds.has(m.id);
                            return (
                              <div 
                                key={m.id}
                                className={`group flex items-center gap-2 py-1.5 px-2 rounded-xl cursor-pointer transition-all border ${
                                  !isVisible ? 'opacity-50 hover:opacity-80' : ''
                                } ${
                                  isSelected
                                    ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-800/80 shadow-[0_2px_8px_rgba(99,102,241,0.05)]'
                                    : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10'
                                }`}
                                onClick={() => {
                                  setSelectedMarker(m);
                                  setIsDetailsOpen(true);
                                  if (!visibleMarkerIds.has(m.id)) {
                                    toggleVisibility(m.id);
                                  }
                                  if (map) { 
                                    map.panTo({ lat: m.lat, lng: m.lng }); 
                                    map.setZoom(Math.max(map.getZoom() || 10, 14)); 
                                  }
                                }}
                              >
                                {/* Checkbox Container */}
                                <div 
                                  className="flex items-center justify-center p-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={visibleMarkerIds.has(m.id)}
                                    onChange={() => toggleVisibility(m.id)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className={`relative flex items-center justify-center w-[28px] h-[28px] rounded-[6px] flex-shrink-0 transition-all ${
                                  isSelected 
                                    ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_2px_6px_rgba(99,102,241,0.2)] text-white' 
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                                }`}>
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-[12.5px] font-bold text-gray-900 dark:text-white truncate">{m.name}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-tight mt-0.5">{m.lat.toFixed(6)}, {m.lng.toFixed(6)}</p>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMarker(m);
                                      setIsDetailsOpen(true);
                                      if (!visibleMarkerIds.has(m.id)) {
                                        toggleVisibility(m.id);
                                      }
                                      if (map) {
                                        map.panTo({ lat: m.lat, lng: m.lng });
                                        map.setZoom(Math.max(map.getZoom() || 10, 14));
                                      }
                                      setTimeout(() => {
                                        window.dispatchEvent(new CustomEvent('triggerGisInfoWindow', { detail: { markerId: m.id } }));
                                      }, 100);
                                    }}
                                    className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  {can('network:feasibility:markers') && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(m.id); }} 
                                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" 
                                      title="Delete"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center py-16 text-gray-400">
                        <Mountain className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No studies found</p>
                        {searchQuery && (
                          <p className="text-xs mt-1 text-gray-500">Try adjusting your search</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Page <strong className="text-slate-700 dark:text-slate-200">{currentPage}</strong> of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed top-1/2 -translate-y-1/2 z-[41] w-5 h-16 bg-white/95 dark:bg-slate-900/95 border border-l-0 border-gray-200/50 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-r-[12px] flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:w-6 transition-all duration-300 ease-in-out cursor-pointer ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ left: isSidebarOpen ? (isExpanded ? '550px' : '300px') : '-30px' }}
        title="Hide Sidebar"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-indigo-500 font-bold" />
      </button>

      {!isSidebarOpen && (
        <>
          <style>{`
            @keyframes bounceHorizontalSurveys {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(4px); }
            }
            .animate-bounce-right-surveys {
              animation: bounceHorizontalSurveys 1s infinite;
            }
          `}</style>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-52 left-0 z-[41] w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-r-lg border-y border-r border-teal-400/30 bg-teal-600/85 dark:bg-teal-700/85 text-white shadow-[0_4px_20px_rgba(13,148,136,0.35)] backdrop-blur-xl hover:bg-teal-500/95 dark:hover:bg-teal-600/95 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
            title="Restore Site Surveys"
          >
            <ChevronRight size={11} strokeWidth={3} className="text-white animate-bounce-right-surveys" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] rotate-180 mb-1">
              Surveys
            </span>
          </button>
        </>
      )}

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        title="Confirm Bulk Deletion"
        message={`Are you sure you want to permanently delete ${
          filteredMarkers.every(m => visibleMarkerIds.has(m.id))
            ? filteredMarkers.length
            : filteredMarkers.filter(m => visibleMarkerIds.has(m.id)).length
        } location(s)? This action cannot be undone.`}
        confirmText="Delete Locations"
        onConfirm={handleBulkDelete}
        onClose={() => setIsBulkDeleteModalOpen(false)}
      />
    </>
  );
};

export default FeasibilitySurveysSidebar;
