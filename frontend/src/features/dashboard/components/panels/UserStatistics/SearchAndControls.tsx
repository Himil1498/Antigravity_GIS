import React from "react";
import { SearchAndControlsProps } from '../../../types/userStats.types';

const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mb-4 space-y-3">
      {/* Search Input */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2.5 pl-11 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none"
        />
        <svg
          className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

      {/* View Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            aria-label="Sort users by"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name (A-Z)</option>
            <option value="role">Role</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded ${
              viewMode === "list" ? "bg-white dark:bg-gray-600 shadow" : ""
            } transition-all`}
            title="List View"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded ${
              viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow" : ""
            } transition-all`}
            title="Grid View"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndControls;

