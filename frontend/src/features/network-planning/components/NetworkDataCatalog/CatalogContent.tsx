import React, { useState, useCallback } from "react";
import { FolderNode } from "./FolderNode";
import { SkeletonLoader } from "./SkeletonLoader";
import { CatalogData, FolderItem } from "../../types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { Sparkles, Layers } from "lucide-react";

interface CatalogContentProps {
  loading: boolean;
  activeTab: "infra" | "customer" | "others";
  data: CatalogData | null;
  visibleFolderIds: number[];
  visibleFileIds: number[];
  onToggleFolder: (id: number, visible: boolean, folderName?: string) => void;
  onToggleFile?: (id: number, visible: boolean) => void;
  onBulkToggle: (ids: number[], visible: boolean) => void;
  forceExpand?: boolean;

  sortBy: "alpha" | "manual" | "count";
  onSortChange: (sort: "alpha" | "manual" | "count") => void;
}

export const CatalogContent: React.FC<CatalogContentProps> = ({
  loading, activeTab, data, visibleFolderIds, visibleFileIds,
  onToggleFolder, onToggleFile, onBulkToggle, forceExpand,
  sortBy, onSortChange
}) => {
  const [sortOrders, setSortOrders] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem("catalog_sort_orders");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filterFoldersWithData = (items: FolderItem[], depth: number = 0): FolderItem[] => {
    return items
      .map(item => {
        const filteredChildren = item.children ? filterFoldersWithData(item.children, depth + 1) : undefined;
        return { ...item, children: filteredChildren };
      })
      .filter(item => {
        // Always keep top-level folders (depth === 0)
        if (depth === 0) return true;
        
        const hasFiles = item.files && item.files.length > 0;
        const hasFilteredChildren = item.children && item.children.length > 0;
        const hasCount = (item.featureCount && item.featureCount > 0) || (item.count && item.count > 0);
        return hasFiles || hasFilteredChildren || hasCount;
      });
  };

  let currentItems = data
    ? activeTab === "infra" ? data.infrastructure : activeTab === "customer" ? data.customers : data.others
    : [];

  if (activeTab === "customer" && currentItems?.length === 1 &&
      currentItems[0].name.toLowerCase().includes("customer") && currentItems[0].children) {
    currentItems = currentItems[0].children;
  }

  // Filter out any region folders (depth > 0) that have no data
  currentItems = filterFoldersWithData(currentItems || [], 0);

  const sortedItems = React.useMemo(() => {
    if (!currentItems) return [];
    
    // Default Alpha Sort (A-Z)
    const alphaSorted = [...currentItems].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
    );

    if (sortBy === "alpha") return alphaSorted;

    // Feature Count Sort (High to Low)
    if (sortBy === "count") {
      return [...currentItems].sort((a, b) => {
        const countA = a.featureCount ?? a.count ?? 0;
        const countB = b.featureCount ?? b.count ?? 0;
        if (countA !== countB) return countB - countA;
        return a.name.localeCompare(b.name);
      });
    }

    // Manual Sort (User re-arranged)
    const order = sortOrders[activeTab];
    if (!order || order.length === 0) return alphaSorted;

    const itemMap = new Map(currentItems.map((item) => [item.id, item]));
    const sorted: FolderItem[] = [];
    
    order.forEach((id) => { 
      const item = itemMap.get(id); 
      if (item) sorted.push(item); 
    });
    
    alphaSorted.forEach((item) => { 
      if (!order.includes(item.id)) sorted.push(item); 
    });
    
    return sorted;
  }, [currentItems, sortOrders, activeTab, sortBy]);

  const hasItems = sortedItems.length > 0;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sortedItems.map((item) => item.id);
    const activeIdx = ids.indexOf(Number(String(active.id).replace("folder-", "")));
    const overIdx = ids.indexOf(Number(String(over.id).replace("folder-", "")));
    if (activeIdx === -1 || overIdx === -1) return;
    const newOrder = arrayMove(ids, activeIdx, overIdx);
    setSortOrders((prev) => {
      const updated = { ...prev, [activeTab]: newOrder };
      localStorage.setItem("catalog_sort_orders", JSON.stringify(updated));
      return updated;
    });
    // Switch to manual mode so the change is visible immediately
    if (sortBy !== "manual") {
      onSortChange("manual");
    }
  }, [sortedItems, activeTab, sortBy, onSortChange]);

  const sortableIds = sortedItems.map((item) => `folder-${item.id}`);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[300px] catalog-scrollbar">
      
      {/* Scroll Padding removed for more compact start */}

      {loading ? (
        <div className="px-3">
          <SkeletonLoader />
        </div>
      ) : (
        <div className="pb-4 flex flex-col gap-[1px]">
          {activeTab === "others" && !hasItems ? (
            <EmptyState 
              icon={<Sparkles className="w-6 h-6 text-indigo-400 dark:text-indigo-500" strokeWidth={1.5} />}
              title="No Custom Data" 
              description="Import KML/KMZ or create custom polygons to populate this space." 
            />
          ) : hasItems ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {sortedItems.map((folder) => (
                  <FolderNode key={folder.id} folder={folder} visibleIds={visibleFolderIds} visibleFileIds={visibleFileIds}
                    onToggle={onBulkToggle} onToggleFile={onToggleFile} forceExpand={forceExpand} isDraggable={true} />
                ))}
              </SortableContext>
            </DndContext>
          ) : activeTab !== "others" ? (
            <EmptyState 
              icon={<Layers className="w-6 h-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />}
              title="Catalog Empty" 
              description="Select a different region or sync data from the main server." 
            />
          ) : null}
        </div>
      )}
      
      {/* Scroll Padding for bottom Fade Mask */}
      <div className="h-4 shrink-0 pointer-events-none" />
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-8 animate-in fade-in duration-500">
    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 mb-4 shadow-sm group">
      <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl duration-500" />
      <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
    </div>
    <h4 className="text-[14px] font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">{title}</h4>
    <p className="text-[12px] text-gray-500 dark:text-gray-400 max-w-[180px] leading-relaxed font-medium">{description}</p>
  </div>
);
