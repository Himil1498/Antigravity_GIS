/**
 * FiltersSection - Filter controls for grants table
 */

import React from "react";
import EnhancedSelect from "../../../../components/ui/EnhancedSelect";
import { INDIAN_STATES } from "../../../../utils/regionMapping/constants";
import { rolesMatch } from "../../../../utils/userHelpers";
import type { SimpleUser } from "../types/types";

interface FiltersSectionProps {
  users: SimpleUser[];
  filterUserId: string;
  setFilterUserId: (id: string) => void;
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  filterStatus: "all" | "active" | "expired" | "revoked";
  setFilterStatus: (status: "all" | "active" | "expired" | "revoked") => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  users,
  filterUserId,
  setFilterUserId,
  filterRegion,
  setFilterRegion,
  filterStatus,
  setFilterStatus
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-800 dark:to-teal-900/10 rounded-xl shadow-lg border border-teal-200/60 dark:border-teal-800/30 p-6">
      <h2 className="text-xl font-semibold text-teal-700 dark:text-teal-400 mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg text-white shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        </span>
        Filter Grants
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnhancedSelect
          label="User"
          value={filterUserId}
          onChange={(value) => setFilterUserId(value)}
          options={[
            { value: '', label: 'All Users', icon: <span>👥</span>, description: 'Show all users' },
            ...users.map((user) => ({
              value: user.id,
              label: user.name,
              icon: <span>{rolesMatch(user.role, 'Manager') ? '👔' : '👤'}</span>,
              description: user.email
            }))
          ]}
          searchable={true}
          placeholder="Filter by user..."
        />

        <EnhancedSelect
          label="Region"
          value={filterRegion}
          onChange={(value) => setFilterRegion(value)}
          options={[
            { value: '', label: 'All Regions', icon: <span>🌏</span>, description: 'Show all regions' },
            ...INDIAN_STATES.map((state: string) => ({
              value: state,
              label: state,
              icon: <span>📍</span>,
              description: `Filter by ${state}`
            }))
          ]}
          searchable={true}
          placeholder="Filter by region..."
        />

        <EnhancedSelect
          label="Status"
          value={filterStatus}
          onChange={(value) => setFilterStatus(value as any)}
          options={[
            { value: 'all', label: 'All Status', icon: <span>📊</span>, description: 'Show all grants' },
            { value: 'active', label: 'Active', icon: <span>✅</span>, description: 'Currently active grants' },
            { value: 'expired', label: 'Expired', icon: <span>⏰</span>, description: 'Expired grants' },
            { value: 'revoked', label: 'Revoked', icon: <span>🚫</span>, description: 'Revoked grants' }
          ]}
          placeholder="Filter by status..."
        />
      </div>
    </div>
  );
};

export default FiltersSection;

