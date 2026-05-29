import React from 'react';

interface RegionFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  regionTypes: string[];
  totalRegions: number;
  filteredCount: number;
  onClear: () => void;
}

const RegionFilters: React.FC<RegionFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  regionTypes,
  totalRegions,
  filteredCount,
  onClear,
}) => {
  return (
    <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search Regions
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div>
          <label htmlFor="region-type-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filter by Type
          </label>
          <select
            id="region-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
          >
            {regionTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Showing {filteredCount} of {totalRegions} regions
        </p>
        {(searchTerm || filterType !== 'all') && (
          <button
            onClick={onClear}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default RegionFilters;

