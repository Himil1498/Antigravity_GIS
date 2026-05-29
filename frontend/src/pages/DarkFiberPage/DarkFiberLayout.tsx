import React, { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Map, Cable, Folder, 
  Trash2, Plus, Globe, ChevronLeft, ChevronRight,
  Database, Pencil
} from "lucide-react";
import { darkFiberApiService, DarkFiberFolder } from "../../services/darkFiberApiService";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getFolderIconKey } from "../../features/network-planning/components/NetworkMap/MapIcons";
import { RenderMapIcon } from "../../components/ui/RenderMapIcon";

const DarkFiberDashboard = lazy(() => import("./DarkFiberDashboard"));
const DarkFiberMap = lazy(() => import("./DarkFiberPage"));
const DarkFiberRecycleBin = lazy(() => import("./DarkFiberRecycleBin"));

type TabKey = "dashboard" | "map" | "recycle";

const DarkFiberLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = (searchParams.get('tab') as TabKey) || "dashboard";
  
  const [activeTab, setActiveTab] = useState<TabKey>(urlTab);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);
  const [jumpToFeature, setJumpToFeature] = useState<any>(null);
  const [folders, setFolders] = useState<DarkFiberFolder[]>([]);
  const [foldersLoaded, setFoldersLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    return localStorage.getItem("dark_fiber_sidebar_open") !== "false";
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(() => {
    try {
      const cached = localStorage.getItem("dark_fiber_expanded_folders");
      return cached ? new Set(JSON.parse(cached)) : new Set();
    } catch (e) {
      return new Set();
    }
  });
  const [addingSubfolderTo, setAddingSubfolderTo] = useState<number | null>(null);
  const [subfolderName, setSubfolderName] = useState("");

  // Sync sidebar collapse state to localStorage
  useEffect(() => {
    localStorage.setItem("dark_fiber_sidebar_open", String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Sync expanded folders state to localStorage
  useEffect(() => {
    localStorage.setItem("dark_fiber_expanded_folders", JSON.stringify(Array.from(expandedFolders)));
  }, [expandedFolders]);

  // Sync active tab state to localStorage
  useEffect(() => {
    localStorage.setItem("dark_fiber_active_tab", activeTab);
  }, [activeTab]);

  // Sync selected folder ID state to localStorage
  useEffect(() => {
    if (selectedFolderId !== undefined) {
      localStorage.setItem("dark_fiber_selected_folder_id", String(selectedFolderId));
    } else {
      localStorage.removeItem("dark_fiber_selected_folder_id");
    }
  }, [selectedFolderId]);

  // Restore active workspace states from localStorage if no query parameters exist in current URL
  useEffect(() => {
    if (foldersLoaded) {
      const hasTab = searchParams.has('tab');
      const hasFolder = searchParams.has('folder');
      
      if (!hasTab && !hasFolder) {
        const cachedTab = localStorage.getItem("dark_fiber_active_tab") as TabKey;
        const cachedFolderIdStr = localStorage.getItem("dark_fiber_selected_folder_id");
        
        let targetTab = cachedTab || "dashboard";
        let targetFolderId: number | undefined = undefined;
        
        if (cachedFolderIdStr) {
          const folderId = parseInt(cachedFolderIdStr, 10);
          if (!isNaN(folderId) && folders.some(f => f.id === folderId)) {
            targetFolderId = folderId;
          }
        }
        
        if (targetTab !== activeTab || targetFolderId !== selectedFolderId) {
          if (targetTab) setActiveTab(targetTab);
          setSelectedFolderId(targetFolderId);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foldersLoaded]);

  // Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // 1. Sync URL -> State
  useEffect(() => {
    const tab = (searchParams.get('tab') as TabKey) || "dashboard";
    if (tab && ["dashboard", "map", "recycle"].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
    
    // Only resolve folder name to ID once folders are loaded
    if (foldersLoaded && folders.length > 0) {
      const folderPath = searchParams.get('folder');
      if (folderPath) {
        const parts = folderPath.split('/');
        const targetName = parts[parts.length - 1];
        
        let found = folders.find(f => f.name === targetName);
        
        // Try to find an exact path match in case of duplicate folder names
        const exactMatch = folders.find(f => {
           if (f.name !== targetName) return false;
           let current: any = f;
           for (let i = parts.length - 2; i >= 0; i--) {
             if (!current.parent_id) return false;
             current = folders.find(p => p.id === current.parent_id);
             if (!current || current.name !== parts[i]) return false;
           }
           return !current.parent_id;
        });

        if (exactMatch) found = exactMatch;

        if (found && found.id !== selectedFolderId) {
          setSelectedFolderId(found.id);
          
          // Auto-expand parents
          setExpandedFolders(prev => {
            const next = new Set(prev);
            let current: any = found;
            while (current && current.parent_id) {
              const pId = current.parent_id;
              next.add(pId);
              current = folders.find((f: any) => f.id === pId);
            }
            return next;
          });
        }
      } else if (!folderPath && selectedFolderId !== undefined) {
        setSelectedFolderId(undefined);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, foldersLoaded, folders]); 

  // Helper to build full path string
  const getFullFolderPath = (id: number) => {
    let current: DarkFiberFolder | undefined = folders.find(f => f.id === id);
    if (!current) return '';
    const path = [current.name];
    while (current && current.parent_id) {
       const pId: number = current.parent_id;
       current = folders.find((f: DarkFiberFolder) => f.id === pId);
       if (current) path.unshift(current.name);
       else break;
    }
    return path.join('/');
  };

  // 2. Sync State -> URL
  const isInitialLoad = React.useRef(true);
  useEffect(() => {
    if (!foldersLoaded) return; // Prevent stripping URL before data is ready
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      let changed = false;

      // Clean up legacy folderId parameter if present
      if (newParams.has('folderId')) {
        newParams.delete('folderId');
        changed = true;
      }

      if ((newParams.get('tab') || 'dashboard') !== activeTab) {
        newParams.set('tab', activeTab);
        changed = true;
      }

      const currentFolderPath = newParams.get('folder') || '';
      const newFolderPath = selectedFolderId !== undefined ? getFullFolderPath(selectedFolderId) : '';

      if (currentFolderPath !== newFolderPath) {
        if (newFolderPath) {
          newParams.set('folder', newFolderPath);
        } else {
          newParams.delete('folder');
        }
        changed = true;
      }

      return changed ? newParams : prevParams;
    }, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedFolderId, foldersLoaded]);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await darkFiberApiService.getFolders();
      setFolders(res.data);
      setFoldersLoaded(true);
    } catch (err) {
      toast.error("Failed to load customer folders");
    }
  };

  const handleCreateFolder = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const name = parentId ? subfolderName : newFolderName;
    if (!name.trim()) return;
    try {
      const res = await darkFiberApiService.createFolder(name, parentId);
      if (parentId) {
        setSubfolderName("");
        setAddingSubfolderTo(null);
        // Automatically expand the parent to show the new child
        const next = new Set(expandedFolders);
        next.add(parentId);
        setExpandedFolders(next);
        // Automatically select the newly created child folder
        if (res.data && res.data.id) {
          setSelectedFolderId(res.data.id);
        }
      } else {
        setNewFolderName("");
        setShowAddFolder(false);
        if (res.data && res.data.id) {
          setSelectedFolderId(res.data.id);
        }
      }
      fetchFolders();
      toast.success(parentId ? "Folder added to Customer" : "Customer folder created");
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleViewOnMap = (feature: any) => {
    setJumpToFeature(feature);
    setActiveTab("map");
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const handleDeleteFolder = (folder: DarkFiberFolder) => {
    if (folder.name === 'General') {
       return toast.warning("The 'General' folder cannot be deleted.");
    }

    showConfirm(
      "Remove Customer Folder",
      `Are you sure you want to move '${folder.name}' to the Recycle Bin? This will also move ALL associated infrastructure batches to the bin.`,
      async () => {
        try {
          await darkFiberApiService.deleteFolder(folder.id);
          toast.success("Folder moved to Recycle Bin");
          if (selectedFolderId === folder.id) {
             setSelectedFolderId(undefined);
          }
          fetchFolders();
        } catch (err) {
          toast.error("Failed to delete folder");
        }
      }
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
      
      {/* Top Navbar — UNIFIED FOR ALL TABS */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0 z-30 shadow-sm relative">
         <div className="flex items-center gap-2">
          <h1 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
             <Cable className="w-6 h-6 text-teal-500" />
              Dark Fiber <span className="text-gray-300 mx-1">/</span> 
              <span className="text-teal-600 dark:text-teal-400">
                {(() => {
                  if (!selectedFolderId) return "Global View";
                  let current: DarkFiberFolder | undefined = folders.find(f => f.id === selectedFolderId);
                  if (!current) return "...";
                  
                  const path = [current.name];
                  while (current && current.parent_id) {
                     const pId: number = current.parent_id;
                     current = folders.find((p: DarkFiberFolder) => p.id === pId);
                     if (current) path.unshift(current.name);
                     else break;
                  }

                  if (path.length > 1) {
                    return (
                      <span className="flex items-center">
                        {path.slice(0, -1).map((p, i) => (
                          <React.Fragment key={i}>
                            <span className="opacity-50 font-bold">{p}</span>
                            <span className="text-gray-300 mx-1.5 opacity-50">/</span>
                          </React.Fragment>
                        ))}
                        {path[path.length - 1]}
                      </span>
                    );
                  }
                  return path[0];
                })()}
              </span>
          </h1>
       </div>

       <div className="flex items-center gap-3">
            <div id="map-tools-portal" className="flex items-center relative" />

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">
               <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />} label="Dashboard" />
               <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<Map className={`w-4 h-4 ${activeTab === 'map' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />} label="Map" />
             </div>
       </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
               {/* City Folder Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 300 : 0 }}
          className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative flex-shrink-0 overflow-hidden rounded-br-[2rem] ${
            isSidebarOpen ? 'border-r' : 'border-r-0'
          }`}
        >
          {/* Inner Wrapper for Content (Stays 300px so it clips when parent shrinks) */}
            <div className="w-[300px] h-full flex flex-col overflow-hidden rounded-br-[2rem] bg-white dark:bg-gray-800">
              {/* Sidebar Header - Compact */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-600 rounded shadow-md">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h2 className="font-semibold text-gray-900 dark:text-white tracking-tight text-sm">Infrastructure</h2>
                    <p className="text-xs text-gray-500 font-medium">City-wise Topology</p>
                  </div>
                </div>
              </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
           
           <FolderItem 
             icon={<Globe className="w-4 h-4" />} 
             label="Global View" 
             active={selectedFolderId === undefined} 
             onClick={() => { setSelectedFolderId(undefined); if (activeTab === 'recycle') setActiveTab('dashboard'); }}
           />

           <div className="pt-4 pb-2 px-3">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customers</span>
                 <button onClick={() => setShowAddFolder(!showAddFolder)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white">
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
           </div>

           {showAddFolder && (
              <form onSubmit={handleCreateFolder} className="px-3 mb-4 animate-in fade-in slide-in-from-top-2">
                 <input 
                   autoFocus
                   type="text" 
                   value={newFolderName}
                   onChange={(e) => setNewFolderName(e.target.value)}
                   placeholder="Enter customer folder name..."
                   className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500/20 outline-none"
                 />
              </form>
           )}

            {/* Render Hierarchical Tree */}
            {(() => {
              const renderFolderNode = (folder: DarkFiberFolder, level: number = 0, parentFolder?: DarkFiberFolder) => {
                const children = folders.filter(f => f.parent_id === folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                const hasChildren = children.length > 0;
                
                return (
                  <div key={folder.id} className={`space-y-1 ${level > 0 ? 'ml-6 border-l border-gray-100 dark:border-gray-700/50 pl-2 mt-1' : ''}`}>
                    <FolderItem 
                      icon={(() => {
                        const sysIcon = getFolderIconKey(folder, parentFolder?.name);
                        if (sysIcon) {
                          return <RenderMapIcon type={sysIcon} className="w-4 h-4 shrink-0" />;
                        }
                        return level === 0 
                          ? <Map className="w-4 h-4 text-teal-600 dark:text-teal-500" /> 
                          : <Folder className="w-4 h-4 opacity-70" />;
                      })()}
                      label={folder.name} 
                      active={selectedFolderId === folder.id} 
                      onClick={() => { setSelectedFolderId(folder.id); if (activeTab === 'recycle') setActiveTab('dashboard'); }}
                      onDelete={() => handleDeleteFolder(folder)}
                      onRename={async (newName) => {
                        await darkFiberApiService.updateFolder(folder.id, newName);
                        fetchFolders();
                      }}
                      onAddSubfolder={() => { 
                        setAddingSubfolderTo(prev => prev === folder.id ? null : folder.id);
                        if (addingSubfolderTo !== folder.id) {
                          const next = new Set(expandedFolders);
                          next.add(folder.id);
                          setExpandedFolders(next);
                        }
                      }}
                      onToggleExpand={hasChildren ? () => {
                        const next = new Set(expandedFolders);
                        if (next.has(folder.id)) next.delete(folder.id);
                        else next.add(folder.id);
                        setExpandedFolders(next);
                      } : undefined}
                      isExpanded={isExpanded}
                      hasChildren={hasChildren}
                      level={level}
                    />

                    {/* Subfolder Creation Context */}
                    {addingSubfolderTo === folder.id && (
                      <form onSubmit={(e) => handleCreateFolder(e, folder.id)} className="ml-8 mr-3 mb-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          autoFocus
                          type="text" 
                          value={subfolderName}
                          onChange={(e) => setSubfolderName(e.target.value)}
                          placeholder={`Folder in ${folder.name}...`}
                          className="w-full text-[11px] p-1.5 bg-white dark:bg-gray-800 border border-teal-500/30 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/10"
                        />
                      </form>
                    )}

                    {/* Render Children */}
                    {isExpanded && children.map(child => renderFolderNode(child, level + 1, folder))}
                  </div>
                );
              };

              return folders.filter(f => !f.parent_id).map(rootFolder => renderFolderNode(rootFolder, 0));
            })()}
        </div>

        {/* Bottom Actions: Recycle Bin */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-1 rounded-br-[2rem] bg-white dark:bg-gray-800 relative z-10">
           <FolderItem 
             icon={<Trash2 className="w-4 h-4" />} 
             label="Recycle Bin" 
             active={activeTab === 'recycle'} 
             onClick={() => setActiveTab('recycle')}
             danger
           />
        </div>
      </div>
    </motion.aside>

    {/* Toggle Button - Collapse (Match Staff Surveys UI) */}
    <motion.button
      onClick={() => setIsSidebarOpen(false)}
      animate={{ 
        left: isSidebarOpen ? 288 : -24,
        opacity: isSidebarOpen ? 1 : 0,
        pointerEvents: isSidebarOpen ? "auto" : "none"
      }}
      transition={{ duration: 0.2 }}
      className="absolute top-1/2 -translate-y-1/2 z-[41] w-5 h-16 bg-white/95 dark:bg-slate-900/95 border border-l-0 border-gray-200/50 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-r-[12px] flex items-center justify-center hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:w-6 transition-all cursor-pointer"
      title="Hide Sidebar"
    >
      <ChevronLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 font-bold" />
    </motion.button>

    {/* Geometry-style Restore Pull-Tab Button when Sidebar is Collapsed */}
    <AnimatePresence>
      {!isSidebarOpen && (
        <motion.button
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-52 left-0 z-[41] w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-r-lg border-y border-r border-teal-400/30 bg-teal-600/85 dark:bg-teal-700/85 text-white shadow-[0_4px_20px_rgba(13,148,136,0.35)] backdrop-blur-xl hover:bg-teal-500/95 dark:hover:bg-teal-600/95 cursor-pointer hover:scale-105"
          title="Restore Customers"
        >
          <ChevronRight size={11} strokeWidth={3} className="text-white" />
          <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] rotate-180 mb-1">
            Customers
          </span>
        </motion.button>
      )}
    </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-teal-500" />
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${selectedFolderId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "dashboard" && (
                  <DarkFiberDashboard 
                    selectedFolderId={selectedFolderId} 
                    onViewOnMap={handleViewOnMap} 
                    onSwitchToMap={() => setActiveTab('map')}
                  />
                )}
                {activeTab === "map" && (
                  <DarkFiberMap 
                    selectedFolderId={selectedFolderId}
                    folders={folders}
                    jumpToFeature={jumpToFeature} 
                    onJumpFinished={() => setJumpToFeature(null)}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}
                {activeTab === "recycle" && (
                  <DarkFiberRecycleBin 
                    onRestored={() => { fetchFolders(); if (selectedFolderId) setSelectedFolderId(undefined); }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

/* --- MINI COMPONENTS --- */

interface FolderItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
  onDelete?: () => void;
  onAddSubfolder?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  hasChildren?: boolean;
  level?: number;
  onRename?: (newName: string) => Promise<void>;
}

const FolderItem: React.FC<FolderItemProps> = ({ 
  icon, 
  label, 
  active, 
  onClick, 
  danger, 
  onDelete,
  onAddSubfolder,
  onToggleExpand,
  isExpanded,
  hasChildren,
  level = 0,
  onRename
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(label);
  const [isSaving, setIsSaving] = React.useState(false);

  return (
  <div 
    className={`
      w-full flex items-center gap-2 px-1 py-1 rounded-lg transition-all group relative
      ${active 
        ? (danger 
            ? 'bg-red-50 dark:bg-red-500/10 shadow-sm' 
            : 'bg-teal-500/5 shadow-sm ring-1 ring-teal-500/20')
        : (danger 
            ? 'hover:bg-red-50/50 dark:hover:bg-red-900/20' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50')
      }
    `}
  >
    {onToggleExpand && (
      <div 
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} 
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggleExpand(); } }}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-transform cursor-pointer flex-shrink-0 z-10"
      >
        <ChevronRight className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>
    )}

    {isEditing ? (
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        autoFocus
        disabled={isSaving}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!editName.trim() || !onRename) return;
            setIsSaving(true);
            try {
              await onRename(editName);
              setIsEditing(false);
              toast.success("Folder renamed successfully");
            } catch (err) {
              toast.error("Failed to rename folder");
              setEditName(label); // Revert
            } finally {
              setIsSaving(false);
            }
          } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditName(label);
          }
        }}
        onBlur={() => {
          setIsEditing(false);
          setEditName(label);
        }}
        className="flex-1 min-w-0 text-[13px] font-bold bg-white dark:bg-gray-800 border border-teal-500 rounded px-1 text-gray-900 dark:text-white outline-none w-full"
      />
    ) : (
      <button 
        type="button"
        onClick={onClick}
        className={`flex-1 flex items-center gap-2 min-w-0 text-left px-2 py-0.5 rounded cursor-pointer ${active ? (danger ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-400') : (danger ? 'text-red-400 group-hover:text-red-500' : 'text-gray-600 dark:text-gray-400')}`}
      >
        <div className={`transition-colors flex-shrink-0 ${active ? (danger ? 'text-red-500' : 'text-teal-500') : (danger ? 'text-red-400 group-hover:text-red-500' : 'text-gray-400 group-hover:text-gray-600')}`}>
          {icon}
        </div>
        <span className={`flex-1 min-w-0 text-sm tracking-tight truncate leading-tight pr-8 ${active ? 'font-semibold' : 'font-medium'}`} title={label}>{label}</span>
      </button>
    )}
    
    {!isEditing && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all flex-shrink-0 bg-white/90 dark:bg-gray-800/90 shadow-sm rounded backdrop-blur-sm pl-1 z-10">
        {onRename && (
          <div 
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setIsEditing(true); } }}
            className="p-1 text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-all cursor-pointer"
            title="Rename Folder"
          >
            <Pencil className="w-3.5 h-3.5" />
          </div>
        )}

        {onAddSubfolder && (
           <div 
             role="button"
             tabIndex={0}
             onClick={(e) => { e.stopPropagation(); onAddSubfolder(); }}
             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onAddSubfolder(); } }}
             className="p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-all cursor-pointer"
             title="Add Folder"
           >
             <Plus className="w-3.5 h-3.5" />
           </div>
        )}

        {onDelete && (
          <div 
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onDelete(); } }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
            title={`Delete ${label}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    )}
  </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-black rounded-lg transition-all flex items-center gap-2
      ${active 
        ? "bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-teal-600 dark:text-teal-400 shadow-[0_3px_0_0_rgba(13,148,136,0.15)] border border-gray-100 dark:border-gray-700 -translate-y-0.5" 
        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      }
      active:translate-y-0.5 active:shadow-none
    `}
  >
    {icon}
    {label}
  </button>
);

export default DarkFiberLayout;
