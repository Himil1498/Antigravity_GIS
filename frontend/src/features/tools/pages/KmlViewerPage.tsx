import React, { useState, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../../../contexts/GoogleMapsContext';
import { useToolsContext } from '../contexts/ToolsContext';
import { GlobeAmericasIcon, XMarkIcon, MagnifyingGlassIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, MapIcon } from '@heroicons/react/24/outline';

interface MapPoint {
    id: string;
    name: string;
    lat: number;
    lng: number;
    desc: string;
    iconUrl?: string; // Standard icon
    markerColor?: string; // #rrggbb hex string
    dynamicData: Record<string, string>;
}

// Map Configuration
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center
const MAP_ID = "DEMO_MAP_ID";

const KmlViewerPage: React.FC = () => {
  const { state, saveViewerState } = useToolsContext();

  const [kmlFile, setKmlFile] = useState<File | null>(state.viewer.kmlFile);
  const [isDragActive, setIsDragActive] = useState(false);
  const [viewerData, setViewerData] = useState<MapPoint[]>(state.viewer.viewerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  React.useEffect(() => {
    return () => saveViewerState({ kmlFile, viewerData });
  }, [kmlFile, viewerData, saveViewerState]);

  // Parse KML XML string strictly for points and placemarks
  const parseKmlString = (xmlString: string) => {
      try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, "text/xml");
          
          if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
              throw new Error("Invalid XML format");
          }

          const placemarks = xmlDoc.getElementsByTagName('Placemark');
          const points: MapPoint[] = [];

          // Map to track icon URLs from styles
          const styleMap: Record<string, string> = {};
          const iconStyles = xmlDoc.getElementsByTagName('IconStyle');
          for(let i=0; i<iconStyles.length; i++) {
              const style = iconStyles[i];
              const styleIdNode = style.parentNode; 
              if (styleIdNode && styleIdNode.nodeName === 'Style') {
                 const id = (styleIdNode as Element).getAttribute('id');
                 const hrefNode = style.getElementsByTagName('href')[0];
                 if (id && hrefNode && hrefNode.textContent) {
                    styleMap['#' + id] = hrefNode.textContent.trim();
                 }
              }
          }

          for (let i = 0; i < placemarks.length; i++) {
              const p = placemarks[i];
              const pointNode = p.getElementsByTagName('Point')[0];
              
              if (pointNode) {
                  const coordsNode = pointNode.getElementsByTagName('coordinates')[0];
                  if (coordsNode && coordsNode.textContent) {
                      const coords = coordsNode.textContent.trim().split(',');
                      if (coords.length >= 2) {
                          const nameNode = p.getElementsByTagName('name')[0];
                          const descNode = p.getElementsByTagName('description')[0];
                          const styleUrlNode = p.getElementsByTagName('styleUrl')[0];

                          let iconUrl = '';
                          if (styleUrlNode && styleUrlNode.textContent) {
                             iconUrl = styleMap[styleUrlNode.textContent.trim()] || '';
                          }

                          // Data scraping extended points
                          const extendedDataNode = p.getElementsByTagName('ExtendedData')[0];
                          const dynamicData: Record<string, string> = {};
                          if(extendedDataNode) {
                              const dataNodes = extendedDataNode.getElementsByTagName('Data');
                              for(let j=0; j<dataNodes.length; j++) {
                                  let key = dataNodes[j].getAttribute('name');
                                  let val = dataNodes[j].getElementsByTagName('value')[0]?.textContent;
                                  if (key && val) dynamicData[key] = val;
                              }
                          }

                          points.push({
                              id: `kml_${i}`,
                              name: nameNode ? nameNode.textContent || 'Unnamed' : 'Unnamed',
                              desc: descNode ? descNode.textContent || '' : '',
                              lat: parseFloat(coords[1]),
                              lng: parseFloat(coords[0]),
                              iconUrl: iconUrl,
                              dynamicData
                          });
                      }
                  }
              }
          }

          setViewerData(points);
          toast.success(`Successfully parsed ${points.length} locations from KML.`);
      } catch (err: any) {
          toast.error(`Error parsing KML: ${err.message}`);
      }
  };

  const handleKmlFileDrop = async (file: File) => {
      setKmlFile(file);
      setViewerData([]); 
      toast.info('Processing KML/KMZ file...');

      try {
          if (file.name.toLowerCase().endsWith('.kmz')) {
              // Extract KML string from KMZ
              const zip = await JSZip.loadAsync(file);
              const kmlFileObj = Object.values(zip.files).find(f => f.name.endsWith('.kml'));
              if (!kmlFileObj) throw new Error('No .kml file found inside KMZ');
              const text = await kmlFileObj.async('string');
              parseKmlString(text);
          } else {
              // Direct KML String
              const text = await file.text();
              parseKmlString(text);
          }
      } catch (err: any) {
          toast.error(`Failed to read file: ${err.message}`);
          setKmlFile(null);
      }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const onDragLeave = () => setIsDragActive(false);
  const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (file.name.toLowerCase().endsWith('.kml') || file.name.toLowerCase().endsWith('.kmz')) {
              handleKmlFileDrop(file);
          } else {
              toast.error('Only .kml or .kmz files are allowed');
          }
      }
  };

  const handleClearData = () => {
      setKmlFile(null);
      setViewerData([]);
      setSearchTerm('');
      setSelectedPoint(null);
  };

  const filteredData = viewerData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { isLoaded } = useGoogleMaps();

  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 pb-2">
       
       <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 shrink-0">
           <GlobeAmericasIcon className="w-5 h-5 flex-shrink-0 text-blue-600" />
           <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Geospatial Inspection Engine <span className="mx-2 text-blue-300 select-none">|</span>
                <span className="text-blue-600/70 dark:text-blue-400/70 font-normal">KML & KMZ Visual Inspection</span>
           </p>
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
                    ${kmlFile 
                        ? 'h-14 flex-row items-center px-4 py-2 gap-4 border-blue-200 bg-blue-50/30 dark:bg-blue-900/10' 
                        : 'h-64 flex-col items-center justify-center p-8 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50/10'
                    }
                    ${isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30' : ''}
                `}
            >
                {kmlFile ? (
                    // Slim Version (File Selected)
                    <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <MapIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{kmlFile.name}</span>
                                <span className="text-[10px] text-blue-500 font-medium uppercase tracking-wider">File inspection active</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-100/50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800">
                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">{viewerData.length} POINTS</span>
                            </div>
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
                        <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-800">
                             <GlobeAmericasIcon className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Drag & drop KML/KMZ file to view
                        </p>
                        <p className="text-sm text-gray-500 mt-2 mb-4">or</p>
                        <label className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-blue-500/30">
                            Browse Files
                            <input 
                                type="file" className="hidden" accept=".kml,.kmz"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleKmlFileDrop(e.target.files[0]);
                                        e.target.value = ''; 
                                    }
                                }}
                            />
                        </label>
                        <p className="mt-4 text-xs text-gray-400">
                            Supports .kml, .kmz • Max 50MB
                        </p>
                    </>
                )}
            </div>

            {/* Data Preview Modal-Feel Section */}
            {isTableFullScreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-blue-900/20 backdrop-blur-xl animate-in fade-in duration-300" 
                    onClick={() => setIsTableFullScreen(false)}
                />
            )}
            
            <div className={`
                bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 min-h-0
                ${isTableFullScreen 
                    ? 'fixed inset-6 sm:inset-10 z-[101] h-auto shadow-2xl border-blue-200/50 dark:border-blue-500/30 ring-1 ring-black/5' 
                    : 'flex-1'
                }
            `}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-gray-800 gap-2">
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 whitespace-nowrap">
                            <MapIcon className="w-4 h-4 text-blue-500" /> 
                            File Statistics
                        </h3>
                        <div className="relative flex-1 max-w-xs">
                             <MagnifyingGlassIcon className="absolute left-2.5 top-2 w-4 h-4 text-blue-500/70" />
                             <input 
                                type="text"
                                placeholder="Search points..."
                                className="pl-8 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                             />
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 mr-2 border-l pl-2 dark:border-gray-700 hidden sm:inline">
                            {viewerData.length > 0 ? `${viewerData.length} points` : 'No data'}
                        </span>
                        <button 
                            onClick={() => setIsTableFullScreen(!isTableFullScreen)} 
                            className={`p-1.5 rounded transition-all ${isTableFullScreen ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500'}`}
                            title={isTableFullScreen ? "Exit Fullscreen" : "Fullscreen Table"}
                        >
                            {isTableFullScreen ? <ArrowsPointingInIcon className="w-4 h-4"/> : <ArrowsPointingOutIcon className="w-4 h-4 text-blue-500"/>}
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
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 w-24">Lat</th>
                                    <th className="px-4 py-3 w-24">Lng</th>
                                    <th className="px-4 py-3 min-w-[150px]">Desc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => (
                                    <tr 
                                      key={row.id} 
                                      className="border-b dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 group cursor-pointer transition-colors"
                                      onClick={() => setSelectedPoint(row)}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={row.name}>{row.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{row.lat.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{row.lng.toFixed(6)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={row.desc}>{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 dark:bg-gray-800/30">
                            <p>No map points found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Google Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full relative min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <GlobeAmericasIcon className="w-4 h-4 text-blue-500" /> Visual Preview
                </h3>
            </div>
            
            <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                {!isLoaded ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
                        Loading Map Engine...
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={selectedPoint ? {lat: selectedPoint.lat, lng: selectedPoint.lng} : (viewerData.length > 0 ? {lat: viewerData[0].lat, lng: viewerData[0].lng} : defaultCenter)}
                        zoom={selectedPoint ? 16 : (viewerData.length > 0 ? 10 : 5)}
                        options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: true, gestureHandling: 'greedy', styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }] }}
                    >
                        {viewerData.map(point => (
                            <Marker
                                key={point.id}
                                position={{ lat: point.lat, lng: point.lng }}
                                title={point.name}
                                onClick={() => setSelectedPoint(point)}
                                icon={point.iconUrl ? {
                                    url: point.iconUrl,
                                    scaledSize: new window.google.maps.Size(32, 32)
                                } : undefined}
                            />
                        ))}
                        
                        {selectedPoint && (
                            <InfoWindow
                                position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                                onCloseClick={() => setSelectedPoint(null)}
                                options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                            >
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', minWidth: '200px', maxWidth: '320px', overflow: 'hidden', color: '#111827', position: 'relative' }}>
                                    <button onClick={() => setSelectedPoint(null)} style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer', background: 'none', border: 'none', padding: '4px', borderRadius: '4px' }} className="hover:bg-gray-100 text-gray-500">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                    <h3 style={{ fontWeight: 700, fontSize: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', marginBottom: '8px', paddingRight: '20px' }}>{selectedPoint.name}</h3>
                                    <div dangerouslySetInnerHTML={{ __html: selectedPoint.desc }} style={{ fontSize: '13px', marginBottom: '8px', maxHeight: '128px', overflowY: 'auto' }} className="custom-scrollbar" />
                                    {Object.keys(selectedPoint.dynamicData).length > 0 && (
                                        <div style={{ marginTop: '8px', fontSize: '11px', background: '#f9fafb', padding: '8px', border: '1px solid #f3f4f6', borderRadius: '6px' }}>
                                            {Object.entries(selectedPoint.dynamicData).slice(0, 10).map(([k,v]) => (
                                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f3f4f6', color: '#1f2937' }}>
                                                    <span style={{ fontWeight: 500, color: '#6b7280', marginRight: '8px' }}>{k}:</span>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }} title={v}>{v}</span>
                                                </div>      
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                )}
                
                {viewerData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 pointer-events-none">
                        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                            <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-gray-900 dark:text-white font-medium">Map Preview</h4>
                            <p className="text-gray-500 text-sm mt-1">Upload KML/KMZ to visualize</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default KmlViewerPage;
