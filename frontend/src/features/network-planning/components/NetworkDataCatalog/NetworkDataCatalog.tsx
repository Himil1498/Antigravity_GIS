import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useAppSelector } from "../../../../store/index";
import { useNetworkCatalog } from "../../hooks/useNetworkCatalog";
import { useCatalogRegions } from "../../hooks/useCatalogRegions";
import { useDebounce } from "../../hooks/useDebounce";
import { CatalogHeader } from "./CatalogHeader";
import { CatalogContent } from "./CatalogContent";
import { FolderItem } from "../../types";

interface NetworkDataCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  visibleFolderIds: number[];
  visibleFileIds?: number[];
  onToggleFolder: (id: number, visible: boolean, folderName?: string) => void;
  onToggleFile?: (id: number, visible: boolean) => void;
  onRegionSelect?: (
    lat: number,
    lng: number,
    zoom: number,
    regionIds: number[] | null,
  ) => void;
  isMinimized?: boolean;
  onMinimizeChange?: (isMinimized: boolean) => void;
  externalRegionId?: number | null;
  onCatalogLoaded?: (
    folderMap: Record<
      number,
      {
        name: string;
        type: "infrastructure" | "customer";
        iconType?: string;
        files: { id: number; name: string }[];
      }
    >,
  ) => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
}

const countVisibleInTree = (
  items: FolderItem[],
  visibleFolderIds: number[],
  visibleFileIds: number[],
): number => {
  let count = 0;
  items.forEach((item) => {
    if (visibleFolderIds.includes(item.id)) count++;
    if (item.files)
      count += item.files.filter((f) => visibleFileIds.includes(f.id)).length;
    if (item.children)
      count += countVisibleInTree(
        item.children,
        visibleFolderIds,
        visibleFileIds,
      );
  });
  return count;
};

const NetworkDataCatalog: React.FC<NetworkDataCatalogProps> = ({
  isOpen,
  onClose,
  visibleFolderIds,
  visibleFileIds,
  onToggleFolder,
  onToggleFile,
  onRegionSelect,
  onCatalogLoaded,
  isMinimized = false,
  onMinimizeChange,
  externalRegionId,
  showLabels = false,
  onToggleLabels,
}) => {
  const { token, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"infra" | "customer" | "others">(
    "infra",
  );
  const [sortBy, setSortBy] = useState<"alpha" | "manual" | "count">("alpha");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFocused, setIsFocused] = useState(
    () => !!(window as any).isGisFocusActive,
  );

  React.useEffect(() => {
    const handleFocusToggle = (e: any) => {
      if (e.detail && typeof e.detail.collapse === "boolean") {
        setIsFocused(e.detail.collapse);
      }
    };
    window.addEventListener("setMapToolbarCollapse" as any, handleFocusToggle);
    return () =>
      window.removeEventListener(
        "setMapToolbarCollapse" as any,
        handleFocusToggle,
      );
  }, []);

  const [localMinimized, setLocalMinimized] = useState(false);
  const minimized = onMinimizeChange ? isMinimized : localMinimized;
  const setMinimized = onMinimizeChange || setLocalMinimized;

  const { regionOptions, selectedRegionIds, handleRegionChange } =
    useCatalogRegions(token, externalRegionId, onRegionSelect);

  const { data, loading, stats } = useNetworkCatalog(
    isOpen,
    token,
    user?.id ? Number(user.id) : undefined,
    selectedRegionIds,
    visibleFolderIds,
    visibleFileIds,
    onCatalogLoaded,
    debouncedSearch,
  );

  const activeCounts = useMemo(() => {
    const safeFileIds = visibleFileIds || [];
    return {
      infra: data
        ? countVisibleInTree(data.infrastructure, visibleFolderIds, safeFileIds)
        : 0,
      customer: data
        ? countVisibleInTree(data.customers, visibleFolderIds, safeFileIds)
        : 0,
      others: data?.others
        ? countVisibleInTree(data.others, visibleFolderIds, safeFileIds)
        : 0,
    };
  }, [data, visibleFolderIds, visibleFileIds]);

  const handleBulkToggle = useCallback(
    (ids: number[], visible: boolean) => {
      ids.forEach((id) => onToggleFolder(id, visible));
    },
    [onToggleFolder],
  );

  const currentItems = data
    ? activeTab === "infra"
      ? data.infrastructure
      : activeTab === "customer"
        ? data.customers
        : data.others
    : [];

  const canSelect = useMemo(() => {
    if (loading || !currentItems || currentItems.length === 0) return false;
    const check = (items: FolderItem[]): boolean =>
      items.some(
        (item) =>
          (item.files && item.files.length > 0) ||
          (item.children && check(item.children)),
      );
    return check(currentItems);
  }, [currentItems, loading]);

  const hasSelection =
    visibleFolderIds.length > 0 ||
    (visibleFileIds ? visibleFileIds.length > 0 : false);

  const handleSelectAll = useCallback(
    (visible: boolean) => {
      if (!data) return;
      const getAllIds = (items: FolderItem[]): number[] => {
        let all: number[] = [];
        items.forEach((item) => {
          all.push(item.id);
          if (item.children) all.push(...getAllIds(item.children));
        });
        return all;
      };
      getAllIds(currentItems).forEach((id) => onToggleFolder(id, visible));
    },
    [data, activeTab, onToggleFolder, currentItems],
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`absolute right-0 w-[300px] flex flex-col z-[40] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          minimized
            ? "top-0 h-[56px] rounded-bl-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border border-gray-200/50 dark:border-white/10"
            : "top-0 rounded-bl-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200/50 dark:border-white/10"
        }`}
        style={{
          maxHeight: minimized
            ? "56px"
            : "calc(100vh - 64px - var(--elevation-drawer-height, 0px))",
          transform: isFocused ? "translateX(110%)" : "none",
        }}
      >
        {/* Subtle top glare effect for 3D depth */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

        <CatalogHeader
          minimized={minimized}
          onMinimizeChange={(nextMinimized) => {
            if (nextMinimized) {
              setIsFocused(true);
              setMinimized(true);
            } else {
              setIsFocused(false);
              setMinimized(false);
            }
          }}
          onClose={onClose}
          statsLoading={loading}
          stats={stats}
          regionOptions={regionOptions}
          selectedRegionIds={selectedRegionIds}
          onRegionChange={handleRegionChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCounts={activeCounts}
          hasOthers={!!(data?.others && data.others.length > 0)}
          canSelect={canSelect}
          hasSelection={hasSelection}
          onSelectAll={handleSelectAll}
          showLabels={showLabels}
          onToggleLabels={onToggleLabels}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div
          className={`flex-1 min-h-0 relative flex flex-col overflow-y-auto transition-all duration-300 ease-in-out origin-top ${minimized ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}`}
        >
          {/* Soft Fade Masks for scrolling — colors match bg-white/95 / bg-slate-900/95 */}
          <div className="sticky top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/95 dark:from-slate-900/95 to-transparent z-10 pointer-events-none shrink-0" />

          <CatalogContent
            loading={loading}
            activeTab={activeTab}
            data={data}
            visibleFolderIds={visibleFolderIds}
            visibleFileIds={visibleFileIds || []}
            onToggleFolder={onToggleFolder}
            onToggleFile={onToggleFile}
            onBulkToggle={handleBulkToggle}
            forceExpand={!!searchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/95 dark:from-slate-900/95 to-transparent z-10 pointer-events-none shrink-0" />
        </div>
      </div>
      {/* Network Catalog Restore Pull-Tab Button when Focus Mode is Active */}
      {isFocused && (
        <>
          <style>{`
            @keyframes bounceHorizontalLeft {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-4px); }
            }
            .animate-bounce-left {
              animation: bounceHorizontalLeft 1s infinite;
            }
          `}</style>
          <button
            onClick={() => {
              setMinimized(false);
              setIsFocused(false);
            }}
            className="fixed top-24 right-0 z-40 w-5 h-24 flex flex-col items-center justify-center gap-1.5 rounded-l-lg border-y border-l border-indigo-400/30 bg-indigo-600/85 dark:bg-indigo-700/85 text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] backdrop-blur-xl hover:bg-indigo-500/95 dark:hover:bg-indigo-600/95 transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-105"
            title="Restore Data Catalog"
          >
            <ChevronLeft
              size={11}
              strokeWidth={3}
              className="text-white animate-bounce-left"
            />
            <span className="text-[9px] font-extrabold uppercase tracking-wider select-none text-white [writing-mode:vertical-lr] mb-1">
              Catalog
            </span>
          </button>
        </>
      )}
    </>
  );
};

export default NetworkDataCatalog;
