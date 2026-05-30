import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../contexts/GoogleMapsContext';
import { useToolsContext } from '../contexts/ToolsContext';
import { 
  CloudArrowUpIcon, 
  MapIcon, 
  TableCellsIcon, 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { usePermission } from '../../../hooks/usePermission';
import { useTheme } from '../../../contexts/ThemeContext';
import { darkMapStyle } from '../../map/utils/mapStyles';

// --- Types ---
interface ParsedPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  icon?: string;
  otherData: Record<string, any>;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const defaultCenter = { lat: 23.0225, lng: 72.5714 };

const KmlExcelPage: React.FC = () => {
  const { state, saveKmlExcelState } = useToolsContext();
  const { isDarkMode } = useTheme();

  const [file, setFile] = useState<File | null>(state.kmlExcel.file);
  const [previewData, setPreviewData] = useState<ParsedPoint[]>(state.kmlExcel.previewData);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ParsedPoint | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  React.useEffect(() => {
    return () => saveKmlExcelState({ file, previewData });
  }, [file, previewData, saveKmlExcelState]);
  
  const { can } = usePermission();
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const fitMapBounds = (points: ParsedPoint[]) => {
    if (mapRef.current && points.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapRef.current.fitBounds(bounds);
      if (points.length === 1) mapRef.current.setZoom(16);
    }
  };

  // --- Build Style Map from KML document ---
  const buildStyleMap = (xmlDoc: Document): Record<string, string> => {
    const styleMap: Record<string, string> = {};
    const styles = xmlDoc.getElementsByTagName("Style");
    for (let i = 0; i < styles.length; i++) {
      const id = styles[i].getAttribute("id");
      const href = styles[i].getElementsByTagName("href")[0]?.textContent;
      if (id && href) styleMap[`#${id}`] = href.trim();
    }
    // Also resolve StyleMap entries (normal/highlight pairs)
    const styleMaps = xmlDoc.getElementsByTagName("StyleMap");
    for (let i = 0; i < styleMaps.length; i++) {
      const id = styleMaps[i].getAttribute("id");
      const pairs = styleMaps[i].getElementsByTagName("Pair");
      for (let j = 0; j < pairs.length; j++) {
        const key = pairs[j].getElementsByTagName("key")[0]?.textContent;
        const styleUrl = pairs[j].getElementsByTagName("styleUrl")[0]?.textContent;
        if (id && key === "normal" && styleUrl && styleMap[styleUrl]) {
          styleMap[`#${id}`] = styleMap[styleUrl];
        }
      }
    }
    return styleMap;
  };

  // --- XML Parser ---
  const parseKML = (xmlText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) throw new Error("Invalid XML format");

    const kmlStyleMap = buildStyleMap(xmlDoc);
    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    const points: ParsedPoint[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      
      const name = pm.getElementsByTagName("name")[0]?.textContent || `Point ${i + 1}`;
      const desc = pm.getElementsByTagName("description")[0]?.textContent || '';
      
      let lat = 0, lng = 0;
      
      // Look for Point coordinates
      const pointNode = pm.getElementsByTagName("Point")[0];
      if (pointNode) {
        const coords = pointNode.getElementsByTagName("coordinates")[0]?.textContent;
        if (coords) {
          const parts = coords.trim().split(',');
          if (parts.length >= 2) {
            lng = parseFloat(parts[0]);
            lat = parseFloat(parts[1]);
          }
        }
      } else {
        const coordsNode = pm.getElementsByTagName("coordinates")[0]?.textContent;
        if (coordsNode) {
            const firstCoord = coordsNode.trim().split(/\s+/)[0];
            if (firstCoord) {
                const parts = firstCoord.split(',');
                if (parts.length >= 2) {
                    lng = parseFloat(parts[0]);
                    lat = parseFloat(parts[1]);
                }
            }
        }
      }

      // ExtendedData parsing
      const otherData: Record<string, any> = {};
      const extendedData = pm.getElementsByTagName("ExtendedData")[0];
      if (extendedData) {
        const dataNodes = extendedData.getElementsByTagName("Data");
        for (let j = 0; j < dataNodes.length; j++) {
          const key = dataNodes[j].getAttribute("name") || `key${j}`;
          const val = dataNodes[j].getElementsByTagName("value")[0]?.textContent || '';
          otherData[key] = val;
        }
      }
      
      // --- Icon Extraction ---
      let icon: string | undefined;
      // 1. Try inline Style > IconStyle > Icon > href
      const inlineStyle = pm.getElementsByTagName("Style")[0];
      if (inlineStyle) {
        const href = inlineStyle.getElementsByTagName("href")[0]?.textContent;
        if (href) icon = href.trim();
      }
      // 2. Fallback: resolve via styleUrl reference
      if (!icon) {
        const styleUrl = pm.getElementsByTagName("styleUrl")[0]?.textContent;
        if (styleUrl && kmlStyleMap[styleUrl]) {
          icon = kmlStyleMap[styleUrl];
        }
      }
      
      if (lat !== 0 && lng !== 0) {
          points.push({
            id: i,
            name,
            desc,
            lat,
            lng,
            icon,
            otherData
          });
      }
    }
    
    return points;
  };

  const processFileContent = async (selectedFile: File) => {
    setIsProcessing(true);
    try {
      let kmlText = "";
      if (selectedFile.name.endsWith('.kmz')) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(selectedFile);
        const docKml = loadedZip.file("doc.kml") || Object.values(loadedZip.files).find(f => f.name.endsWith(".kml"));
        if (!docKml) throw new Error("No KML file found inside the KMZ archive");
        kmlText = await docKml.async("text");
      } else {
        kmlText = await selectedFile.text();
      }

      const parsedPoints = parseKML(kmlText);
      setPreviewData(parsedPoints);
      
      if (parsedPoints.length > 0) {
        setTimeout(() => fitMapBounds(parsedPoints), 100);
        toast.success(`Loaded ${parsedPoints.length} valid points.`);
      } else {
        toast.warning('No valid coordinates found in file');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to parse file');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.match(/\.(kml|kmz)$/i)) {
      toast.error('Please upload a valid .kml or .kmz file');
      return;
    }
    setFile(selectedFile);
    processFileContent(selectedFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearData = () => {
    setFile(null);
    setPreviewData([]);
    setSearchTerm('');
    setSelectedPoint(null);
    toast.info('Data cleared');
  };

  const handleExportExcel = () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);

    try {
      const exportData = previewData.map(p => ({
        Name: p.name,
        Latitude: p.lat,
        Longitude: p.lng,
        Description: p.desc,
        Icon: p.icon || '',
        ...p.otherData
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');
      
      const fileName = file ? file.name.replace(/\.[^/.]+$/, "") + '_extracted.xlsx' : 'kml_data.xlsx';
      XLSX.writeFile(workbook, fileName);
      toast.success('Successfully generated Excel file!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredData = previewData.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    if (
      p.name.toLowerCase().includes(searchLower) ||
      p.desc.toLowerCase().includes(searchLower) ||
      p.lat.toString().includes(searchLower) ||
      p.lng.toString().includes(searchLower)
    ) return true;
    
    if (p.otherData) {
      return Object.values(p.otherData).some((val) => 
        String(val).toLowerCase().includes(searchLower)
      );
    }
    return false;
  });

  const dynamicKeys = Array.from(
    new Set(filteredData.flatMap(p => Object.keys(p.otherData || {})))
  );

  const handleSelectPoint = (point: ParsedPoint) => {
    setSelectedPoint(point);
    if (mapRef.current) {
        mapRef.current.panTo({ lat: point.lat, lng: point.lng });
        mapRef.current.setZoom(18);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 pb-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-violet-50/50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-100 dark:border-violet-800/50 shrink-0">
        <div className="flex items-center gap-3 text-violet-800 dark:text-violet-300">
           <TableCellsIcon className="w-5 h-5 flex-shrink-0 text-violet-500" />
           <p className="text-sm font-medium">
              Format Transformation Engine <span className="mx-2 text-violet-300 select-none">|</span>
              <span className="text-violet-600/70 dark:text-violet-400/70 font-normal">KML/KMZ to Excel Extraction</span>
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        
        {/* Left Column: Upload & Table */}
        <div className="flex flex-col gap-6 h-full min-h-0">
            {/* Dropzone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={onDrop}
                className={`
                    group relative flex transition-all duration-500 ease-in-out border-2 border-dashed rounded-xl
                    ${file 
                        ? 'h-14 flex-row items-center px-4 py-2 gap-4 border-violet-200 bg-violet-50/30 dark:bg-violet-900/10' 
                        : 'h-64 flex-col items-center justify-center p-8 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-violet-400 hover:bg-violet-50/10'
                    }
                    ${isDragActive ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/30' : ''}
                `}
            >
                {file ? (
                    <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
                                <DocumentTextIcon className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</span>
                                <span className="text-[10px] text-violet-500 font-medium uppercase tracking-wider">Ready to export</span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleClearData(); }}
                            className="p-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-transparent group-hover:border-violet-100 dark:group-hover:border-violet-800">
                          <CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-violet-500 transition-colors" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drag & drop your KML or KMZ file here
                        </p>
                        <p className="text-sm text-gray-500 mt-2 mb-4">or</p>
                        <label className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-violet-500/30">
                            Browse Files
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".kml,.kmz"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFile(e.target.files[0]); 
                                        e.target.value = ''; 
                                    }
                                }}
                            />
                        </label>
                        <p className="mt-4 text-xs text-gray-400">
                            Supports .kml, .kmz
                        </p>
                    </>
                )}
            </div>

            {isTableFullScreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-violet-900/20 backdrop-blur-xl animate-in fade-in duration-300" 
                    onClick={() => setIsTableFullScreen(false)}
                />
            )}
            
            <div className={`
                bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 min-h-0
                ${isTableFullScreen 
                    ? 'fixed inset-6 sm:inset-10 z-[101] h-auto shadow-2xl border-violet-200/50 dark:border-violet-500/30 ring-1 ring-black/5' 
                    : 'flex-1'
                }
            `}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-gray-800 gap-2">
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 whitespace-nowrap">
                            <TableCellsIcon className="w-4 h-4 text-violet-500" /> 
                            Data Preview
                        </h3>
                        <div className="relative flex-1 max-w-xs">
                             <MagnifyingGlassIcon className="absolute left-2.5 top-2 w-4 h-4 text-violet-500/70" />
                             <input 
                                type="text"
                                placeholder="Search points..."
                                className="pl-8 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                             />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 mr-2 border-l pl-2 dark:border-gray-700 hidden sm:inline">
                           {previewData.length > 0 ? `${previewData.length} points` : 'No data'}
                        </span>
                        <button 
                            onClick={() => setIsTableFullScreen(!isTableFullScreen)}
                            className={`p-1.5 rounded transition-all ${isTableFullScreen ? 'bg-violet-100 text-violet-600' : 'hover:bg-violet-50 dark:hover:bg-violet-900/40 text-violet-500'}`}
                        >
                            {isTableFullScreen ? <ArrowsPointingInIcon className="w-4 h-4"/> : <ArrowsPointingOutIcon className="w-4 h-4"/>}
                        </button>
                        {isTableFullScreen && (
                            <button
                                onClick={() => setIsTableFullScreen(false)}
                                className="p-1.5 rounded transition-all bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                                title="Close Fullscreen"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                    {filteredData.length > 0 ? (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Lat</th>
                                    <th className="px-4 py-3">Lng</th>
                                    <th className="px-4 py-3">Desc</th>
                                    <th className="px-4 py-3 w-40">Icon URL</th>
                                    {dynamicKeys.map(key => (
                                        <th key={key} className="px-4 py-3">{key}</th>
                                    ))}
                                    <th className="px-4 py-3 w-8 sticky right-0 bg-gray-50 dark:bg-gray-900"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => (
                                    <tr 
                                        key={row.id} 
                                        className="border-b dark:border-gray-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 group cursor-pointer"
                                        onClick={() => handleSelectPoint(row)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={row.name}>{row.name}</td>
                                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{row.lat.toFixed(6)}</td>
                                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{row.lng.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate" title={row.desc}>{row.desc}</td>
                                        <td className="px-4 py-3 text-xs text-blue-500 underline truncate max-w-[150px]" title={row.icon || ''}>{row.icon || '-'}</td>
                                        {dynamicKeys.map(key => (
                                            <td key={key} className="px-4 py-3 text-gray-500 truncate max-w-[150px]" title={String(row.otherData?.[key] || '')}>
                                                {row.otherData?.[key] !== undefined ? String(row.otherData[key]) : '-'}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-800 group-hover:bg-violet-50/50 dark:group-hover:bg-violet-900/20">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    setPreviewData(prev => prev.filter(p => p.id !== row.id));
                                                }}
                                                className="p-1 hover:bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100"
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
                            Extracting data... Please upload a file.
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0 flex justify-end">
                    <button
                        onClick={handleExportExcel}
                        disabled={!file || isProcessing || previewData.length === 0}
                        className={`
                            py-2 px-8 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm
                            ${!file || previewData.length === 0
                                ? 'bg-violet-900/10 text-violet-400 cursor-not-allowed border border-violet-100/20' 
                                : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-violet-500/30'
                            }
                        `}
                    >
                        {isProcessing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </span>
                        ) : (
                            <>
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                DOWNLOAD EXCEL
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Map Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full relative min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-violet-500" /> Visual Preview
                </h3>
            </div>
            
            <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                {isLoaded ? (
                         <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={5}
                            onLoad={onMapLoad}
                            options={{
                                streetViewControl: false,
                                mapTypeControl: true,
                                fullscreenControl: true,
                                gestureHandling: 'greedy',
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
                                      {selectedPoint.icon && (
                                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', wordBreak: 'break-all' }}>
                                          <span style={{ fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', marginRight: '4px' }}>Icon:</span>
                                          <a href={selectedPoint.icon} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', textDecoration: 'underline' }}>{selectedPoint.icon}</a>
                                        </p>
                                      )}
                                  </div>

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
                            <p className="text-sm text-gray-500 mt-1">Upload a KML/KMZ to view the coordinates</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default KmlExcelPage;
