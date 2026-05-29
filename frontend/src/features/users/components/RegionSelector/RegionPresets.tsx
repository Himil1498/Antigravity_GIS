import React from "react";
import { REGION_PRESETS } from "../../constants/regionPresets";

interface RegionPresetsProps {
  onSelectPreset: (preset: keyof typeof REGION_PRESETS) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  disabled?: boolean;
}

const RegionPresets: React.FC<RegionPresetsProps> = React.memo(
  ({ onSelectPreset, onSelectAll, onClearAll, disabled = false }) => {
    if (disabled) return null;

    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Select All
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear All
        </button>

        {/* Preset Buttons */}
        <button
          type="button"
          onClick={() => onSelectPreset("north")}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          North India
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset("south")}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          South India
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset("east")}
          className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          East India
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset("west")}
          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          West India
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset("central")}
          className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          Central India
        </button>
      </div>
    );
  },
);

export default RegionPresets;

