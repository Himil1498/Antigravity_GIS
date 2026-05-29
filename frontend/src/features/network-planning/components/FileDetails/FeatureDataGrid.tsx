import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Map, Eye, Settings, X, ArrowUp, ArrowDown, Download, Columns } from "lucide-react";
import { motion } from "framer-motion";
import { networkPlanningService } from "../../services/api";
import { showToast } from "../../../../utils/toastUtils";

interface FeatureDataGridProps {
  fileId: number;
  onEditFeature?: (feature: any) => void;
  onDeleteFeature?: (feature: any) => void;
  canEditForm?: boolean;
  canLiveEdit?: boolean;
  canDelete?: boolean;
  refreshTrigger?: number;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const FeatureDataGrid: React.FC<FeatureDataGridProps> = ({
  fileId,
  onEditFeature,
  onDeleteFeature,
  canEditForm = false,
  canLiveEdit = false,
  canDelete = false,
  refreshTrigger = 0,
  headerLeft,
  headerRight,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 0,
  });
  const [propertyKeys, setPropertyKeys] = useState<string[]>([]);
  const [hoverTooltip, setHoverTooltip] = useState<{
    x: number;
    y: number;
    text: string;
    visible: boolean;
  }>({ x: 0, y: 0, text: "", visible: false });

  const [isEditMode, setIsEditMode] = useState(false); // Legacy "Manage" mode (Modals)
  const [isLiveEditActive, setIsLiveEditActive] = useState(false); // Real-time In-line mode
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, any>>({});
  const [savingFeatureId, setSavingFeatureId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ASC" | "DESC" } | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  useEffect(() => {
    const savedHidden = localStorage.getItem(`opticonnect_grid_hidden_${fileId}`);
    if (savedHidden) {
      try { setHiddenColumns(new Set(JSON.parse(savedHidden))); } catch (e) {}
    }
  }, [fileId]);

  const toggleColumnVisibility = (key: string) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(key)) newHidden.delete(key);
    else newHidden.add(key);
    setHiddenColumns(newHidden);
    localStorage.setItem(`opticonnect_grid_hidden_${fileId}`, JSON.stringify(Array.from(newHidden)));
  };

  const handleExportCsv = () => {
    if (!data || data.length === 0) return;
    const headers = ['ID', 'Type', ...visiblePropertyKeys, 'Date'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
       const values = [
          row.id || '',
          getGeometryType(row.geometry),
          ...visiblePropertyKeys.map(k => {
             let val = row.properties?.[k];
             if (val === null || val === undefined) return '';
             if (typeof val === 'object') return '"[Object]"';
             return `"${String(val).replace(/"/g, '""')}"`;
          }),
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
       ];
       csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_data_${fileId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPropertyValue = (value: any) => {
    if (value === true || value === 'true' || value === 'True') {
      return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm uppercase">True</span>;
    }
    if (value === false || value === 'false' || value === 'False') {
      return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm uppercase">False</span>;
    }
    const strVal = String(value).toLowerCase();
    if (strVal === 'active' || strVal === 'online' || strVal === 'l1' || strVal === 'planned' || strVal === 'live') {
      return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm uppercase tracking-wider">{String(value)}</span>;
    }
    return String(value);
  };

  const fetchData = async (page = 1, search = searchQuery, sort = sortConfig) => {
    setLoading(true);
    try {
      const result = await networkPlanningService.getFileFeatures(
        fileId,
        page,
        12,
        search,
        sort?.key || "id",
        sort?.direction || "ASC"
      );

      let features = [];
      let total = 0;

      // Handle both paginated and flat responses
      if (Array.isArray(result)) {
        features = result;
        total = result.length;
      } else if (result.features) {
        features = result.features;
        total = result.pagination?.totalItems || result.features.length;
      } else if (result.data) {
        features = result.data;
        total = result.pagination?.total || result.total || features.length;
      }

      setData(features);
      setPagination((prev) => ({
        ...prev,
        page,
        totalItems: total,
        totalPages: Math.ceil(total / 12) || 1,
      }));

      // Extract keys from first item to show dynamic columns
      if (features.length > 0) {
        const first = features[0];
        const props = first.properties || {};
        
        // ── System keys always hidden ──
        const SYSTEM_KEYS = [
          "icon_type", "iconType", "description", "is_outcome",
          "source", "created_by", "updated_by", "updated_at",
          "created_at", "is_generated_link", "linked_site_id",
        ];

        // ── Type-aware column whitelists ──
        const CUSTOMER_WHITELIST = [
          "name", "circuitName", "productType", "connectedPop",
          "bandwidth", "mediaType", "customerAddress", "region",
          "state", "district", "city", "pincode",
          "circuit_id", "activated_at", "status",
        ];

        const POP_WHITELIST = [
          "name", "popId", "popType", "siteId", "infraProvider",
          "referenceNumber", "btsType", "gbtTowerHeight",
          "rttTowerHeight", "rttBuildingHeight", "height",
          "region", "country", "state", "district", "city", "area",
          "rackType", "powerSource", "powerPhase", "powerProvider",
          "acAvailability", "rackSpace", "ubrMountingPermission",
          "technicianName", "technicianNumber",
          "supervisorName", "supervisorNumber", "status",
        ];

        const GENERIC_INFRA_WHITELIST = [
          "name", "height", "street", "city", "state", "pincode",
          "contactName", "phone", "email",
          "isRented", "monthlyRent", "agreementStart", "agreementEnd",
          "landlordName", "landlordContact",
          "ownerName", "natureOfBusiness",
          "structureType", "powerSource", "upsAvailable",
          "upsCapacity", "backupCapacity", "bandwidth", "status",
        ];

        // Detect type from feature properties
        const iconType = (props.iconType || props.icon_type || "").toLowerCase();
        const isCustomer = iconType.includes("customer");
        const isPop = iconType === "pop";
        const isGenericInfra = !isCustomer && !isPop && (
          iconType.includes("bts") || iconType.includes("nni") ||
          iconType.includes("node") || iconType.includes("data center") ||
          iconType.includes("sub pop") || iconType.includes("bandwidth")
        );

        const isOutcome = props.is_outcome === true;

        // Choose the correct whitelist
        let activeWhitelist: string[] | null = null;
        if (isOutcome || isCustomer) {
          activeWhitelist = CUSTOMER_WHITELIST;
        } else if (isPop) {
          activeWhitelist = POP_WHITELIST;
        } else if (isGenericInfra) {
          activeWhitelist = GENERIC_INFRA_WHITELIST;
        }

        const keys = Object.keys(props).filter((k) => {
          // Always hide system keys
          if (SYSTEM_KEYS.includes(k)) return false;
          
          // If we have a whitelist, enforce it
          if (activeWhitelist && !activeWhitelist.includes(k)) return false;
          
          // Hide blank/empty fields
          const val = props[k];
          if (val === undefined || val === null || val === "" || val === "-") return false;
          
          return true;
        });

        // We store ALL valid keys here, slicing happens in render or derived state
        const savedOrder = localStorage.getItem(`opticonnect_grid_columns_${fileId}`);
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            // Verify saved keys match the current keys (no missing or extra)
            const isSameKeys = parsed.length === keys.length && parsed.every((k: string) => keys.includes(k));
            if (isSameKeys) {
              setPropertyKeys(parsed);
              return;
            }
          } catch (e) {}
        }
        setPropertyKeys(keys);
      }
    } catch (err) {
      console.error("Failed to load features", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      fetchData(1, searchQuery, sortConfig).finally(() => setIsSearching(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSort = (key: string) => {
    let direction: "ASC" | "DESC" = "ASC";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ASC") {
      direction = "DESC";
    }
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    fetchData(1, searchQuery, newConfig);
  };

  const moveColumn = (index: number, direction: number) => {
    const newKeys = [...propertyKeys];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newKeys.length) {
      [newKeys[index], newKeys[targetIndex]] = [newKeys[targetIndex], newKeys[index]];
      setPropertyKeys(newKeys);
      localStorage.setItem(`opticonnect_grid_columns_${fileId}`, JSON.stringify(newKeys));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
      fetchData(newPage);
    }
  };

  const getGeometryType = (geom: any) => {
    return geom?.type || "Unknown";
  };

  const handleMouseEnter = (e: React.MouseEvent, text: any) => {
    if (!text) return;
    setHoverTooltip({
      x: e.clientX,
      y: e.clientY,
      text: String(text),
      visible: true,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoverTooltip.visible) {
      setHoverTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleMouseLeave = () => {
    setHoverTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Derived columns based on mode and hidden toggles
  const visiblePropertyKeys = (isEditMode
    ? propertyKeys.slice(0, 5) // Limit in Edit Mode
    : propertyKeys).filter(k => !hiddenColumns.has(k));

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Unified Header & Toolbar ── */}
      <div className="flex items-center justify-between gap-6 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        
        {/* Left: Title & Info */}
        <div className="flex-shrink-0">
          {headerLeft}
        </div>

        {/* Center: Search Bar & Actions */}
        <div className="relative flex-1 max-w-xl mx-auto hidden sm:flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-indigo-500" />
              )}
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExportCsv} 
            className="flex items-center justify-center w-9 h-9 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-800 shadow-sm transition-colors" 
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {/* Column Toggles */}
          <div className="relative">
            <button 
              onClick={() => setShowColumnMenu(!showColumnMenu)} 
              className={`flex items-center justify-center w-9 h-9 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors ${showColumnMenu ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' : 'bg-white dark:bg-gray-800 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-800'}`}
              title="Toggle Columns"
            >
              <Columns className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto ring-1 ring-black ring-opacity-5">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2 pt-1">Toggle Columns</div>
                {propertyKeys.map(k => (
                  <label key={k} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={!hiddenColumns.has(k)} 
                      onChange={() => toggleColumnVisibility(k)} 
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate select-none">{k}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Mode Toggles & Close */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {(canEditForm || canLiveEdit || canDelete) && (
            <div
            className="relative flex items-center rounded-full"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(243,244,246,0.90) 100%)`,
              backdropFilter: 'blur(12px)',
              boxShadow: `inset 0 2px 6px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
              padding: '4px',
              border: '1px solid rgba(209,213,219,0.5)',
            }}
          >
            <motion.button
              onClick={() => {
                setIsEditMode(false);
                setIsLiveEditActive(false);
              }}
              whileTap={{ scale: 0.96, y: 1 }}
              initial="idle"
              whileHover="hover"
              animate={(!isEditMode && !isLiveEditActive) ? "active" : "idle"}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${(!isEditMode && !isLiveEditActive) ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
            >
              <motion.span
                className={`${(!isEditMode && !isLiveEditActive) ? "text-white" : "text-indigo-500"} flex-shrink-0 relative z-20`}
                variants={{
                  idle: { scale: 1, rotate: 0, y: 0 },
                  hover: { scale: 1.25, rotate: [0, -15, 15, 0], y: [0, -3, 0], transition: { duration: 0.4, y: { duration: 0.3, ease: "easeOut" } } },
                  active: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                }}
              >
                <Eye className="w-4 h-4" />
              </motion.span>
              <span className={`relative z-20 ${(!isEditMode && !isLiveEditActive) ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>View Data</span>
              {(!isEditMode && !isLiveEditActive) && (
                <>
                  <motion.div layoutId="view-data-pill-bg" className="absolute inset-0 rounded-full -z-10 bg-indigo-600" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ boxShadow: `0 3px 10px rgba(79,70,229,0.35), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)` }} />
                  <motion.div layoutId="view-data-pill-gloss" className="absolute inset-0 rounded-full -z-[5] overflow-hidden" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)` }} />
                </>
              )}
            </motion.button>
            {canEditForm && (
              <motion.button
                onClick={() => {
                  setIsEditMode(true);
                  setIsLiveEditActive(false);
                  setEditingFeatureId(null);
                }}
                whileTap={{ scale: 0.96, y: 1 }}
                initial="idle"
                whileHover="hover"
                animate={(isEditMode && !isLiveEditActive) ? "active" : "idle"}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${(isEditMode && !isLiveEditActive) ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
              >
                <motion.span
                  className={`{(isEditMode && !isLiveEditActive) ? "text-white" : "text-emerald-500"} flex-shrink-0 relative z-20`}
                  variants={{
                    idle: { scale: 1, rotate: 0, y: 0 },
                    hover: { scale: 1.25, rotate: [0, -15, 15, 0], y: [0, -3, 0], transition: { duration: 0.4, y: { duration: 0.3, ease: "easeOut" } } },
                    active: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                  }}
                >
                  <Settings className="w-4 h-4" />
                </motion.span>
                <span className={`relative z-20 ${(isEditMode && !isLiveEditActive) ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>Manage Features</span>
                {(isEditMode && !isLiveEditActive) && (
                  <>
                    <motion.div layoutId="manage-features-pill-bg" className="absolute inset-0 rounded-full -z-10 bg-emerald-600" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ boxShadow: `0 3px 10px rgba(5,150,105,0.35), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)` }} />
                    <motion.div layoutId="manage-features-pill-gloss" className="absolute inset-0 rounded-full -z-[5] overflow-hidden" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)` }} />
                  </>
                )}
              </motion.button>
            )}

            {canLiveEdit && (
              <motion.button
                onClick={() => {
                  setIsLiveEditActive(true);
                  setIsEditMode(false);
                }}
                whileTap={{ scale: 0.96, y: 1 }}
                initial="idle"
                whileHover="hover"
                animate={isLiveEditActive ? "active" : "idle"}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${isLiveEditActive ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
              >
                <motion.span
                  className={`${isLiveEditActive ? "text-white" : "text-amber-500"} flex-shrink-0 relative z-20`}
                  variants={{
                    idle: { scale: 1, rotate: 0, y: 0 },
                    hover: { scale: 1.25, rotate: [0, -15, 15, 0], y: [0, -3, 0], transition: { duration: 0.4, y: { duration: 0.3, ease: "easeOut" } } },
                    active: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </motion.span>
                <span className={`relative z-20 ${isLiveEditActive ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>Live Edit</span>
                {isLiveEditActive && (
                  <>
                    <motion.div layoutId="live-edit-pill-bg" className="absolute inset-0 rounded-full -z-10 bg-amber-600" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ boxShadow: `0 3px 10px rgba(217,119,6,0.35), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)` }} />
                    <motion.div layoutId="live-edit-pill-gloss" className="absolute inset-0 rounded-full -z-[5] overflow-hidden" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)` }} />
                  </>
                )}
              </motion.button>
            )}
          </div>
        )}
        {headerRight}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {hoverTooltip.visible && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-y-full -translate-x-1/2 mt-[-8px] max-w-xs truncate"
            style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
          >
            {hoverTooltip.text}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {data.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
                <Map className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No features found</p>
              <p className="text-sm text-gray-500 max-w-sm">Try adjusting your search query or upload new data to this file.</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th 
                    className="px-6 py-3.5 text-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      ID {sortConfig?.key === 'id' && (sortConfig.direction === 'ASC' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Type {sortConfig?.key === 'type' && (sortConfig.direction === 'ASC' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  {visiblePropertyKeys.map((key, index) => (
                    <th
                      key={key}
                      className="px-6 py-3.5 text-center text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider min-w-[150px] group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Left Arrow */}
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded absolute left-2 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); moveColumn(index, -1); }}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </button>

                        <span className="truncate max-w-[100px]">{key}</span>

                        {/* Sort Indicator */}
                        {sortConfig?.key === key && (
                          sortConfig.direction === 'ASC' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}

                        {/* Right Arrow */}
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded absolute right-2 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); moveColumn(index, 1); }}
                          disabled={index === visiblePropertyKeys.length - 1}
                        >
                          <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th 
                    className="px-6 py-3.5 text-center text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Date {sortConfig?.key === 'created_at' && (sortConfig.direction === 'ASC' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  {(isEditMode || isLiveEditActive) && (canEditForm || canLiveEdit || canDelete) && (
                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider w-32 sticky right-0 bg-gray-50 dark:bg-gray-800/50">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-50 dark:divide-gray-900">
                {data.map((row, idx) => {
                  if (!row) return null; // Skip invalid rows
                  const rowId = row.id || `row-${idx}`;
                  return (
                    <tr
                      key={rowId}
                      className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/30 group bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-6 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400 font-mono font-medium">
                        {row.id || "?"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border shadow-sm ${
                            getGeometryType(row.geometry) === "Point"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                              : getGeometryType(row.geometry) === "LineString" || getGeometryType(row.geometry) === "MultiLineString"
                              ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                          }`}
                        >
                          {getGeometryType(row.geometry)}
                        </span>
                      </td>
                      {visiblePropertyKeys.map((key) => (
                        <td
                          key={key}
                          className="px-5 py-3 text-center text-sm text-gray-600 dark:text-gray-400 max-w-[300px] truncate cursor-default group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
                          onMouseEnter={(e) =>
                            !isLiveEditActive && handleMouseEnter(e, row.properties?.[key])
                          }
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          {isLiveEditActive && editingFeatureId === row.id ? (
                            <input
                              type="text"
                              className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={localEdits[key] ?? row.properties?.[key] ?? ""}
                              onChange={(e) => setLocalEdits(prev => ({ ...prev, [key]: e.target.value }))}
                              autoFocus={visiblePropertyKeys[0] === key}
                            />
                          ) : (
                            row.properties?.[key] !== undefined && row.properties[key] !== null
                              ? typeof row.properties[key] === "object"
                                ? "{...}"
                                : renderPropertyValue(row.properties[key])
                              : <span className="text-gray-300 dark:text-gray-600">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-3 whitespace-nowrap text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString()
                          : "-"}
                      </td>
                        {/* Mode Check: isEditMode (Manage) or isLiveEditActive (Live Edit) */}
                        {(isEditMode || isLiveEditActive) && (canEditForm || canLiveEdit || canDelete) && (
                          <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-950 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors">
                            <div className="flex items-center justify-end gap-2">
                            {/* Hide Actions for Generated Links (Cascading Delete Only) */}
                            {row.properties?.is_generated_link ? (
                              <span className="text-xs text-gray-400 italic pr-2">
                                Linked
                              </span>
                            ) : (
                              <>
                                {isLiveEditActive ? (
                                  editingFeatureId === row.id ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={async () => {
                                          setSavingFeatureId(row.id);
                                          try {
                                             await networkPlanningService.updateFeature(row.id, localEdits);
                                             setData(prev => prev.map(f => f.id === row.id ? { ...f, properties: { ...f.properties, ...localEdits } } : f));
                                             setEditingFeatureId(null);
                                             showToast.success("Feature properties updated successfully!");
                                          } catch (e) {
                                             console.error("Save failed", e);
                                             showToast.error("Failed to save changes. Please try again.");
                                          } finally {
                                             setSavingFeatureId(null);
                                          }
                                        }}
                                        disabled={savingFeatureId === row.id}
                                        className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                                        title="Save"
                                      >
                                        {savingFeatureId === row.id ? (
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingFeatureId(null);
                                          setLocalEdits({});
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Cancel"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingFeatureId(row.id);
                                        setLocalEdits(row.properties || {});
                                      }}
                                      className="text-amber-600 hover:text-amber-800"
                                      title="Edit In-line"
                                      disabled={!canLiveEdit}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                      </svg>
                                    </button>
                                  )
                                ) : (
                                  <>
                                    {canEditForm && (
                                  <button
                                    onClick={() => onEditFeature?.(row)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    title="Edit (Form)"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                    </svg>
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => onDeleteFeature?.(row)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Delete"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination Bar ── */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3.5 flex items-center justify-between">
          <div className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>Page <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.page}</span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.totalPages || 1}</span></span>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <span><span className="font-semibold text-gray-700 dark:text-gray-200">{pagination.totalItems.toLocaleString()}</span> features</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Dynamic Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                // Center the current page if there are more than 5 pages
                if (pagination.totalPages > 5) {
                  if (pagination.page > 3 && pagination.page < pagination.totalPages - 1) {
                    pageNum = pagination.page - 2 + i;
                  } else if (pagination.page >= pagination.totalPages - 1) {
                    pageNum = pagination.totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex items-center justify-center min-w-[32px] h-8 rounded-md text-xs font-semibold shadow-sm transition-colors ${
                      pagination.page === pageNum
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

