import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, RotateCcw, Clock,
  Folder, Cable, Database, RefreshCw, X as XMarkIcon, ChevronDown
} from 'lucide-react';
import { darkFiberApiService } from '../../services/darkFiberApiService';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationModal from '../../features/network-planning/components/Modals/DeleteConfirmationModal';

interface DarkFiberRecycleBinProps {
  onRestored: () => void;
}

const DarkFiberRecycleBin: React.FC<DarkFiberRecycleBinProps> = ({ onRestored }) => {
  const [loading, setLoading] = useState(true);
  const [recycleData, setRecycleData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Filter & Bulk states
  const [filterDate, setFilterDate] = useState<string>("");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteConfig, setBulkDeleteConfig] = useState<{
    isOpen: boolean;
    type: "all" | "date";
    date?: string;
    label?: string;
  }>({ isOpen: false, type: "all" });

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const fetchRecycleBin = async () => {
    try {
      setLoading(true);
      const res = await darkFiberApiService.getRecycleBin();
      setRecycleData(res.data);
    } catch (err) {
      toast.error("Failed to load recycle bin");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchRecycleBin();
    // Keep animation for at least 600ms for visual feedback
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  const toggleGroupCollapse = useCallback((label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const showConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' = 'danger') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, variant });
  };

  const handleRestore = (type: 'folder' | 'file', id: number, name: string) => {
    showConfirm(
      "Restore Item",
      `Are you sure you want to restore '${name}'? It will move back to your active city folders and dashboard.`,
      async () => {
        try {
          await darkFiberApiService.restoreItem(type, id);
          toast.success(`${type === 'folder' ? 'City Folder' : 'Import'} restored successfully`);
          fetchRecycleBin();
          onRestored();
        } catch (err) {
          toast.error("Failed to restore item");
        }
      },
      'warning'
    );
  };

  const handlePermanentDelete = (type: 'folder' | 'file', id: number, name: string) => {
    showConfirm(
      "Permanent Delete",
      `Are you sure you want to permanently delete '${name}'? This action is IRREVERSIBLE and will wipe all associated data.`,
      async () => {
        try {
          await darkFiberApiService.permanentDelete(type, id);
          toast.success("Item permanently removed");
          fetchRecycleBin();
        } catch (err) {
          toast.error("Failed to delete item permanently");
        }
      }
    );
  };

  const getRelativeDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredItems = React.useMemo(() => {
    let items = recycleData.map(item => ({
      ...item,
      _itemType: item.type === 'folder' ? 'folder' : 'file',
      _date: item.deleted_at || new Date().toISOString(),
      filename: item.type === 'file' ? item.name : undefined
    }));

    if (filterDate) {
      items = items.filter(item => {
        const d = new Date(item._date);
        const dateStr = d.toISOString().split('T')[0];
        return dateStr === filterDate;
      });
    }

    items.sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());
    return items;
  }, [recycleData, filterDate]);

  const groupedItems = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredItems.forEach((item) => {
      const label = getRelativeDateLabel(item._date);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });
    return Object.entries(grouped).map(([label, groupItems]) => ({ label, items: groupItems }));
  }, [filteredItems]);

  const executeBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      let itemsToDelete: { type: 'folder' | 'file'; id: number }[] = [];
      if (bulkDeleteConfig.type === 'all') {
        itemsToDelete = recycleData.map(item => ({ type: item.type, id: item.id }));
      } else if (bulkDeleteConfig.type === 'date' && bulkDeleteConfig.date) {
        const group = groupedItems.find(g => g.items.length > 0 && new Date(g.items[0]._date).toISOString().split('T')[0] === bulkDeleteConfig.date);
        if (group) {
           itemsToDelete = group.items.map(item => ({ type: item._itemType, id: item.id }));
        }
      }

      await Promise.all(itemsToDelete.map(item => darkFiberApiService.permanentDelete(item.type, item.id)));
      
      toast.success(bulkDeleteConfig.type === 'all' ? "Recycle bin emptied" : "Group cleared");
      await fetchRecycleBin();
      setBulkDeleteConfig({ ...bulkDeleteConfig, isOpen: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete: ${message}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (loading && recycleData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  const totalItems = recycleData.length;

  if (totalItems === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950">
         <div className="p-8 bg-gray-100 dark:bg-gray-900 rounded-full mb-6">
            <Database className="w-16 h-16 text-gray-300 dark:text-gray-700" />
         </div>
         <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Recycle Bin is Empty</h2>
         <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest whitespace-pre-wrap leading-relaxed max-w-[300px]">
            Infrastructure moved to trash will appear here for 30 days before automatic cleanup.
         </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      
      {/* Compact Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="bg-gray-50 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  Recycle Bin
                </h2>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} stored
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-8 pr-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-teal-500 transition-all outline-none min-w-[145px]"
                  />
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate("")}
                    className="flex items-center justify-center p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900/50 rounded-lg transition-all group"
                    title="Clear Date Filter"
                  >
                    <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {totalItems > 0 && (
                <button
                  onClick={() => setBulkDeleteConfig({ isOpen: true, type: 'all' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Bin</span>
                </button>
              )}

              {/* Animated Refresh Button */}
              <motion.button
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className="p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 dark:hover:border-teal-800 rounded-lg transition-all shadow-sm flex items-center justify-center"
                title="Refresh"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRefreshing ? { duration: 0.6, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'text-teal-500' : ''}`} />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar bg-gray-50/50 dark:bg-gray-950">
         <div className="w-full space-y-4 pb-12">
            
            {groupedItems.map((group) => {
              const isCollapsed = collapsedGroups.has(group.label);

              return (
                <div key={group.label}>
                  {/* Collapsible Date Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <button
                      onClick={() => toggleGroupCollapse(group.label)}
                      className="flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/20 rounded-lg border border-teal-100 dark:border-teal-800/40 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-900/50 dark:hover:to-emerald-900/40 transition-all cursor-pointer group"
                    >
                      <motion.div
                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      </motion.div>
                      <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-500 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </button>
                    <div className="flex-1 h-px bg-gradient-to-r from-teal-200 dark:from-teal-800/40 to-transparent"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const d = new Date(group.items[0]._date).toISOString().split('T')[0];
                        setBulkDeleteConfig({ isOpen: true, type: 'date', date: d, label: group.label });
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    >
                      Clear Group
                    </button>
                  </div>

                  {/* Collapsible Items Grid — 4 columns */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {group.items.map((item) => {
                            const isFolder = item._itemType === 'folder';
                            const title = isFolder ? item.name : item.filename;
                            const subtitle = isFolder ? "Entire City Infrastructure" : `City: ${item.folder_name || 'Unassigned'}`;
                            
                            return (
                              <motion.div
                                key={`${item._itemType}-${item.id}`}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow relative group"
                              >
                                {/* Header */}
                                <div className="flex items-start gap-2.5 mb-2">
                                  <div className="flex bg-gray-50 dark:bg-gray-700 p-1.5 rounded-md flex-shrink-0">
                                    {isFolder ? <Folder className="w-4 h-4 text-amber-500" /> : <Cable className="w-4 h-4 text-teal-500" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate leading-tight">
                                      {title}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase">
                                      {subtitle}
                                    </p>
                                  </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mb-2.5">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    {new Date(item._date).toLocaleString('en-IN', {
                                      day: '2-digit', month: 'short', year: 'numeric',
                                      hour: '2-digit', minute: '2-digit', hour12: true
                                    })}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 border-t border-gray-100 dark:border-gray-700 pt-2.5">
                                  <button
                                    onClick={() => handleRestore(item._itemType, item.id, title)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-xs">Restore</span>
                                  </button>

                                  <button
                                    onClick={() => handlePermanentDelete(item._itemType, item.id, title)}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    title="Permanently Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
         </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      <DeleteConfirmationModal
        isOpen={bulkDeleteConfig.isOpen}
        onClose={() => setBulkDeleteConfig({ ...bulkDeleteConfig, isOpen: false })}
        onConfirm={executeBulkDelete}
        itemName={bulkDeleteConfig.type === 'all' ? "the entire recycle bin" : `all items from ${bulkDeleteConfig.label}`}
        itemType="file"
        isDeleting={isBulkDeleting}
        isPermanent={true}
      />
    </div>
  );
};

export default DarkFiberRecycleBin;
