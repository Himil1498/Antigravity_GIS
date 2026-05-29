import React, { useState } from 'react';
import { X, Download, MapPin, ChevronDown, ChevronUp, Type, ChevronLeft, ChevronRight, Maximize2, Minimize2, Info, Loader } from 'lucide-react';
import * as xlsx from 'xlsx';
import { toast } from 'react-toastify';
import './AutoFeasibility.css';

interface AutoFeasibilityResultsProps {
  results: any[];
  onClose: () => void;
  onClear: () => void;
  onShowElevationProfile?: (result: any) => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  isFocused?: boolean;
  setIsFocused?: (v: boolean) => void;
  onUpdateResults?: (results: any[]) => void;
}

const ResultCard = ({ r, onShowElevationProfile, onUpdateResult }: { r: any, onShowElevationProfile?: (r: any) => void, onUpdateResult?: (updatedR: any) => void }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [elevData, setElevData] = useState<{max: number, min: number, gain: number} | null>(null);
  const [loadingElev, setLoadingElev] = useState(false);
  const [selectedAltIndex, setSelectedAltIndex] = useState(r.selectedAltIndex || 0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (r.selectedAltIndex !== undefined) {
      setSelectedAltIndex(r.selectedAltIndex);
    }
  }, [r.selectedAltIndex]);

  const currentInfra = (r.available_infras && r.available_infras.length > 0) 
    ? r.available_infras[selectedAltIndex] 
    : r.nearest_infra;
  const currentDistance = currentInfra ? currentInfra.distance_meters : r.distance_meters;
  
  let isFeasible = r.is_feasible;
  let unfeasibleReasons = [];

  // 1. Distance constraints (from backend)
  if (r.unfeasible_reason) {
    unfeasibleReasons.push(r.unfeasible_reason);
  }

  // 2. Elevation / LOS constraints
  if (r.losChecked && !r.losClear) {
    isFeasible = false;
    unfeasibleReasons.push(`LOS Blocked: ${r.blockReason || 'Terrain obstacle'}`);
  }

  let unfeasibleReason = unfeasibleReasons.length > 0 
    ? unfeasibleReasons.join(' | ') 
    : 'Unknown reason';

  const handleToggleInfo = () => {
    setShowInfo(!showInfo);
  };

  React.useEffect(() => {
    if (showInfo && isFeasible && !elevData && currentInfra?.geom?.coordinates && !loadingElev) {
      let isMounted = true;
      const fetchElev = async () => {
        setLoadingElev(true);
        try {
          const elevator = new google.maps.ElevationService();
          const path = [
            { lat: r.lat, lng: r.lng },
            { lat: currentInfra.geom.coordinates[1], lng: currentInfra.geom.coordinates[0] }
          ];

          const response = await elevator.getElevationAlongPath({
            path: path,
            samples: 50
          });
          
          if (isMounted && response.results && response.results.length > 0) {
            const elevations = response.results.map(res => res.elevation);
            const max = Math.max(...elevations);
            const min = Math.min(...elevations);
            let totalGain = 0;
            for (let j = 1; j < elevations.length; j++) {
              const diff = elevations[j] - elevations[j-1];
              if (diff > 0) totalGain += diff;
            }
            setElevData({ max, min, gain: totalGain });
          }
        } catch(err) {
           console.warn("Elevation fetch failed", err);
        } finally {
          if (isMounted) setLoadingElev(false);
        }
      };
      fetchElev();
      return () => { isMounted = false; };
    }
  }, [showInfo, isFeasible, elevData, currentInfra, r.lat, r.lng]);
  const bgGradient = isFeasible 
    ? 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))' 
    : 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))';
  const borderColor = isFeasible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  const borderLeftColor = isFeasible ? '#10b981' : '#ef4444';
  const badgeText = isFeasible ? 'Feasible' : 'Not Feasible';
  const badgeBg = isFeasible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';

  return (
    <div style={{ 
      padding: '6px 8px', 
      border: `1px solid ${borderColor}`,
      borderLeft: `3px solid ${borderLeftColor}`,
      borderRadius: '6px', 
      background: bgGradient,
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        
        {/* Top Row: Title & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <p style={{ fontWeight: '600', fontSize: '12px', margin: 0, color: 'var(--text-primary, #111827)', wordBreak: 'break-all', flex: 1 }}>
            {r.name || r.uid || 'Location'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={handleToggleInfo} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #6b7280)' }} title="More Info">
              <Info size={14} className={showInfo ? 'text-blue-500' : ''} />
            </button>
            {r.losChecked && (
              <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 4px', borderRadius: '4px', background: r.losClear ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: r.losClear ? '#065f46' : '#991b1b' }} title={r.blockReason}>
                {r.losClear ? 'LOS Clear' : 'LOS Blocked'}
              </span>
            )}
            <span style={{ 
              fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
              background: badgeBg, color: 'inherit'
            }} className="dark:text-white text-slate-800">
              {badgeText}
            </span>
          </div>
        </div>
        
        {/* Bottom Row: Details & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
            <p style={{ fontSize: '10px', margin: '0 0 2px 0', color: 'var(--text-secondary, #4b5563)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Infra: <span style={{ fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{currentInfra?.name || 'N/A'}</span>
            </p>
            <p style={{ fontSize: '10px', margin: '0', color: 'var(--text-secondary, #4b5563)' }}>
              Distance: <span style={{ fontWeight: '500' }}>{currentDistance ? (currentDistance / 1000).toFixed(2) + ' km' : 'N/A'}</span>
            </p>
            {!isFeasible && (
              <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#ef4444', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Info size={10} /> {unfeasibleReason}
              </p>
            )}
          </div>
          
          {onShowElevationProfile && isFeasible && (
            <button 
              onClick={() => onShowElevationProfile(r)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', 
                fontSize: '10px', fontWeight: '600', background: '#10b981', color: '#fff', 
                border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.3)', flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <MapPin size={10} /> Elevation
            </button>
          )}
        </div>

        {/* Expanded Details Panel */}
        {showInfo && (
          <div style={{ 
            marginTop: '8px', paddingTop: '8px', borderTop: `1px dashed ${borderColor}`,
            fontSize: '10px', color: 'var(--text-secondary, #4b5563)',
            display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary, #111827)' }}>Customer Coordinates:</strong><br/>
                {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
              </div>
              {currentInfra && (
                <div>
                  <strong style={{ color: 'var(--text-primary, #111827)' }}>Infra Coordinates:</strong><br/>
                  {currentInfra.geom?.coordinates[1]?.toFixed(5)}, {currentInfra.geom?.coordinates[0]?.toFixed(5)}
                </div>
              )}
            </div>
            {r.available_infras && r.available_infras.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: 'var(--text-primary, #111827)' }}>Top Alternatives ({r.available_infras.length}):</strong>
                <div style={{ position: 'relative', marginTop: '6px' }}>
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ 
                      width: '100%', 
                      fontSize: '11px', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      border: dropdownOpen ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                      background: dropdownOpen ? '#ffffff' : '#f8fafc',
                      color: '#0f172a',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: dropdownOpen ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedAltIndex + 1}. {r.available_infras[selectedAltIndex]?.name} - {(r.available_infras[selectedAltIndex]?.distance_meters / 1000).toFixed(2)} km
                    </span>
                    <ChevronDown size={14} color="#64748b" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>
                  
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      zIndex: 100,
                      padding: '4px'
                    }}>
                      {r.available_infras.map((alt: any, idx: number) => (
                        <div 
                          key={alt.id}
                          onClick={() => {
                            setSelectedAltIndex(idx);
                            setDropdownOpen(false);
                            setElevData(null);
                            if (onUpdateResult) {
                              const newNearest = r.available_infras[idx];
                              const updatedRow = {
                                ...r,
                                nearest_infra: newNearest,
                                distance_meters: newNearest.distance_meters,
                                selectedAltIndex: idx
                              };
                              onUpdateResult(updatedRow);
                            }
                          }}
                          style={{
                            padding: '6px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            background: idx === selectedAltIndex ? '#eff6ff' : 'transparent',
                            color: idx === selectedAltIndex ? '#1d4ed8' : '#334155',
                            fontWeight: idx === selectedAltIndex ? '600' : '400',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => { if(idx !== selectedAltIndex) e.currentTarget.style.background = '#f1f5f9'; }}
                          onMouseLeave={(e) => { if(idx !== selectedAltIndex) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {idx + 1}. {alt.name} - {(alt.distance_meters / 1000).toFixed(2)} km
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {isFeasible && (
              <div>
                <strong style={{ color: 'var(--text-primary, #111827)' }}>Elevation Profile Details:</strong>
                {loadingElev ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                     <Loader size={10} className="animate-spin" /> <span>Calculating...</span>
                  </div>
                ) : elevData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginTop: '6px', background: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '4px' }}>
                    <div><span style={{opacity: 0.8, fontSize: '9px'}}>Max Elev:</span><br/><strong style={{color: 'var(--text-primary, #111827)', fontSize: '11px'}}>{elevData.max.toFixed(1)} m</strong></div>
                    <div><span style={{opacity: 0.8, fontSize: '9px'}}>Min Elev:</span><br/><strong style={{color: 'var(--text-primary, #111827)', fontSize: '11px'}}>{elevData.min.toFixed(1)} m</strong></div>
                    <div><span style={{opacity: 0.8, fontSize: '9px'}}>Roughness:</span><br/><strong style={{color: 'var(--text-primary, #111827)', fontSize: '11px'}}>{elevData.gain.toFixed(1)} m</strong></div>
                  </div>
                ) : (
                  <div style={{ marginTop: '4px' }}>Failed to load elevation data.</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export const AutoFeasibilityResults: React.FC<AutoFeasibilityResultsProps> = ({
  results,
  onClose,
  onClear,
  onShowElevationProfile,
  showLabels,
  onToggleLabels,
  isFocused: isFocusedProp,
  setIsFocused: setIsFocusedProp,
  onUpdateResults,
}) => {
  const [internalFocused, setInternalFocused] = useState(false);
  const isFocused = isFocusedProp !== undefined ? isFocusedProp : internalFocused;
  const setIsFocused = setIsFocusedProp || setInternalFocused;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'feasible' | 'unfeasible'>('all');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const [localResults, setLocalResults] = useState(results);
  const [isLosRunning, setIsLosRunning] = useState(false);
  const [losProgress, setLosProgress] = useState(0);

  React.useEffect(() => {
    setLocalResults(results);
  }, [results]);

  if (!localResults || localResults.length === 0) return null;

  const feasibleCount = localResults.filter(r => r.is_feasible).length;
  const unfeasibleCount = localResults.length - feasibleCount;

  const runAutomatedLOS = async () => {
    setIsLosRunning(true);
    setLosProgress(0);
    const elevator = new google.maps.ElevationService();
    const updatedResults = [...localResults];
    let processed = 0;
    
    const toCheck = updatedResults.filter(r => r.available_infras && r.available_infras.length > 0);
    
    for (let i = 0; i < updatedResults.length; i++) {
      const r = updatedResults[i];
      if (!r.available_infras || r.available_infras.length === 0) continue;
      
      const targetIndex = r.selectedAltIndex !== undefined ? r.selectedAltIndex : 0;
      const infra = r.available_infras[targetIndex];
      
      let losClear = false;
      let losChecked = true;
      let blockReason = '';

      if (infra?.geom?.coordinates) {
        try {
          const path = [
            { lat: r.lat, lng: r.lng },
            { lat: infra.geom.coordinates[1], lng: infra.geom.coordinates[0] }
          ];
          const response = await elevator.getElevationAlongPath({ path, samples: 50 });
          
          if (response.results && response.results.length > 0) {
            // Assume Customer=10m, Tower=30m
            const e0 = response.results[0].elevation + 10;
            const en = response.results[response.results.length - 1].elevation + 30;
            
            let blocked = false;
            for (let k = 1; k < response.results.length - 1; k++) {
              const fraction = k / (response.results.length - 1);
              const lineElev = e0 + fraction * (en - e0);
              if (response.results[k].elevation > lineElev) {
                blocked = true;
                blockReason = `Terrain block at ${Math.round(fraction * 100)}% distance`;
                break;
              }
            }
            if (!blocked) {
              losClear = true;
            }
          }
        } catch (err) {
          console.warn("LOS Check failed", err);
          await new Promise(res => setTimeout(res, 500));
        }
      }

      updatedResults[i] = {
        ...r,
        losClear,
        losChecked,
        blockReason: !losClear ? blockReason : null,
        is_feasible: r.is_feasible && losClear, // Must pass BOTH distance constraints AND LOS constraints
        nearest_infra: r.available_infras[targetIndex],
        distance_meters: r.available_infras[targetIndex].distance_meters
      };

      setLocalResults([...updatedResults]);
      if (onUpdateResults) {
        onUpdateResults([...updatedResults]);
      }
      processed++;
      setLosProgress(Math.round((processed / toCheck.length) * 100));
      await new Promise(res => setTimeout(res, 300));
    }
    
    setIsLosRunning(false);
    toast.success("Automated LOS Check Complete!");
  };

  const handleExport = async (type: 'all' | 'feasible' | 'unfeasible') => {
    if (isExporting) return;
    setShowDownloadMenu(false);
    
    const resultsToExport = localResults.filter(r => {
      if (type === 'feasible') return r.is_feasible;
      if (type === 'unfeasible') return !r.is_feasible;
      return true; // all
    });

    if (resultsToExport.length === 0) {
      toast.warning("No results to export for this filter.");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      
      const elevator = new google.maps.ElevationService();
      const enrichedExportData = [];
      const totalToProcess = resultsToExport.filter(r => r.is_feasible && r.nearest_infra?.geom?.coordinates).length;
      let processed = 0;

      toast.info(`Starting enhanced export. Processing ${totalToProcess} paths...`, { autoClose: 2000 });

      for (let i = 0; i < resultsToExport.length; i++) {
        const r = resultsToExport[i];
        
        let maxElev = 'N/A';
        let minElev = 'N/A';
        let gain = 'N/A';
        
        if (r.is_feasible && r.nearest_infra?.geom?.coordinates) {
          try {
             const path = [
               { lat: r.lat, lng: r.lng },
               { lat: r.nearest_infra.geom.coordinates[1], lng: r.nearest_infra.geom.coordinates[0] }
             ];
             const response = await elevator.getElevationAlongPath({
               path,
               samples: 50
             });
             
             if (response.results && response.results.length > 0) {
               const elevations = response.results.map(res => res.elevation);
               const max = Math.max(...elevations);
               const min = Math.min(...elevations);
               
               let totalGain = 0;
               for (let j = 1; j < elevations.length; j++) {
                  const diff = elevations[j] - elevations[j-1];
                  if (diff > 0) totalGain += diff;
               }
               
               maxElev = max.toFixed(2);
               minElev = min.toFixed(2);
               gain = totalGain.toFixed(2);
             }
          } catch(err) {
             console.warn("Elevation failed for one path", err);
          }
          processed++;
          setExportProgress(Math.round((processed / totalToProcess) * 100));
          // Delay to respect Google Maps API rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        enrichedExportData.push({
          Latitude: r.lat,
          Longitude: r.lng,
          ...r, // Include original properties
          Feasible: r.is_feasible ? 'Yes' : 'No',
          'Block/Unfeasible Reason': !r.is_feasible ? (r.blockReason || r.unfeasible_reason || 'Out of range / Terrain obstacle') : 'N/A',
          'Distance to Nearest Infra (m)': r.distance_meters ? r.distance_meters.toFixed(2) : 'N/A',
          'Nearest Infra Name': r.nearest_infra ? r.nearest_infra.name : 'N/A',
          'Max Elevation (m)': maxElev,
          'Min Elevation (m)': minElev,
          'Elevation Gain / Roughness (m)': gain
        });
      }

      // Remove internal fields from export
      enrichedExportData.forEach(item => {
        delete item.uid;
        delete item.originalIndex;
        delete item.is_feasible;
        delete item.distance_meters;
        delete item.nearest_infra;
        delete item.lat;
        delete item.lng;
        delete item.losChecked;
        delete item.losClear;
        delete item.blockReason;
        delete item.unfeasible_reason;
        delete item.available_infras;
        delete item.selectedAltIndex;
      });

      const ws = xlsx.utils.json_to_sheet(enrichedExportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Feasibility Results");
      
      const fileNameSuffix = type === 'all' ? 'Merged' : (type === 'feasible' ? 'Feasible' : 'NotFeasible');
      xlsx.writeFile(wb, `Auto_Feasibility_${fileNameSuffix}_${new Date().getTime()}.xlsx`);
      toast.success("Results exported successfully with elevation data!");
    } catch (e) {
      toast.error("Failed to export results.");
      console.error(e);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <>
    <div 
      id="auto-feasibility-results-panel"
      className="af-results-panel"
      style={{
        top: 0,
        right: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: '24px',
        width: isExpanded ? '500px' : '268px',
        maxHeight: "calc(100vh - 64px - var(--elevation-drawer-height, 0px))",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: isFocused ? "translateX(110%)" : "none",
        opacity: isFocused ? 0 : 1,
        pointerEvents: isFocused ? 'none' : 'auto'
      }}
    >
      <div className="af-results-header" style={{ padding: '12px 16px' }}>
        <h3 className="af-modal-title" style={{ fontSize: '1rem', margin: 0 }}>
          <MapPin size={18} className="af-icon" /> Results
        </h3>
        <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
          <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} disabled={isExporting} className="af-close-btn" title={isExporting ? `Exporting ${exportProgress}%` : "Export Options"}>
            {isExporting ? <span style={{fontSize: '10px', fontWeight: 'bold'}}>{exportProgress}%</span> : <Download size={16} />}
          </button>
          
          {showDownloadMenu && !isExporting && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: 'white', border: '1px solid var(--border-medium, #d1d5db)',
              borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 50, display: 'flex', flexDirection: 'column', width: '160px',
              overflow: 'hidden'
            }}>
              <button onClick={() => handleExport('all')} style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Download Merged</button>
              <button onClick={() => handleExport('feasible')} style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', color: '#059669' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Download Feasible</button>
              <button onClick={() => handleExport('unfeasible')} style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Download Not Feasible</button>
            </div>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="af-close-btn" title={isExpanded ? "Shrink" : "Expand"}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => setIsFocused(true)} className="af-close-btn" title="Collapse">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { onClear(); onClose(); }} className="af-close-btn" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'var(--bg-secondary, #f9fafb)', borderBottom: '1px solid var(--border-light, #e5e7eb)' }}>
            <div 
              onClick={() => setFilterType('all')}
              style={{ display: 'flex', alignItems: 'baseline', gap: '4px', cursor: 'pointer', opacity: filterType === 'all' ? 1 : 0.4, transition: 'opacity 0.2s' }}
              title="Show All"
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary, #111827)' }}>{localResults.length}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>All</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-light, #d1d5db)' }} />
            <div 
              onClick={() => setFilterType('feasible')}
              style={{ display: 'flex', alignItems: 'baseline', gap: '4px', cursor: 'pointer', opacity: filterType === 'feasible' ? 1 : 0.4, transition: 'opacity 0.2s' }}
              title="Show Feasible Only"
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{feasibleCount}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feasible</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-light, #d1d5db)' }} />
            <div 
              onClick={() => setFilterType('unfeasible')}
              style={{ display: 'flex', alignItems: 'baseline', gap: '4px', cursor: 'pointer', opacity: filterType === 'unfeasible' ? 1 : 0.4, transition: 'opacity 0.2s' }}
              title="Show Not Feasible Only"
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>{unfeasibleCount}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Feasible</span>
            </div>
          </div>

          <div className="af-results-actions" style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light, #e5e7eb)' }}>
            {onToggleLabels && (
              <button onClick={onToggleLabels} className="af-btn-secondary" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px' }}>
                <Type size={14} /> {showLabels ? 'Hide Labels' : 'Show Labels'}
              </button>
            )}
            <button 
              onClick={runAutomatedLOS} 
              disabled={isLosRunning}
              className="af-btn-primary" 
              style={{ flex: '2 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px', background: isLosRunning ? '#fbbf24' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
              {isLosRunning ? <Loader size={14} className="animate-spin" /> : <MapPin size={14} />} 
              {isLosRunning ? `Checking LOS... ${losProgress}%` : 'Auto LOS Check'}
            </button>
          </div>

      <div className="af-results-list" style={{ flex: 1, overflowY: 'auto', padding: '8px 6px 16px', marginTop: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {localResults
          .filter(r => filterType === 'all' || (filterType === 'feasible' && r.is_feasible) || (filterType === 'unfeasible' && !r.is_feasible))
          .map((r, i) => (
          <ResultCard 
            key={r.uid || i} 
            r={r} 
            onShowElevationProfile={onShowElevationProfile} 
            onUpdateResult={(updatedR) => {
              const newResults = [...localResults];
              const index = newResults.findIndex(orig => orig.uid === updatedR.uid);
              if (index >= 0) {
                newResults[index] = updatedR;
                setLocalResults(newResults);
                if (onUpdateResults) {
                  onUpdateResults(newResults);
                }
              }
            }}
          />
        ))}
        {localResults.filter(r => filterType === 'all' || (filterType === 'feasible' && r.is_feasible) || (filterType === 'unfeasible' && !r.is_feasible)).length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', textAlign: 'center', marginTop: '12px' }}>
            No locations found for this filter.
          </p>
        )}
        </div>
      </div>
    </div>
    
    {isFocused && (
      <>
        <style>{`
          @keyframes bounceHorizontalLeftAF {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-4px); }
          }
          .animate-bounce-left-af {
            animation: bounceHorizontalLeftAF 1s infinite;
          }
        `}</style>
        <button
          onClick={() => setIsFocused(false)}
          className="fixed top-80 right-0 z-40 w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-l-lg border-y border-l border-amber-400/30 bg-amber-600/85 text-white shadow-[0_4px_20px_rgba(245,158,11,0.35)] backdrop-blur-xl hover:bg-amber-500/95 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
          title="Restore Results"
        >
          <ChevronLeft size={11} strokeWidth={3} className="text-white animate-bounce-left-af" />
          <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] mb-1">
            Results
          </span>
        </button>
      </>
    )}
    </>
  );
};
