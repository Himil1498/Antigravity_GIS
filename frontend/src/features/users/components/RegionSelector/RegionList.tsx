import React from "react";

interface RegionListProps {
  filteredStates: string[];
  selectedRegions: string[];
  onToggleRegion: (region: string, checked: boolean) => void;
  searchTerm: string;
  disabled?: boolean;
}

const RegionList: React.FC<RegionListProps> = React.memo(
  ({
    filteredStates,
    selectedRegions,
    onToggleRegion,
    searchTerm,
    disabled = false,
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-y-2.5 gap-x-4">
          {filteredStates.map((state) => {
            const isSelected = selectedRegions.includes(state);
            return (
              <div
                key={state}
                className={`relative flex flex-col p-2 rounded-md transition-all ${
                  isSelected
                    ? "bg-gray-50/50 dark:bg-gray-800/10 border border-amber-200 dark:border-opacity-30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                <div className="flex items-start">
                  <label className="relative flex items-center justify-center h-5 w-5 mt-0.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onToggleRegion(state, e.target.checked)}
                      disabled={disabled}
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div
                      className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
                        isSelected
                          ? "bg-amber-600 border-amber-600"
                          : "bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>

                  <div className="ml-3 flex-1 min-w-0 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label
                        className={`text-sm font-medium cursor-pointer ${
                          isSelected
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                        onClick={() => {
                          if (!disabled) {
                            onToggleRegion(state, !isSelected);
                          }
                        }}
                      >
                        {state}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredStates.length === 0 && (
            <div className="col-span-full text-center py-8 text-amber-600 dark:text-amber-400">
              <svg
                className="h-12 w-12 mx-auto mb-2 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">
                No regions found matching "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default RegionList;

