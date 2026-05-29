import React from "react";
import { FilterOption } from "../types/types";

interface RequestFiltersProps {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filters: FilterOption[];
  onDeleteAll: () => void;
}

const RequestFilters: React.FC<RequestFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  filters,
  onDeleteAll,
}) => {
  return (
    <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setStatusFilter(filter.value)}
          className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
            statusFilter === filter.value
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {filter.label}
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
            {filter.count}
          </span>
        </button>
      ))}
      <div className="flex-grow"></div>
      {(() => {
        const currentFilter = filters.find(f => f.value === statusFilter);
        const allFilter = filters.find(f => f.value === "all");
        const totalCount = statusFilter !== "all" ? (currentFilter?.count ?? 0) : (allFilter?.count ?? 0);
        return (
          <button
            onClick={onDeleteAll}
            disabled={totalCount === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center ${
              totalCount === 0
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <span className="mr-2">🗑️</span>
            Delete All {statusFilter !== "all" ? `(${statusFilter})` : ""}
          </button>
        );
      })()}
    </div>
  );
};

export default RequestFilters;

