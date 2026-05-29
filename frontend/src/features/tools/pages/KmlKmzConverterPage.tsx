import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { useToolsContext } from '../contexts/ToolsContext';
import { 
    CloudArrowUpIcon, 
    DocumentArrowDownIcon, 
    XMarkIcon, 
    ArrowPathIcon, 
    BoltIcon, 
    DocumentCheckIcon 
} from '@heroicons/react/24/outline';

const KmlKmzConverterPage: React.FC = () => {
  const { state, saveKmlKmzState } = useToolsContext();

  const [file, setFile] = useState<File | null>(state.kmlKmz.file);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => saveKmlKmzState({ file });
  }, [file, saveKmlKmzState]);
  
  // What output do we expect based on input?
  const isKmlDrop = file?.name.toLowerCase().endsWith('.kml');
  const fileExt = isKmlDrop ? '.kml' : '.kmz';
  const targetExt = isKmlDrop ? '.kmz' : '.kml';

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => setIsDragActive(false);

  const handleFileDrop = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase();
    if (ext.endsWith('.kml') || ext.endsWith('.kmz')) {
        setFile(selectedFile);
    } else {
        toast.error('Invalid file type. Please upload a .kml or .kmz file.');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       handleFileDrop(e.dataTransfer.files[0]);
    }
  };

  const executeConversion = async () => {
      if (!file) return;
      setIsProcessing(true);

      try {
          // Input: KML -> Output: KMZ
          if (isKmlDrop) {
              const kmlString = await file.text();
              const zip = new JSZip();
              zip.file('doc.kml', kmlString);
              
              const kmzContent = await zip.generateAsync({ type: "blob" });
              const url = window.URL.createObjectURL(kmzContent);
              
              const finalName = file.name.replace(/\.[^/.]+$/, "") + '.kmz';
              
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', finalName);
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success('Successfully compressed KML to KMZ!');
          } 
          // Input: KMZ -> Output: KML
          else {
              const zip = await JSZip.loadAsync(file);
              const kmlFileKey = Object.keys(zip.files).find(name => name.endsWith('.kml'));
              
              if (!kmlFileKey) {
                  throw new Error('No internal KML file found inside this KMZ archive.');
              }
              
              const kmlString = await zip.files[kmlFileKey].async("string");
              const kmlBlob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
              
              const url = window.URL.createObjectURL(kmlBlob);
              const finalName = file.name.replace(/\.[^/.]+$/, "") + '.kml';
              
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', finalName);
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success('Successfully extracted pure KML from KMZ!');
          }
      } catch (err: any) {
          console.error("Conversion Error:", err);
          toast.error(`Error during conversion: ${err.message || 'Unknown zip error'}`);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden gap-3 pb-2 text-center">
       
        <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
           <BoltIcon className="w-5 h-5 flex-shrink-0 text-emerald-600" />
           <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                KML / KMZ Transformation <span className="mx-2 text-emerald-300 select-none">|</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70 font-normal">Instant Client-Side Processing & Privacy</span>
           </p>
        </div>

       <div className="flex-1 flex flex-col gap-6 min-h-0">
           {/* Dropzone */}
           <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    group relative flex transition-all duration-500 ease-in-out border-2 border-dashed rounded-xl
                    ${file 
                        ? 'flex-row items-center justify-between p-4 max-w-2xl mx-auto w-full border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm' 
                        : 'flex-col items-center justify-center flex-1 p-12 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400 hover:bg-emerald-50/10'
                    }
                    ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]' : ''}
                `}
            >
            {file ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                        <DocumentCheckIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left overflow-hidden">
                        <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 truncate max-w-sm">
                            {file.name}
                        </h3>
                        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                            Ready to convert to {targetExt.toUpperCase()}
                        </p>
                    </div>
                  </div>
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                      }}
                      className="p-2 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-600 hover:text-red-500 rounded-full transition-colors flex-shrink-0"
                      title="Remove file"
                  >
                      <XMarkIcon className="w-6 h-6" />
                  </button>
                </>
            ) : (
                <>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <CloudArrowUpIcon className="w-12 h-12 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    
                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">
                        Drag & drop a KML or KMZ file here
                    </h3>
                    
                    <p className="text-gray-500 mb-6 font-medium">or</p>
                    <label className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer font-medium transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95">
                        Browse Files
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".kml,.kmz"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileDrop(e.target.files[0]);
                                    e.target.value = '';
                                }
                            }}
                        />
                    </label>
                </>
            )}
        </div>

        {/* Action Button */}
        {file && (
            <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-4">
                <button
                    onClick={executeConversion}
                    disabled={isProcessing}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-lg w-full max-w-sm justify-center"
                >
                    {isProcessing ? (
                        <>
                           <ArrowPathIcon className="w-6 h-6 animate-spin" />
                           Processing Fast...
                        </>
                    ) : (
                        <>
                           <ArrowPathIcon className="w-6 h-6" />
                           Convert to {targetExt.toUpperCase()}
                        </>
                    )}
                </button>
            </div>
        )}
        </div>
    </div>
  );
};

export default KmlKmzConverterPage;
