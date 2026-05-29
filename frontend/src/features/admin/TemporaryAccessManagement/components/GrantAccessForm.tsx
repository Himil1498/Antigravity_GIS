/**
 * GrantAccessForm - Form for granting temporary access
 */

import React from "react";
import EnhancedSelect from "../../../../components/ui/EnhancedSelect";
import { INDIAN_STATES } from "../../../../utils/regionMapping/constants";
import { rolesMatch } from "../../../../utils/userHelpers";
import type { SimpleUser } from "../types/types";

interface GrantAccessFormProps {
  users: SimpleUser[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  expirationDate: string;
  setExpirationDate: (date: string) => void;
  reason: string;
  setReason: (reason: string) => void;
  onGrant: () => void;
  loading: boolean;
}

const GrantAccessForm: React.FC<GrantAccessFormProps> = ({
  users,
  selectedUserId,
  setSelectedUserId,
  selectedRegion,
  setSelectedRegion,
  expirationDate,
  setExpirationDate,
  reason,
  setReason,
  onGrant,
  loading
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/10 rounded-xl shadow-lg border border-amber-200/60 dark:border-amber-800/30 p-6">
      <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </span>
        Grant Temporary Access
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnhancedSelect
          label="Select User *"
          value={selectedUserId}
          onChange={(value) => setSelectedUserId(value)}
          options={[
            {
              value: "",
              label: "-- Select User --",
              icon: <span>👤</span>,
              description: "Choose a user to grant access",
            },
            ...users.map((user) => ({
              value: user.id,
              label: user.name,
              icon: (
                <span>{rolesMatch(user.role, "Manager") ? "👔" : "👤"}</span>
              ),
              description: user.email,
            })),
          ]}
          required={true}
          searchable={true}
          placeholder="Search and select user..."
        />

        <EnhancedSelect
          label="Select Region *"
          value={selectedRegion}
          onChange={(value) => setSelectedRegion(value)}
          options={[
            {
              value: "",
              label: "-- Select Region --",
              icon: <span>🗺️</span>,
              description: "Choose a region to grant access",
            },
            ...INDIAN_STATES.map((state: string) => ({
              value: state,
              label: state,
              icon: <span>📍</span>,
              description: `Grant access to ${state}`,
            })),
          ]}
          required={true}
          searchable={true}
          placeholder="Search and select region..."
        />

        <div>
          <label
            htmlFor="expiration-datetime"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Expiration Date & Time *
          </label>
          <input
            id="expiration-datetime"
            type="datetime-local"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Enter reason for temporary access..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onGrant}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-md shadow-amber-300/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Granting..." : "Grant Access"}
        </button>
      </div>
    </div>
  );
};

export default GrantAccessForm;

