import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  RotateCcw,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { networkPlanningService } from "../../services/api";
import { useAppSelector } from "../../../../store";
import { usePermission } from "../../../../hooks/usePermission";
import { showToast } from "../../../../utils/toastUtils";
import { motion, AnimatePresence } from "framer-motion";

import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import RecycleBinDetailsModal from "./RecycleBinDetailsModal"; // Import Modal
import RestoreConfirmationModal from "./RestoreConfirmationModal"; // Import Restore Modal
import { EyeIcon, FolderIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline"; // Import Icon

interface RecycleBinItem {
  id: number;
  properties: any;
  latitude: number;
  longitude: number;
  deleted_at: string;
  deleted_by: number;
  deleted_by_name: string;
  created_by_name: string;
  folder_name: string | null;
  file_name: string | null;
  type?: "folder" | "file" | "feature";
}

const RecycleBinPanel: React.FC = () => {
  // Standard Item States
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<RecycleBinItem | null>(null);
  const [confirmRestoreItem, setConfirmRestoreItem] = useState<RecycleBinItem | null>(null);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecycleBinItem | null>(null);

  // New Bulk & Filter States
  const [filterDate, setFilterDate] = useState<string>("");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteConfig, setBulkDeleteConfig] = useState<{
    isOpen: boolean;
    type: "all" | "date";
    date?: string;
    label?: string;
  }>({ isOpen: false, type: "all" });

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const { user } = useAppSelector((state) => state.auth);
  const { can } = usePermission();

  const canRestore = can("network:recycle:restore");
  const canPermanentDelete = can("network:recycle:delete");

  const loadItems = useCallback(async (isInitial = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await networkPlanningService.getRecycleBin();
      setItems((data as unknown as RecycleBinItem[]) || []);
    } catch (err: any) {
      setError(err.message || "Failed to load recycle bin");
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    loadItems(true);
  }, [loadItems]);

  const handleRestore = (item: RecycleBinItem) => {
    setConfirmRestoreItem(item); // Open Confirmation
  };

  const executeRestore = async () => {
    if (!confirmRestoreItem) return;
    setActionLoading(confirmRestoreItem.id);
    try {
      await networkPlanningService.restoreItem(confirmRestoreItem.id, confirmRestoreItem.type || 'feature');
      setItems((prev) => prev.filter((item) => item.id !== confirmRestoreItem.id));
      setConfirmRestoreItem(null);
      showToast.success(`Item restored successfully`);
    } catch (err: any) {
      showToast.error(`Failed to restore: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDeleteItem) return;
    setActionLoading(confirmDeleteItem.id);
    try {
      await networkPlanningService.permanentDeleteItem(confirmDeleteItem.id, confirmDeleteItem.type || 'feature');
      setItems((prev) => prev.filter((item) => item.id !== confirmDeleteItem.id));
      setConfirmDeleteItem(null);
      showToast.success(`Item deleted permanently`);
    } catch (err: any) {
      showToast.error(`Failed to delete: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const executeBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      if (bulkDeleteConfig.type === 'all') {
        await networkPlanningService.emptyRecycleBin();
      } else if (bulkDeleteConfig.type === 'date' && bulkDeleteConfig.date) {
        await networkPlanningService.deleteRecycleBinByDate(bulkDeleteConfig.date);
      }
      await loadItems(false);
      setBulkDeleteConfig(prev => ({ ...prev, isOpen: false }));
      showToast.success(`Items deleted permanently`);
    } catch (err: any) {
      showToast.error(`Failed to delete: ${err.message}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleViewDetails = (item: RecycleBinItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const groupItemsByDate = (
    items: RecycleBinItem[]
  ): { label: string; items: RecycleBinItem[] }[] => {
    const grouped: Record<string, RecycleBinItem[]> = {};
    // Sort items descending by deleted_at first
    const sorted = [...items].sort(
      (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
    );
    sorted.forEach((item) => {
      const label = getRelativeDateLabel(item.deleted_at);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });
    // Convert to array preserving insertion order (already sorted)
    return Object.entries(grouped).map(([label, items]) => ({ label, items }));
  };

  const filteredItems = React.useMemo(() => {
    if (!filterDate) return items;
    return items.filter(item => {
      const d = new Date(item.deleted_at);
      const dateStr = d.toISOString().split('T')[0];
      return dateStr === filterDate;
    });
  }, [items, filterDate]);

  const groupedItems = React.useMemo(() => groupItemsByDate(filteredItems), [filteredItems]);

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Loading recycle bin...
        </span>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-16">
        <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Recycle Bin is Empty
        </h3>
        <p className="text-gray-400 dark:text-gray-500">
          Deleted infrastructure items will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-600 dark:text-red-400 flex-1">{error}</span>
          <button
            onClick={() => loadItems(false)}
            className="text-red-600 dark:text-red-400 font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      {/* Enhanced Sticky Header - Offset below main nav (64px) + tabs (~80px) */}
      <div className="sticky top-[144px] z-20 bg-white dark:bg-gray-900 pb-4 pt-2 -mt-2">
        <div className="bg-gray-50 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recycle Bin
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} currently stored
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter & Clear */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-w-[160px]"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate("")}
                    className="flex items-center justify-center p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900/50 rounded-xl transition-all shadow-sm group"
                    title="Clear Date Filter"
                  >
                    <XMarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {canPermanentDelete && items.length > 0 && (
                <button
                  onClick={() => setBulkDeleteConfig({ isOpen: true, type: 'all' })}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md h-[38px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Bin</span>
                </button>
              )}

              <motion.button
                whileTap={!loading ? { scale: 0.85 } : {}}
                whileHover={!loading ? { scale: 1.05 } : {}}
                onClick={() => loadItems(false)}
                disabled={loading}
                className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm h-[38px] w-[38px] flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grouped by Date */}
      <div className="space-y-6">
        {groupedItems.map((group) => (
          <div key={group.label} className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-2 border border-gray-100 dark:border-gray-800">
            {/* Date Header */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <button 
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors group/header"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover/header:text-indigo-600 dark:group-hover/header:text-indigo-400">
                  {group.label}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full ml-1">
                  {group.items.length}
                </span>
                {collapsedGroups.has(group.label) ? (
                  <ChevronRight className="w-4 h-4 ml-1 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                )}
              </button>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent"></div>
              {canPermanentDelete && !collapsedGroups.has(group.label) && (
                <button
                  onClick={() => {
                    const d = new Date(group.items[0].deleted_at).toISOString().split('T')[0];
                    setBulkDeleteConfig({ isOpen: true, type: 'date', date: d, label: group.label });
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                >
                  Clear Group
                </button>
              )}
            </div>

            {/* Items Grid for this date with Animation */}
            <AnimatePresence initial={false}>
              {!collapsedGroups.has(group.label) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow relative group"
                      >
                        {/* View Details Button (Shows on hover or touch) */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <div className="flex bg-gray-50 dark:bg-gray-700 p-2 rounded-lg mr-3">
                            {item.type === 'folder' && <FolderIcon className="w-6 h-6 text-blue-500" />}
                            {item.type === 'file' && <DocumentIcon className="w-6 h-6 text-green-500" />}
                            {(!item.type || item.type === 'feature') && <MapPin className="w-6 h-6 text-indigo-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {item.properties?.name || `Feature #${item.id}`}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                              {item.type || 'feature'}{' '}
                              {item.folder_name ? `- ${item.folder_name}` : ''}
                              {item.file_name ? ` / ${item.file_name}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {(!item.type || item.type === 'feature') && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                            </span>
                          </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>Deleted by {item.deleted_by_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(item.deleted_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {canRestore && (
                            <button
                              onClick={() => handleRestore(item)}
                              disabled={actionLoading === item.id}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                              <span>Restore</span>
                            </button>
                          )}

                          {canPermanentDelete && (
                            <button
                              onClick={() => setConfirmDeleteItem(item)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              title="Permanently Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!confirmDeleteItem}
        onClose={() => setConfirmDeleteItem(null)}
        onConfirm={handlePermanentDelete}
        itemName={confirmDeleteItem?.properties?.name || "this item permanently"}
        itemType="file" // Reuse styling
        isDeleting={actionLoading === (confirmDeleteItem?.id ?? null)}
        isPermanent={true}
      />

      {/* Restore Confirmation Modal */}
      <RestoreConfirmationModal
        isOpen={!!confirmRestoreItem}
        onClose={() => setConfirmRestoreItem(null)}
        onConfirm={executeRestore}
        itemName={confirmRestoreItem?.properties?.name}
        isRestoring={actionLoading === (confirmRestoreItem?.id ?? null)}
      />

      {/* Details Modal */}
      <RecycleBinDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        feature={selectedItem}
        canRestore={!!canRestore}
        onRestore={() => selectedItem && handleRestore(selectedItem)}
      />

      {/* Bulk Delete Confirmation Modal */}
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

export default RecycleBinPanel;

