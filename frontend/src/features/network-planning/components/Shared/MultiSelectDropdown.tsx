import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, MapPin, Globe } from "lucide-react";

export interface RegionOption {
  id: number;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

interface MultiSelectDropdownProps {
  options: RegionOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  alignLeft?: boolean;
  showClearButton?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder = "Select regions...",
  className = "",
  compact = false,
  alignLeft = false,
  showClearButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered options
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Handlers
  const toggleOption = (id: number) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onChange(newIds);
  };

  const handleSelectAll = () => {
    // Select all currently filtered options
    const allIds = filteredOptions.map((o) => o.id);
    // Merge with existing avoiding dupes (though standard select all should probably replace)
    // If we have search, selecting all usually means visible ones.
    // User asked for "Select All" option.
    // Let's toggle: if all visible are selected, deselect them. Else select them.
    const allVisibleSelected = allIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      const newIds = selectedIds.filter((id) => !allIds.includes(id));
      onChange(newIds);
    } else {
      // Add unique
      const newIds = Array.from(new Set([...selectedIds, ...allIds]));
      onChange(newIds);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const isAllSelected =
    options.length > 0 && selectedIds.length === options.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 group ${
          compact
            ? "px-2.5 py-1.5 rounded-lg text-[12px]"
            : "px-3 py-2.5 rounded-xl text-sm backdrop-blur-md hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <MapPin className={`text-indigo-500 shrink-0 group-hover:scale-110 transition-transform ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          <span className="truncate text-gray-700 dark:text-gray-200 font-medium">
            {selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} Region${selectedIds.length > 1 ? "s" : ""}`}
          </span>
        </div>
        <ChevronDown
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${compact ? "w-3.5 h-3.5" : "w-4 h-4"} ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={`absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-gray-700 z-[100] overflow-hidden flex flex-col max-h-[400px] animate-in fade-in zoom-in-95 duration-200 ${
          compact ? (alignLeft ? "left-0 right-0 w-full min-w-[280px]" : "right-0 w-[240px]") : "left-0 right-0 w-full"
        }`}>
          {/* Header: Search & Quick Actions */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 group"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="flex-1 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/30"
              >
                Select Visible
              </button>
              {showClearButton && (
                <button
                  onClick={handleClear}
                  className="flex-1 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
            {/* "All India" Virtual Option */}
            {!searchTerm && (
              <div
                onClick={handleClear}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg mb-1 transition-all duration-200 ${
                  selectedIds.length === 0
                    ? "bg-indigo-50 dark:bg-indigo-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${
                    selectedIds.length === 0
                      ? "bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-indigo-400"
                  }`}
                >
                  {selectedIds.length === 0 && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Globe
                    className={`w-4 h-4 ${
                      selectedIds.length === 0
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedIds.length === 0
                        ? "text-indigo-900 dark:text-indigo-100"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    All Available Regions
                  </span>
                </div>
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 group ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-indigo-400"
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-indigo-900 dark:text-indigo-100"
                            : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                        }`}
                      >
                        {opt.name}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 gap-2">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <span className="text-sm">No regions found</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiSelectDropdown;

