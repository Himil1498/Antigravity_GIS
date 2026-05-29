import React from 'react';

interface RegionSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  disabled?: boolean;
}

const RegionSearch: React.FC<RegionSearchProps> = ({
  searchTerm,
  onSearchChange,
  disabled = false
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-amber-400"
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
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search states/territories..."
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-3 border-2 border-amber-200 dark:border-amber-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            disabled
              ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-700"
          } dark:text-white transition-all`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-400 hover:text-amber-600"
          >
            <svg
              className="h-5 w-5"
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
          </button>
        )}
      </div>
    </div>
  );
};

export default RegionSearch;

