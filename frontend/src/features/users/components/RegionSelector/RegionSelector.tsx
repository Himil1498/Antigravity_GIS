import React, { useState } from "react";
import { INDIAN_STATES } from "../../constants/indianStates";
import { REGION_PRESETS } from "../../constants/regionPresets";
import RegionPresets from "./RegionPresets";
import RegionSearch from "./RegionSearch";
import RegionList from "./RegionList";

interface RegionSelectorProps {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
  disabled?: boolean;
}

const RegionSelector: React.FC<RegionSelectorProps> = React.memo(
  ({ selectedRegions, onChange, disabled = false }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleToggleRegion = (region: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedRegions, region]);
      } else {
        onChange(selectedRegions.filter((r) => r !== region));
      }
    };

    const handleSelectAll = () => {
      onChange([...INDIAN_STATES]);
    };

    const handleClearAll = () => {
      onChange([]);
    };

    const handleSelectPreset = (preset: keyof typeof REGION_PRESETS) => {
      onChange(REGION_PRESETS[preset]);
    };

    const filteredStates = INDIAN_STATES.filter((state: string) =>
      state.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Inline Header with Presets, Selection Count, and Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <RegionPresets
              onSelectPreset={handleSelectPreset}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              disabled={disabled}
            />
            {/* Selection Counter Badge */}
            <div className="px-3 py-1.5 bg-amber-500 text-white dark:bg-amber-600/80 rounded-lg shadow-sm flex items-center gap-1.5 text-xs font-semibold h-[30px]">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>{selectedRegions.length} Selected</span>
            </div>
          </div>
          
          <div className="w-full xl:w-80 shrink-0">
            <RegionSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              disabled={disabled}
            />
          </div>
        </div>

        <RegionList
          filteredStates={filteredStates}
          selectedRegions={selectedRegions}
          onToggleRegion={handleToggleRegion}
          searchTerm={searchTerm}
          disabled={disabled}
        />
      </div>
    );
  },
);

export default RegionSelector;

