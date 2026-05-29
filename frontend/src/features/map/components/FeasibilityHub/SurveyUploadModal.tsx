import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { X, UploadCloud, FileSpreadsheet, Map as MapIcon, Loader2 } from 'lucide-react';
import { locationMarkerService, MarkedLocation } from '../../../../services/gisTools/locationMarkerService';
import { motion, AnimatePresence } from 'framer-motion';

interface SurveyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  marker: MarkedLocation;
  onSuccess?: () => void;
}

export const SurveyUploadModal: React.FC<SurveyUploadModalProps> = ({ isOpen, onClose, marker, onSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processExcel = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

    const points = jsonData.map((row: any, idx: number) => {
      const findKey = (keys: string[]) => keys.find(k => row[k] !== undefined);
      
      const nameKey = findKey(['Name', 'name', 'Site Name']) || 'Unknown';
      const latKey = findKey(['Latitude', 'latitude', 'Lat', 'lat']);
      const lngKey = findKey(['Longitude', 'longitude', 'Lng', 'lng', 'Long']);
      const descKey = findKey(['Description', 'description', 'Desc']);

      const lat = parseFloat(String(row[latKey!] || 0));
      const lng = parseFloat(String(row[lngKey!] || 0));

      const otherData: Record<string, any> = {};
      Object.keys(row).forEach(k => {
          if (![nameKey, latKey, lngKey, descKey].includes(k)) {
              otherData[k] = row[k];
          }
      });

      return {
        name: String(row[nameKey] || `Row ${idx + 1}`),
        lat: isNaN(lat) ? 0 : lat,
        lng: isNaN(lng) ? 0 : lng,
        desc: String(row[descKey!] || ''),
        ...otherData,
        feasible: true // Default placeholder
      };
    }).filter((p: any) => p.lat !== 0 && p.lng !== 0);

    return points;
  };

  const processKML = async (kmlText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    
    const points: any[] = [];
    
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const nameNode = placemark.getElementsByTagName("name")[0];
      const descNode = placemark.getElementsByTagName("description")[0];
      const pointNode = placemark.getElementsByTagName("Point")[0];
      
      if (pointNode) {
        const coordNode = pointNode.getElementsByTagName("coordinates")[0];
        if (coordNode && coordNode.textContent) {
          // KML coordinates are lng,lat,alt
          const coordsArray = coordNode.textContent.trim().split(',');
          if (coordsArray.length >= 2) {
            const lng = parseFloat(coordsArray[0]);
            const lat = parseFloat(coordsArray[1]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              points.push({
                name: nameNode ? nameNode.textContent || `Point ${i + 1}` : `Point ${i + 1}`,
                lat,
                lng,
                desc: descNode ? descNode.textContent || '' : '',
                feasible: true
              });
            }
          }
        }
      }
    }
    return points;
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    let points: any[] = [];

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        points = await processExcel(file);
      } else if (ext === 'kml') {
        const text = await file.text();
        points = await processKML(text);
      } else if (ext === 'kmz') {
        const zip = new JSZip();
        const zipContents = await zip.loadAsync(file);
        
        // Find doc.kml inside the zip
        let kmlFile = zipContents.file("doc.kml");
        if (!kmlFile) {
          // Fallback: search for any .kml file
          const kmlFiles = Object.keys(zipContents.files).filter(name => name.endsWith('.kml'));
          if (kmlFiles.length > 0) {
            kmlFile = zipContents.file(kmlFiles[0]);
          }
        }

        if (kmlFile) {
          const text = await kmlFile.async("string");
          points = await processKML(text);
        } else {
          throw new Error("No KML file found inside KMZ");
        }
      } else {
        throw new Error("Unsupported file format");
      }

      if (points.length === 0) {
        throw new Error("No valid coordinates found in the file");
      }

      let existingFeasibility: any = {};
      if (marker.feasibility_data) {
        if (typeof marker.feasibility_data === 'string') {
          try {
            existingFeasibility = JSON.parse(marker.feasibility_data);
          } catch (e) {
            console.error('Failed to parse existing feasibility_data:', e);
          }
        } else if (typeof marker.feasibility_data === 'object') {
          existingFeasibility = marker.feasibility_data;
        }
      }

      const feasibilityData = {
        ...existingFeasibility,
        points,
        processedAt: new Date().toISOString()
      };

      await locationMarkerService.updateFeasibility(marker.id, feasibilityData);
      toast.success(`Successfully linked ${points.length} locations to ${marker.name}`);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to process survey file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & Drop Handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const onDragLeave = () => setIsDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight">Attach Survey Data</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Linking to: <span className="text-gray-800 dark:text-gray-300 font-bold">{marker.name}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                }
                ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              `}
              onClick={() => !isProcessing && document.getElementById('survey-upload-input')?.click()}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center text-blue-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-3" />
                  <p className="text-[13px] font-bold">Processing Survey...</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4">
                    <div className="p-3 bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-full text-emerald-500 transform -rotate-6">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-full text-indigo-500 transform rotate-6">
                      <MapIcon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-white text-center">
                    Click or drag file to upload
                  </p>
                  
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 text-center max-w-[200px]">
                    Supported formats: <strong className="text-gray-700 dark:text-gray-300">.xlsx, .csv, .kml, .kmz</strong>
                  </p>
                  
                  <input 
                    id="survey-upload-input"
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls,.csv,.kml,.kmz"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                        e.target.value = ''; 
                      }
                    }}
                  />
                </>
              )}
            </div>
            
            <div className="mt-5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
               <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-snug">
                 <strong className="block mb-0.5">Note on Formats:</strong>
                 Ensure Excel files have columns like <em>Latitude</em> and <em>Longitude</em>. KML/KMZ files are parsed automatically for standard Placemarks.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
