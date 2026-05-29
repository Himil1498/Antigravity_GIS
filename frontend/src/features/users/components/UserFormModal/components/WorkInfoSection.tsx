import React, { useState, useEffect } from "react";
import { ROLE_OPTIONS } from "../constants";
import EnhancedSelect from "../../../../../components/ui/EnhancedSelect";
import FormInput from "./FormInput";
import { apiService } from "../../../../../services/api";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

interface WorkInfoSectionProps {
  department: string;
  officeLocation: string;
  role: string;
  status: string;
  formErrors: any;
  isViewMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: (field: string, value: any) => void;
}

const SYSTEM_ROLE_NAMES = ["admin", "manager", "technician", "developer", "user"];

const WorkInfoSection: React.FC<WorkInfoSectionProps> = React.memo(
  ({
    department,
    officeLocation,
    role,
    status,
    formErrors,
    isViewMode,
    onChange,
    onFieldChange,
  }) => {
    const [allRoleOptions, setAllRoleOptions] = useState(ROLE_OPTIONS);

    useEffect(() => {
      const fetchCustomRoles = async () => {
        try {
          const { data } = await apiService.get("/roles");
          const apiRoles = data.data || data.roles || data || [];

          const customRoles = apiRoles
            .filter(
              (r: any) =>
                !SYSTEM_ROLE_NAMES.includes(r.name) && r.is_active !== false,
            )
            .map((r: any) => ({
              value: r.name,
              label: r.display_name || r.name,
              description: r.description || "Custom role",
            }));

          if (customRoles.length > 0) {
            setAllRoleOptions([...ROLE_OPTIONS, ...customRoles]);
          }
        } catch (err) {
          console.error("Failed to fetch custom roles:", err);
        }
      };

      fetchCustomRoles();
    }, []);

    return (
      <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-gray-700/30 shadow-sm w-full">
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
          <motion.div 
            className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Corporate Assignment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <div className="md:col-span-2">
             <div className="mb-6">
                <EnhancedSelect
                  label="System Role & Clearances"
                  value={role || "user"}
                  onChange={(value: string) => onFieldChange("role", value)}
                  disabled={isViewMode}
                  options={allRoleOptions}
                  required={true}
                  colorScheme="blue"
                />
             </div>
          </div>

          <FormInput
            label="Department"
            name="department"
            autoComplete="organization-title"
            type="text"
            value={department || ""}
            error={formErrors.department}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="e.g., Engineering"
            colorScheme="blue"
          />

          <FormInput
            label="Base Office Location"
            name="officeLocation"
            autoComplete="address-level2"
            type="text"
            value={officeLocation || ""}
            error={formErrors.officeLocation}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="e.g., New York HQ"
            required
            colorScheme="blue"
          />
        </div>
      </div>
    );
  },
);

export default WorkInfoSection;
