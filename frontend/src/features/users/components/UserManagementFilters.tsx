import React from "react";
import EnhancedSelect from "../../../components/ui/EnhancedSelect";

interface UserManagementFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterRole: string;
  onRoleChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  availableRoles?: string[];
}

const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterRole,
  onRoleChange,
  filterStatus,
  onStatusChange,
  onClearFilters,
  availableRoles = [],
}) => {
  // Build dynamic role options for the filter dropdown
  const roleOptions = React.useMemo(() => {
    const defaultIcon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );

    const knownIcons: Record<string, { icon: React.ReactNode; description: string }> = {
      admin: {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        description: "Full system access",
      },
      manager: {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        description: "Team management",
      },
      technician: {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        description: "Technical operations",
      },
      developer: {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
        description: "System development",
      },
      user: {
        icon: defaultIcon,
        description: "Basic access",
      },
    };

    return [
      { value: "", label: "All Roles", description: "Show all users" },
      ...availableRoles.map((role) => {
        const known = knownIcons[role.toLowerCase()];
        return {
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
          icon: known?.icon || defaultIcon,
          description: known?.description || `${role.charAt(0).toUpperCase() + role.slice(1)} role`,
        };
      }),
    ];
  }, [availableRoles]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-2 border-violet-100 dark:border-violet-900/30 p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mr-3">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Search & Filter Users
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-violet-700/80 dark:text-violet-300/80 mb-1 transition-colors duration-200">
            <svg
              className="h-4 w-4"
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
            Search Users
          </label>
          <div className="relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700/60 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 bg-gray-50/50 dark:bg-gray-800/40 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors"
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

        {/* Role Filter - Now Dynamic */}
        <div>
          <EnhancedSelect
            label="Filter by Role"
            value={filterRole}
            onChange={onRoleChange}
            options={roleOptions}
            colorScheme="violet"
            icon={
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          />
        </div>

        {/* Status Filter */}
        <div>
          <EnhancedSelect
            label="Filter by Status"
            value={filterStatus}
            onChange={onStatusChange}
            colorScheme="violet"
            options={[
              {
                value: "",
                label: "All Status",
                description: "Show all statuses",
              },
              {
                value: "Active",
                label: "Active",
                icon: (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                description: "Active users",
              },
              {
                value: "Inactive",
                label: "Inactive",
                icon: (
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                description: "Inactive users",
              },
            ]}
            icon={
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="w-full px-3 py-2.5 border border-rose-200 dark:border-rose-700/50 rounded-xl bg-rose-50/50 dark:bg-rose-900/20 backdrop-blur-sm text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <svg
              className="h-4 w-4"
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
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementFilters;

