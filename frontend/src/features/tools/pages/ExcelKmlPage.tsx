import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../contexts/GoogleMapsContext';
import { useToolsContext } from '../contexts/ToolsContext';
import { 
  CloudArrowUpIcon, 
  DocumentArrowDownIcon, 
  MapIcon, 
  TableCellsIcon, 
  GlobeAmericasIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UsersIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../../services/api/client';
import { toast } from 'react-toastify';
import { usePermission } from '../../../hooks/usePermission';
import { useTheme } from '../../../contexts/ThemeContext';
import { darkMapStyle } from '../../map/utils/mapStyles';

// --- Types ---
export interface PreviewPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  icon?: string;
  otherData?: Record<string, any>;
}

interface ExcelRow {
  Name?: string;
  name?: string;
  Latitude?: number;
  latitude?: number;
  Longitude?: number;
  longitude?: number;
  Description?: string;
  description?: string;
  Icon?: string;
  icon?: string;
  [key: string]: any;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pointName?: string;
}

// --- Map Constants ---
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 23.0225,
  lng: 72.5714
};

// --- Confirmation Modal ---
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, pointName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Point?</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{pointName || 'this point'}"</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
          >
            Yes, Delete it
          </button>
        </div>
      </div>
    </div>
  );
};

const ExcelKmlPage: React.FC = () => {
  const { state, saveExcelKmlState } = useToolsContext();
  const { isDarkMode } = useTheme();

  // Converter State
  const [file, setFile] = useState<File | null>(state.excelKml.file);
  const [previewData, setPreviewData] = useState<PreviewPoint[]>(state.excelKml.previewData); // Data from Excel
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null); // ID of row to delete
  const [exportFormat, setExportFormat] = useState<'kml' | 'kmz'>(state.excelKml.exportFormat); // KMZ Option
  
  useEffect(() => {
    return () => saveExcelKmlState({ file, previewData, exportFormat });
  }, [file, previewData, exportFormat, saveExcelKmlState]);
  
  // Shared State
  const [selectedPoint, setSelectedPoint] = useState<PreviewPoint | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Search State
  
  const { can } = usePermission();
  // Map Ref for Panning Logic
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
      mapRef.current = map;
  }, []);

  // Helper: Fit Map to Points
  const fitMapBounds = (points: PreviewPoint[]) => {
      if (mapRef.current && points.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
          mapRef.current.fitBounds(bounds);
          // If only 1 point, zoom out a bit so it's not super zoomed in
          if (points.length === 1) {
             mapRef.current.setZoom(16);
          }
      }
  };

  // --- File Handling ---
  
  // --- Excel Parsing ---
  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Check extension
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

      // Parse for Preview
      const points: PreviewPoint[] = jsonData.map((row, idx) => {
        // Flexible key matching
        const findKey = (keys: string[]) => keys.find(k => row[k] !== undefined);
        
        const nameKey = findKey(['Name', 'name', 'Site Name']) || 'Unknown';
        const latKey = findKey(['Latitude', 'latitude', 'Lat', 'lat']);
        const lngKey = findKey(['Longitude', 'longitude', 'Lng', 'lng', 'Long']);
        const descKey = findKey(['Description', 'description', 'Desc']);
        const iconKey = findKey(['Icon', 'icon', 'Sym']);

        const lat = parseFloat(String(row[latKey!] || 0));
        const lng = parseFloat(String(row[lngKey!] || 0));

        // extract other keys for InfoWindow
        const otherData: Record<string, any> = {};
        Object.keys(row).forEach(k => {
            if (![nameKey, latKey, lngKey, descKey, iconKey].includes(k)) {
                otherData[k] = row[k];
            }
        });

        return {
          id: idx,
          name: String(row[nameKey] || `Row ${idx + 1}`),
          lat: isNaN(lat) ? 0 : lat,
          lng: isNaN(lng) ? 0 : lng,
          desc: String(row[descKey!] || ''),
          icon: iconKey ? String(row[iconKey]) : undefined,
          otherData
        };
      }).filter(p => p.lat !== 0 && p.lng !== 0); // Filter invalid

      setPreviewData(points);
      
      // Auto-Fit Map
      if (points.length > 0) {
           setTimeout(() => fitMapBounds(points), 100);
      }
      
      if (jsonData.length === 0) toast.warning('Excel file appears empty');
      else if (points.length === 0) toast.warning('No valid coordinates found');
      else toast.success(`Loaded ${points.length} valid points.`);

    } catch (err) {
      console.error(err);
      toast.error('Failed to parse Excel file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // --- Drag & Drop Handlers ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const onDragLeave = () => setIsDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.match(/\.(xlsx|xls)$/)) handleFile(file);
      else toast.error('Please upload Excel file');
    }
  };


  const confirmDelete = () => {
      if (showDeleteConfirm !== null) {
          setPreviewData(prev => prev.filter(p => p.id !== showDeleteConfirm));
          setShowDeleteConfirm(null);
          // If selected point was deleted, close InfoWindow
          if (selectedPoint?.id === showDeleteConfirm) setSelectedPoint(null);
      }
  };

  const handleDeleteRow = (id: number) => {
      setShowDeleteConfirm(id);
  };
  
  // Filter Logic (Global Search across all standard and dynamic fields)
  const filteredData = useMemo(() => {
    return previewData.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      
      // Check standard fields
      if (
        p.name.toLowerCase().includes(searchLower) ||
        p.desc.toLowerCase().includes(searchLower) ||
        p.lat.toString().includes(searchLower) ||
        p.lng.toString().includes(searchLower)
      ) {
        return true;
      }

      // Check dynamic otherData fields
      if (p.otherData) {
        return Object.values(p.otherData).some((val) => 
          String(val).toLowerCase().includes(searchLower)
        );
      }

      return false;
    });
  }, [previewData, searchTerm]);

  // Extract all unique dynamic keys for table headers
  const dynamicKeys = useMemo(() => {
    return Array.from(
      new Set(
        filteredData.flatMap(p => Object.keys(p.otherData || {}))
      )
    );
  }, [filteredData]);

  const handleSelectPoint = (point: PreviewPoint) => {
    setSelectedPoint(point);
    // Map Pan & Zoom
    if (mapRef.current) {
        mapRef.current.panTo({ lat: point.lat, lng: point.lng });
        mapRef.current.setZoom(18); // Zoom in close to the point
    }
  };

  const handleClearData = () => {
    setFile(null);
    setPreviewData([]);
    setSearchTerm('');
    setSelectedPoint(null);
    toast.info('Data cleared');
  };

  const handleDownloadUpdatedExcel = () => {
      // Convert previewData back to generic objects for sheet
      const exportData = previewData.map(p => ({
          Name: p.name,
          Latitude: p.lat,
          Longitude: p.lng,
          Description: p.desc,
          Icon: p.icon || '',
          ...(p.otherData || {})
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Updated Data');
      XLSX.writeFile(workbook, 'updated_data.xlsx');
      toast.success('Downloaded updated Excel file');
  };

  // --- API Actions ---
  const handleDownloadSample = async () => {
    // ... existing ...
    try {
      const response = await apiClient.get('/tools/sample', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'opticonnect_sample.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast.error('Failed to download sample');
      // Fallback: Generate generic sample if API fails? No, stick to API.
    }
  };

  // Ensure google is defined for Typescript
  // @ts-ignore 
  declare var google: any;

  const handleConvert = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    
    // Generate fresh Excel from edited previewData
    const exportData = previewData.map(p => ({
        Name: p.name,
        Latitude: p.lat,
        Longitude: p.lng,
        Description: p.desc,
        Icon: p.icon || '',
        ...(p.otherData || {})
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create FormData with the NEW file
    const formData = new FormData();
    const fileName = file ? file.name : 'converted_data.xlsx';
    formData.append('file', blob, fileName);

    try {
        const response = await apiClient.post('/tools/convert', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Get KML Blob from Backend
      const kmlBlob = new Blob([response.data as any], { type: 'application/vnd.google-earth.kml+xml' });
      
      let finalBlob = kmlBlob;
      let finalName = fileName.replace(/\.[^/.]+$/, "") + '.kml';

      // --- KMZ Compression Logic ---
      if (exportFormat === 'kmz') {
           const zip = new JSZip();
           // Read KML text
           const kmlText = await kmlBlob.text();
           // Add to zip as doc.kml (Standard KMZ format)
           zip.file("doc.kml", kmlText);
           
           // Generate KMZ Blob
           const kmzContent = await zip.generateAsync({ type: "blob" });
           finalBlob = kmzContent;
           finalName = fileName.replace(/\.[^/.]+$/, "") + '.kmz';
      }

      // Download File
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', finalName); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Conversion Successful! Downloading ${exportFormat.toUpperCase()}...`);
    } catch (err: any) {
        console.error(err);
        if (err.response?.data instanceof Blob) {
             // Read error blob
             const text = await err.response.data.text();
             try {
                const json = JSON.parse(text);
                toast.error(json.error || 'Conversion failed');
             } catch(e) { toast.error('Conversion failed'); }
        } else {
            toast.error('Conversion failed');
        }
    } finally {
      setIsProcessing(false);
    }
  };



  // --- Google Maps Loader ---
  // Note: We assume the API key is available in window.google or configured elsewhere. 
  // If useJsApiLoader is needed, we need the key.
  // For now, assuming the App has a global loader or we reuse one.
  // We'll use the one from package if configured, else fallback to simple non-map preview msg?
   const { isLoaded } = useGoogleMaps();

  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 pb-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-orange-50/50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-800/50 shrink-0">
        <div className="flex items-center gap-3 text-orange-800 dark:text-orange-300">
           <TableCellsIcon className="w-5 h-5 flex-shrink-0 text-orange-500" />
           <p className="text-sm font-medium">
              Format Transformation Engine <span className="mx-2 text-orange-300 select-none">|</span>
              <span className="text-orange-600/70 dark:text-orange-400/70 font-normal">Excel to KML/KMZ Conversion</span>
           </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        
        {/* Left Column: Upload & Table */}
        <div className="flex flex-col gap-6 h-full min-h-0">
            
            {/* Dropzone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    group relative flex transition-all duration-500 ease-in-out border-2 border-dashed rounded-xl
                    ${file 
                        ? 'h-14 flex-row items-center px-4 py-2 gap-4 border-orange-200 bg-orange-50/30 dark:bg-orange-900/10' 
                        : 'h-64 flex-col items-center justify-center p-8 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-orange-400 hover:bg-orange-50/10'
                    }
                    ${isDragActive ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/30' : ''}
                `}
            >
                {file ? (
                    // Slim Version (File Selected)
                    <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                                <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</span>
                                <span className="text-[10px] text-orange-500 font-medium uppercase tracking-wider">Ready to transform</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-[10px] font-bold text-orange-600 dark:text-orange-400 rounded-full border border-orange-200/50 dark:border-orange-800/50 uppercase tracking-wider">
                                Target: {exportFormat.toUpperCase()}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleClearData(); }}
                                className="p-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Full Version (Initial State)
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadSample(); }}
                            className="absolute top-0 right-0 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 text-[11px] font-bold rounded-tr-xl rounded-bl-xl border-b border-l border-orange-100 dark:border-orange-800 transition-colors flex items-center gap-2 z-10"
                        >
                            <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                            SAMPLE TEMPLATE
                        </button>

                        <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-orange-100 dark:group-hover:border-orange-800">
                          <CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drag & drop your Excel file here
                        </p>
                        
                        <p className="text-sm text-gray-500 mt-2 mb-4">or</p>
                        <label className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-orange-500/30">
                            Browse Files
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".xlsx,.xls"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFile(e.target.files[0]); 
                                        e.target.value = ''; 
                                    }
                                }}
                            />
                        </label>
                        
                        <p className="mt-4 text-xs text-gray-400">
                            Supports .xlsx, .xls • Max 5MB
                        </p>
                    </>
                )}
            </div>

            {/* Data Preview Modal-Feel Section */}
            {isTableFullScreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-orange-900/20 backdrop-blur-xl animate-in fade-in duration-300" 
                    onClick={() => setIsTableFullScreen(false)}
                />
            )}
            
            <div className={`
                bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 min-h-0
                ${isTableFullScreen 
                    ? 'fixed inset-6 sm:inset-10 z-[101] h-auto shadow-2xl border-orange-200/50 dark:border-orange-500/30 ring-1 ring-black/5' 
                    : 'flex-1'
                }
            `}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-gray-800 gap-2">
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 whitespace-nowrap">
                            <TableCellsIcon className="w-4 h-4 text-orange-500" /> 
                            Data Preview
                        </h3>
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-xs">
                             <MagnifyingGlassIcon className="absolute left-2.5 top-2 w-4 h-4 text-orange-500/70" />
                             <input 
                                type="text"
                                placeholder="Search points..."
                                className="pl-8 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                             />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {previewData.length > 0 && (
                            <button
                                onClick={handleDownloadUpdatedExcel}
                                className="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 rounded-lg border border-orange-100 dark:border-orange-800 transition-all"
                                title="Download edited data as standard Excel"
                            >
                                <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                                EXPORT EXCEL
                            </button>
                        )}
                        <span className="text-xs text-gray-500 mr-2 border-l pl-2 dark:border-gray-700 hidden sm:inline">
                           {previewData.length > 0 ? `${previewData.length} points` : 'No data'}
                        </span>
                        <button 
                            onClick={() => setIsTableFullScreen(!isTableFullScreen)}
                            className={`p-1.5 rounded transition-all ${isTableFullScreen ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'hover:bg-orange-50 dark:hover:bg-orange-900/40 text-orange-500'}`}
                            title={isTableFullScreen ? "Exit Fullscreen" : "Fullscreen Table"}
                        >
                            {isTableFullScreen ? <ArrowsPointingInIcon className="w-4 h-4"/> : <ArrowsPointingOutIcon className="w-4 h-4 text-orange-500"/>}
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                    {filteredData.length > 0 ? (
                        <table className="w-full text-sm text-left">                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 w-24">Lat</th>
                                    <th className="px-4 py-3 w-24">Lng</th>
                                    <th className="px-4 py-3 min-w-[150px]">Desc</th>
                                    <th className="px-4 py-3 w-40">Icon URL</th>
                                    {dynamicKeys.map(key => (
                                        <th key={key} className="px-4 py-3 min-w-[150px]">{key}</th>
                                    ))}
                                    <th className="px-4 py-3 w-8 sticky right-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => (
                                        <tr 
                                            key={row.id} 
                                            className="border-b dark:border-gray-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 group cursor-pointer transition-colors"
                                            onClick={() => handleSelectPoint(row)}
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{row.lat.toFixed(6)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{row.lng.toFixed(6)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={row.desc}>{row.desc}</td>
                                            <td className="px-4 py-3 text-xs text-blue-500 underline truncate max-w-[150px]">{row.icon}</td>
                                            {dynamicKeys.map(key => (
                                                <td key={key} className="px-4 py-2 text-gray-500 whitespace-nowrap">
                                                    {row.otherData?.[key] !== undefined ? String(row.otherData[key]) : '-'}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-800 border-l border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors pr-6">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleDeleteRow(row.id);
                                                }}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete this point"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Map data will appear here after upload
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-4 items-center justify-between shrink-0">
                    {/* Premium Format Switcher (Synchronized with Header Labs UI) */}
                    <div className="relative flex p-[3px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-full shadow-sm overflow-hidden min-w-[200px]">
                        {/* 3D Color Pill */}
                        <motion.div
                            className="absolute bg-orange-600 rounded-full z-10"
                            layoutId="format-pill-color"
                            initial={false}
                            animate={{
                                x: exportFormat === 'kml' ? '0%' : '100%',
                            }}
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            style={{ 
                                top: '3px', 
                                bottom: '3px', 
                                left: '3px', 
                                width: 'calc(50% - 3px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)'
                            }}
                        />
                        
                        {/* 3D Gloss Layer */}
                        <motion.div
                            className="absolute rounded-full z-[11] pointer-events-none"
                            layoutId="format-pill-gloss"
                            initial={false}
                            animate={{
                                x: exportFormat === 'kml' ? '0%' : '100%',
                            }}
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            style={{ 
                                top: '3px', 
                                bottom: '3px', 
                                left: '3px', 
                                width: 'calc(50% - 3px)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)'
                            }}
                        />
                        
                        <button
                            onClick={() => setExportFormat('kml')}
                            className={`relative flex-1 py-2 text-xs font-bold transition-colors z-20 ${exportFormat === 'kml' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            .KML
                        </button>
                        <button
                            onClick={() => setExportFormat('kmz')}
                            className={`relative flex-1 py-2 text-xs font-bold transition-colors z-20 ${exportFormat === 'kmz' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            .KMZ (Zipped)
                        </button>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={!file || isProcessing || !can('converter:excel_to_kml')}
                        className={`
                            py-2 px-8 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm
                            ${!file || !can('converter:excel_to_kml')
                                ? 'bg-orange-900/10 text-orange-400 cursor-not-allowed border border-orange-100/20' 
                                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/30'
                            }
                        `}
                        title={!can('converter:excel_to_kml') ? 'You do not have permission to use the converter tool' : ''}
                    >
                        {isProcessing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            <>
                                <CloudArrowUpIcon className="w-5 h-5" />
                                Download {exportFormat.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Map Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full relative min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-orange-500" /> Visual Preview
                </h3>
            </div>
            
            <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                {isLoaded ? (
                         <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter} // Default center only
                            zoom={5} // Default zoom
                            onLoad={onMapLoad} // Capture ref
                            options={{
                                streetViewControl: false,
                                mapTypeControl: true, // Enable Map Type
                                fullscreenControl: true,
                                gestureHandling: 'greedy', // Allow scroll zoom without Ctrl
                                styles: isDarkMode ? darkMapStyle : [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
                            }}
                        >
                            {previewData.map(point => (
                                <Marker
                                    key={point.id}
                                    position={{ lat: point.lat, lng: point.lng }}
                                    title={point.name}
                                    onClick={() => handleSelectPoint(point)}
                                    icon={point.icon ? {
                                        url: point.icon,
                                        scaledSize: new google.maps.Size(32, 32)
                                    } : undefined}
                                />
                            ))}

                            {selectedPoint && (
                              <InfoWindow
                                position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                                onCloseClick={() => setSelectedPoint(null)}
                                options={{ pixelOffset: new google.maps.Size(0, -30) }}
                              >
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', maxWidth: '320px', overflow: 'hidden', color: '#111827', position: 'relative' }}>
                                  <button onClick={() => setSelectedPoint(null)} style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer', background: 'none', border: 'none', padding: '4px', borderRadius: '4px' }} className="hover:bg-gray-100 text-gray-500">
                                      <XMarkIcon className="w-4 h-4" />
                                  </button>
                                  <h4 style={{ fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '8px', fontSize: '14px', paddingRight: '20px' }}>{selectedPoint.name}</h4>
                                  
                                  {/* Standard Fields */}
                                  <div style={{ marginBottom: '10px' }}>
                                      {selectedPoint.desc && (
                                          <p style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', marginRight: '4px' }}>Desc:</span>
                                            {selectedPoint.desc}
                                          </p>
                                      )}
                                      <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                                        {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
                                      </p>
                                  </div>

                                  {/* Dynamic Fields */}
                                  {selectedPoint.otherData && Object.keys(selectedPoint.otherData).length > 0 && (
                                      <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '8px', fontSize: '11px', border: '1px solid #f3f4f6' }}>
                                          {Object.entries(selectedPoint.otherData).map(([k, v]) => (
                                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                  <span style={{ fontWeight: 500, color: '#6b7280', marginRight: '8px' }}>{k}:</span>
                                                  <span style={{ color: '#1f2937', textAlign: 'right', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(v)}>
                                                      {String(v)}
                                                  </span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                </div>
                              </InfoWindow>
                            )}
                        </GoogleMap>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <span className="text-gray-500">Loading Map...</span>
                    </div>
                )}
                
                {previewData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 pointer-events-none">
                        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                            <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-gray-900 dark:text-white font-medium">Map Preview</h4>
                            <p className="text-gray-500 text-sm mt-1">
                                Upload Excel to see points
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={confirmDelete}
        pointName={showDeleteConfirm !== null ? previewData.find(p => p.id === showDeleteConfirm)?.name : ''}
      />
    </div>
  );
};

export default ExcelKmlPage;
