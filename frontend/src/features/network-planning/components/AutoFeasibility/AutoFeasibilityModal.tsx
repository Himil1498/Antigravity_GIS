import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, X, MapPin, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { RenderMapIcon } from '../../../../components/ui/RenderMapIcon';
import { networkPlanningService } from '../../services/api';
import { getAllRegions } from '../../../../services/region/regionCoreService';
import { Region } from '../../../../services/region/types';
import { NetworkFolder } from '../../types';
import { toast } from 'react-toastify';
import './AutoFeasibility.css';

interface AutoFeasibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResults: (results: any[]) => void;
}

const STATIC_INFRA_TYPES = [
  'POP', 'Sub POP', 'Bandwidth BTS', 'Data Centers', 
  'Infra Provider', 'NNI', 'Node', 'Office Location'
];

export const AutoFeasibilityModal: React.FC<AutoFeasibilityModalProps> = ({
  isOpen,
  onClose,
  onResults,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedInfraType, setSelectedInfraType] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(20); // in km
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInfraDropdownOpen, setIsInfraDropdownOpen] = useState(false);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [workspaceFolders, setWorkspaceFolders] = useState<NetworkFolder[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMappedIconType = (type: string) => {
    const map: Record<string, string> = {
      'POP': 'POP',
      'Sub POP': 'SUB-POP',
      'Bandwidth BTS': 'BANDWIDTH-DROP-BTS',
      'Data Centers': 'DATA-CENTERS',
      'Infra Provider': 'INFRA-PROVIDER',
      'NNI': 'NNI',
      'Node': 'NODE',
      'Office Location': 'OFFICE-LOCATIONS'
    };
    return map[type] || type;
  };

  const [allFiles, setAllFiles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && availableRegions.length === 0) {
      getAllRegions()
        .then((res) => {
          if (res.success && res.regions) {
            setAvailableRegions(res.regions);
          }
        })
        .catch((err) => console.error("Failed to load regions", err));
    }
    
    if (isOpen && allFiles.length === 0) {
      networkPlanningService.getAllFiles()
        .then(res => setAllFiles(res))
        .catch(err => console.error("Failed to load all files for region filtering", err));
    }

    if (isOpen && workspaceFolders.length === 0) {
      networkPlanningService.getWorkspaceTree()
        .then(res => setWorkspaceFolders(res.folders))
        .catch(err => console.error("Failed to load workspace tree", err));
    }
  }, [isOpen, availableRegions.length, allFiles.length, workspaceFolders.length]);

  const infraProviders = useMemo(() => {
    if (selectedInfraType !== 'Infra Provider' || workspaceFolders.length === 0) return [];
    const infraFolder = workspaceFolders.find(f => f.name === 'Infra Provider');
    if (!infraFolder) return [];
    return workspaceFolders.filter(f => f.parent_id === infraFolder.id);
  }, [selectedInfraType, workspaceFolders]);

  const dynamicRegions = useMemo(() => {
    if (!selectedInfraType || allFiles.length === 0 || availableRegions.length === 0 || workspaceFolders.length === 0) return [];
    
    // Determine the active parent folder
    let parentFolder: NetworkFolder | undefined | null = null;
    if (selectedInfraType === 'Infra Provider') {
      if (!selectedProvider) return [];
      const infraProviderRoot = workspaceFolders.find(f => f.name === 'Infra Provider');
      parentFolder = workspaceFolders.find(f => f.name === selectedProvider && f.parent_id === infraProviderRoot?.id);
    } else {
      parentFolder = workspaceFolders.find(f => f.name === selectedInfraType);
    }

    if (!parentFolder) return [];

    const getDescendantIds = (folderId: number): number[] => {
      const children = workspaceFolders.filter(f => f.parent_id === folderId).map(f => f.id);
      let descendants = [...children];
      for (const childId of children) {
        descendants = descendants.concat(getDescendantIds(childId));
      }
      return descendants;
    };

    // Get children of the active parent folder
    const childFolders = workspaceFolders.filter(f => f.parent_id === parentFolder?.id);
    if (childFolders.length === 0) return [];

    const validRegionNames = new Set<string>();

    // For each child folder, check if it's a valid region AND has files
    childFolders.forEach(cf => {
      const isRegion = availableRegions.some(r => r.name.toLowerCase() === cf.name.toLowerCase());
      if (isRegion) {
        const folderIdsToCheck = new Set([cf.id, ...getDescendantIds(cf.id)]);
        const hasData = allFiles.some(file => file.folder_id && folderIdsToCheck.has(file.folder_id));
        if (hasData) {
          validRegionNames.add(cf.name.toLowerCase());
        }
      }
    });
    
    return availableRegions.filter(r => validRegionNames.has(r.name.toLowerCase()));
  }, [selectedInfraType, selectedProvider, allFiles, availableRegions, workspaceFolders]);

  const hasAnyData = useMemo(() => {
    if (!selectedInfraType || allFiles.length === 0 || workspaceFolders.length === 0) return false;
    
    let targetFolder = null;
    if (selectedInfraType === 'Infra Provider') {
      if (!selectedProvider) return infraProviders.length > 0;
      const infraProviderRoot = workspaceFolders.find(f => f.name === 'Infra Provider');
      targetFolder = workspaceFolders.find(f => f.name === selectedProvider && f.parent_id === infraProviderRoot?.id);
    } else {
      targetFolder = workspaceFolders.find(f => f.name === selectedInfraType);
    }

    if (!targetFolder) return false;

    const getDescendantIds = (folderId: number): number[] => {
      const children = workspaceFolders.filter(f => f.parent_id === folderId).map(f => f.id);
      let descendants = [...children];
      for (const childId of children) {
        descendants = descendants.concat(getDescendantIds(childId));
      }
      return descendants;
    };

    const folderIdsToCheck = new Set([targetFolder.id, ...getDescendantIds(targetFolder.id)]);
    return allFiles.some(f => f.folder_id && folderIdsToCheck.has(f.folder_id));
  }, [selectedInfraType, selectedProvider, allFiles, infraProviders, workspaceFolders]);

  const hasBaseFolderData = useMemo(() => {
    if (!selectedInfraType || allFiles.length === 0 || workspaceFolders.length === 0) return false;
    
    let targetFolder: NetworkFolder | undefined | null = null;
    if (selectedInfraType === 'Infra Provider') {
      if (!selectedProvider) return false;
      const infraProviderRoot = workspaceFolders.find(f => f.name === 'Infra Provider');
      targetFolder = workspaceFolders.find(f => f.name === selectedProvider && f.parent_id === infraProviderRoot?.id);
    } else {
      targetFolder = workspaceFolders.find(f => f.name === selectedInfraType);
    }

    if (!targetFolder) return false;

    // Check if any file is stored exactly in the target base folder
    return allFiles.some(f => f.folder_id === targetFolder?.id);
  }, [selectedInfraType, selectedProvider, allFiles, workspaceFolders]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleRegionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
    setSelectedRegionIds(selectedOptions);
  };

  const handleSubmit = async () => {
    if (!file || !selectedInfraType) return;
    
    setIsProcessing(true);
    try {
      const distanceInMeters = maxDistance * 1000;
      // We pass the provider name if 'Infra Provider' is selected, otherwise the infra type
      const targetInfra = selectedInfraType === 'Infra Provider' && selectedProvider ? selectedProvider : selectedInfraType;
      
      let targetFolderId = undefined;
      if (selectedInfraType === 'Infra Provider') {
        const infraProviderRoot = workspaceFolders.find(f => f.name === 'Infra Provider');
        targetFolderId = workspaceFolders.find(f => f.name === selectedProvider && f.parent_id === infraProviderRoot?.id)?.id;
      } else {
        targetFolderId = workspaceFolders.find(f => f.name === selectedInfraType)?.id;
      }

      const response = await networkPlanningService.checkAutoFeasibility(
        file, 
        targetInfra, 
        selectedRegionIds, 
        distanceInMeters,
        targetFolderId
      );
      toast.success(`Successfully processed ${(response.data as { total_processed: number }).total_processed} locations.`);
      onResults((response.data as { results: unknown[] }).results);
      onClose();
    } catch (error: unknown) {
      console.error("Auto Feasibility API Error:", ((error as { response?: { data?: { error?: string, message?: string } } }).response?.data));
      const errMsg = ((error as { response?: { data?: { error?: string, message?: string } } }).response?.data)?.error || ((error as { response?: { data?: { error?: string, message?: string } } }).response?.data)?.message || 'Failed to process file.';
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="af-modal-overlay">
      <div className="af-modal-container glass-panel">
        <div className="af-modal-header">
          <h2 className="af-modal-title">
            <MapPin className="af-icon" /> Auto Feasibility Checker
          </h2>
          <button onClick={onClose} className="af-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="af-modal-body">
          <div className="af-input-group" style={{ position: 'relative' }}>
            <label className="af-label">Target Infrastructure Type</label>
            <div 
              className="af-select" 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setIsInfraDropdownOpen(!isInfraDropdownOpen)}
            >
              {selectedInfraType ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RenderMapIcon type={getMappedIconType(selectedInfraType)} />
                  </div>
                  <span>{selectedInfraType}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-secondary, #6b7280)' }}>Select Infrastructure (e.g. POP)</span>
              )}
              <ChevronDown size={16} style={{ color: 'var(--text-secondary, #6b7280)' }} />
            </div>
            
            {isInfraDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: 'var(--surface-primary, #ffffff)',
                border: '1px solid var(--border-medium, #d1d5db)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
                zIndex: 50,
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {STATIC_INFRA_TYPES.map(type => (
                  <div 
                    key={type}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-light, #f3f4f6)'
                    }}
                    onClick={() => {
                      setSelectedInfraType(type);
                      setSelectedProvider(''); // Reset provider
                      setSelectedRegionIds([]);
                      setIsInfraDropdownOpen(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, #f3f4f6)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RenderMapIcon type={getMappedIconType(type)} />
                    </div>
                    <span style={{ color: 'var(--text-primary, #111827)' }}>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedInfraType === 'Infra Provider' && (
            <div className="af-input-group" style={{ position: 'relative' }}>
              <label className="af-label">Target Provider</label>
              <div 
                className="af-select" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
              >
                {selectedProvider ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedProvider}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-secondary, #6b7280)' }}>Select Provider (e.g. Airtel)</span>
                )}
                <ChevronDown size={16} style={{ color: 'var(--text-secondary, #6b7280)' }} />
              </div>
              
              {isProviderDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--surface-primary, #ffffff)',
                  border: '1px solid var(--border-medium, #d1d5db)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
                  zIndex: 50,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {infraProviders.length === 0 ? (
                    <div style={{ padding: '10px 12px', color: '#ef4444', fontStyle: 'italic', fontSize: '0.9em' }}>
                      No providers found under Infra Provider.
                    </div>
                  ) : (
                    infraProviders.map(provider => (
                      <div 
                        key={provider.id}
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-light, #f3f4f6)'
                        }}
                        onClick={() => {
                          setSelectedProvider(provider.name);
                          setSelectedRegionIds([]);
                          setIsProviderDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, #f3f4f6)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: 'var(--text-primary, #111827)' }}>{provider.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {selectedInfraType && (selectedInfraType !== 'Infra Provider' || selectedProvider) && (
            <div className="af-input-group">
              <label className="af-label">Target Regions (Optional)</label>
              <div 
                className="af-select" 
                style={{ 
                  maxHeight: '130px', 
                  overflowY: 'auto', 
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'var(--bg-primary, #fff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '6px'
                }}
              >
                {!hasAnyData ? (
                  <p style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '0.9em', padding: '4px' }}>
                    No data uploaded for {selectedInfraType} yet.
                  </p>
                ) : dynamicRegions.length === 0 ? (
                  <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px dashed #3b82f6' }}>
                    <p style={{ color: '#2563eb', fontSize: '0.9em', fontWeight: 500, margin: 0 }}>
                      Data is stored directly in the base folder.
                    </p>
                    <p style={{ color: '#3b82f6', fontSize: '0.85em', marginTop: '4px', marginBottom: 0 }}>
                      No region selection is needed. Feasibility will run against all available files.
                    </p>
                  </div>
                ) : (
                  <>
                    {hasBaseFolderData && (
                      <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px dashed #3b82f6', marginBottom: '12px' }}>
                        <p style={{ color: '#2563eb', fontSize: '0.85em', margin: 0 }}>
                          <strong>Note:</strong> Some data is stored directly in the base folder. Uncheck all regions to include it in your search.
                        </p>
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '8px', marginBottom: '4px' }}>
                      <input 
                        type="checkbox" 
                        checked={dynamicRegions.length > 0 && selectedRegionIds.length === dynamicRegions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRegionIds(dynamicRegions.map((r: Region) => r.id));
                          } else {
                            setSelectedRegionIds([]);
                          }
                        }}
                      />
                      Select All Regions
                    </label>
                    {dynamicRegions.map((r: Region) => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRegionIds.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRegionIds([...selectedRegionIds, r.id]);
                        } else {
                          setSelectedRegionIds(selectedRegionIds.filter(id => id !== r.id));
                        }
                      }}
                    />
                    {r.name}
                  </label>
                ))}
                </>
                )}
              </div>
            </div>
          )}
          
          <div className="af-input-group">
            <label className="af-label">Max Distance (KM)</label>
            <input 
              type="number" 
              className="af-input" 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #000)' }}
              value={maxDistance} 
              onChange={(e) => setMaxDistance(Number(e.target.value))} 
              min="1"
              max="500"
            />
          </div>

          <div 
            className={`af-dropzone ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".xlsx,.xls,.csv,.kml,.kmz" 
              onChange={handleFileChange} 
            />
            {file ? (
              <div className="af-file-success" style={{ position: 'relative' }}>
                <CheckCircle className="af-icon-success" size={32} />
                <p className="af-filename">{file.name}</p>
                <p className="af-filesize">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#fee2e2',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="af-dropzone-content">
                <Upload className="af-icon-upload" size={32} />
                <p>Drag & drop Excel or KML file here</p>
                <span className="af-subtext">or click to browse</span>
              </div>
            )}
          </div>
          
          <div className="af-info-box">
            <AlertTriangle size={16} />
            <span>Locations within {maxDistance}km of the selected infrastructure will be flagged as Feasible.</span>
          </div>
        </div>

        <div className="af-modal-footer">
          <button onClick={onClose} className="af-btn-secondary" disabled={isProcessing}>Cancel</button>
          <button 
            onClick={handleSubmit} 
            className="af-btn-primary"
            disabled={
              !file || 
              !selectedInfraType || 
              (selectedInfraType === 'Infra Provider' && !selectedProvider) || 
              isProcessing
            }
          >
            {isProcessing ? 'Processing...' : 'Check Feasibility'}
          </button>
        </div>
      </div>
    </div>
  );
};
