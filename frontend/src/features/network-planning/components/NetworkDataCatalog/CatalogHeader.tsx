import React, { useState } from "react";
import {
  Database,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  MapPin,
  CheckSquare,
  Square,
  Command,
  Tag,
  ListFilter,
  ArrowDownAz,
  Hash,
  RefreshCcw
} from "lucide-react";
import MultiSelectDropdown, { RegionOption } from "../Shared/MultiSelectDropdown";

interface CatalogHeaderProps {
  minimized: boolean;
  onMinimizeChange: (min: boolean) => void;
  onClose: () => void;
  statsLoading: boolean;
  stats: { total: number } | null;
  regionOptions: RegionOption[];
  selectedRegionIds: number[];
  onRegionChange: (ids: number[]) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  
  activeTab: "infra" | "customer" | "others";
  onTabChange: (tab: "infra" | "customer" | "others") => void;
  activeCounts?: { infra: number; customer: number; others: number };
  hasOthers?: boolean;

  canSelect: boolean;
  hasSelection: boolean;
  onSelectAll: (visible: boolean) => void;

  showLabels?: boolean;
  onToggleLabels?: () => void;

  sortBy: "alpha" | "manual" | "count";
  onSortChange: (sort: "alpha" | "manual" | "count") => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  minimized, onMinimizeChange, onClose, statsLoading, stats,
  regionOptions, selectedRegionIds, onRegionChange,
  searchQuery = "", onSearchChange,
  activeTab, onTabChange, activeCounts, hasOthers,
  canSelect, hasSelection, onSelectAll,
  showLabels = false, onToggleLabels,
  sortBy, onSortChange
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const visibleCount = stats?.total ? stats.total.toLocaleString() : "0";

  return (
    <div className={`relative z-20 flex flex-col shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${minimized ? "" : "pb-3"}`}>
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between h-[56px] px-5">
        
        {/* Animated Search OR Title State */}
        <div className="flex-1 flex items-center h-full relative">
          {/* Search State */}
          <div className={`absolute inset-0 flex items-center transition-all duration-300 ${isSearching ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-4 pointer-events-none"}`}>
            <Search className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
            <input 
              type="text" 
              autoFocus={isSearching}
              value={searchQuery} 
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search (e.g. Gujarat, Delhi)..."
              className="w-full bg-transparent border-none outline-none text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 font-medium"
            />
            <button onClick={() => { setIsSearching(false); onSearchChange?.(""); }}
              className="p-1.5 ml-1 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title State */}
          <div className={`absolute inset-0 flex items-center gap-3 pl-1 transition-all duration-300 ${isSearching ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0 pointer-events-auto"}`}>
            <div className="relative flex items-center justify-center w-[34px] h-[34px] rounded-[10px] bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <Database className="w-4 h-4 text-white drop-shadow-sm" />
              {!statsLoading && (stats?.total || 0) > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-bold text-white shadow-sm border-2 border-white dark:border-[#1E1E1E]">
                  {visibleCount}
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-0.5">
                Data Catalog
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-none tracking-wide">
                Network Layers
              </span>
            </div>
          </div>
        </div>

        {/* Global Tools */}
        <div className="flex items-center gap-1 ml-2">
          {!isSearching && (
            <button onClick={() => setIsSearching(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
              title="Search">
              <Search size={16} />
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <button onClick={() => onMinimizeChange(!minimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            title={minimized ? "Expand" : "Collapse"}>
            {minimized ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group"
            title="Close">
            <X size={16} className="transition-transform group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>
      </div>

      {/* Control Area (Tabs & Quick Actions) */}
      {!minimized && (
        <div className="px-5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Antigravity Segmented Control */}
          <div className="relative flex p-1 bg-gray-100/90 dark:bg-slate-800/80 backdrop-blur-md rounded-[12px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200/80 dark:border-white/10">
            {[
              { id: 'infra', label: 'POP/BTS' },
              { id: 'customer', label: 'Clients' },
              ...(hasOthers ? [{ id: 'others', label: 'Custom' }] : [])
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const count = activeCounts?.[tab.id as keyof typeof activeCounts] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`relative flex items-center justify-center gap-1.5 flex-1 py-1.5 z-10 transition-colors duration-300 ${
                    isActive ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-700 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-600 -z-10" />
                  )}
                  <span className="text-[12px]">{tab.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] leading-none transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compact Inline Legend & View Tools Strip */}
          <div className="flex items-center justify-between px-5 py-2 border-y border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">LIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border-[1.5px] border-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">PLANNED</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onToggleLabels && (
                <button onClick={onToggleLabels}
                  className={`p-1.5 rounded-lg transition-all ${
                    showLabels
                      ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  title={showLabels ? "Hide Map Labels" : "Show Map Labels"}>
                  <Tag size={14} className={`transition-transform duration-300 ${showLabels ? 'scale-110' : ''}`} />
                </button>
              )}

              <div className="relative">
                <button onClick={() => setShowSortMenu(!showSortMenu)}
                  className={`p-1.5 rounded-lg transition-all ${
                    showSortMenu || sortBy !== "alpha"
                      ? "text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  title="Sort Catalog">
                  <ListFilter size={15} className={`transition-transform duration-300 ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-white/10 z-[101] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-1.5 mb-1 border-b border-gray-50 dark:border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sort Folders By</span>
                      </div>
                      
                      <button onClick={() => { onSortChange("alpha"); setShowSortMenu(false); }}
                        className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 text-[12.5px] transition-all ${sortBy === "alpha" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium"}`}>
                        <ArrowDownAz size={15} className={sortBy === "alpha" ? "text-indigo-500" : "text-gray-400"} /> 
                        <span className="flex-1 text-left">Alphabetical (A-Z)</span>
                        {sortBy === "alpha" && <CheckSquare size={14} className="text-indigo-500" />}
                      </button>

                      <button onClick={() => { onSortChange("count"); setShowSortMenu(false); }}
                        className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 text-[12.5px] transition-all ${sortBy === "count" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium"}`}>
                        <Hash size={15} className={sortBy === "count" ? "text-indigo-500" : "text-gray-400"} /> 
                        <span className="flex-1 text-left">Feature Count (High-Low)</span>
                        {sortBy === "count" && <CheckSquare size={14} className="text-indigo-500" />}
                      </button>

                      <div className="mt-1.5 pt-1.5 border-t border-gray-50 dark:border-white/5">
                        <button onClick={() => { 
                          localStorage.removeItem("catalog_sort_orders");
                          onSortChange("alpha"); 
                          setShowSortMenu(false);
                          window.location.reload(); 
                        }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold transition-colors">
                          <RefreshCcw size={14} /> Reset Manual Order
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Master Toolbar */}
          <div className="flex items-center justify-between pb-1 mt-3">
            <div className="relative z-[100] w-[130px]">
              <MultiSelectDropdown 
                options={regionOptions} 
                selectedIds={selectedRegionIds}
                onChange={onRegionChange} 
                placeholder="All Regions" 
                compact 
                alignLeft
              />
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-full border border-gray-200/50 dark:border-white/5 p-0.5">
              <button 
                onClick={() => onSelectAll(true)} 
                disabled={!canSelect}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${canSelect ? 'text-indigo-600 hover:bg-white dark:text-indigo-400 dark:hover:bg-gray-800 shadow-sm' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
                <CheckSquare className="w-3.5 h-3.5" /> All
              </button>
              <div className="w-[1px] h-3 bg-gray-300 dark:bg-gray-700 mx-0.5" />
              <button 
                onClick={() => onSelectAll(false)} 
                disabled={!hasSelection}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${hasSelection ? 'text-gray-600 hover:text-rose-500 hover:bg-white dark:text-gray-300 dark:hover:text-rose-400 dark:hover:bg-gray-800 shadow-sm' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}>
                <Square className="w-3.5 h-3.5" /> None
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
