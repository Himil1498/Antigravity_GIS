import React from "react";
import { INDIAN_STATES } from "../../../constants/indianStates";
import EnhancedSelect from "../../../../../components/ui/EnhancedSelect";
import FormInput from "./FormInput";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface AddressInfoSectionProps {
  address:
    | { street?: string; city?: string; state?: string; pincode?: string }
    | undefined;
  formErrors: any;
  isViewMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: (field: string, value: any) => void;
}

const AddressInfoSection: React.FC<AddressInfoSectionProps> = React.memo(
  ({ address, formErrors, isViewMode, onChange, onFieldChange }) => {
    return (
      <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-gray-700/30 shadow-sm w-full">
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/40 dark:to-orange-900/40 rounded-lg shadow-inner"
            animate={{ 
              y: [0, -4, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MapPin className="h-5 w-5 text-rose-500 dark:text-rose-400 drop-shadow-sm" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Residential Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <div className="md:col-span-2">
            <FormInput
              label="Street Address / Building"
              name="address.street"
              autoComplete="street-address"
              type="text"
              value={address?.street || ""}
              error={formErrors.street}
              onChange={onChange}
              disabled={isViewMode}
              placeholder="e.g., 123 Main St, Apt 4B"
              required
              colorScheme="rose"
            />
          </div>

          <FormInput
            label="City / District"
            name="address.city"
            autoComplete="address-level2"
            type="text"
            value={address?.city || ""}
            error={formErrors.city}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="Enter city"
            required
            colorScheme="rose"
          />

          <div className="mb-6">
            <EnhancedSelect
              label="State / Province"
              value={address?.state || ""}
              onChange={(value: string) =>
                onFieldChange("address.state", value)
              }
              disabled={isViewMode}
              options={[
                { value: "", label: "Select State" },
                ...INDIAN_STATES.map((state: string) => ({
                  value: state,
                  label: state,
                })),
              ]}
              required={true}
              searchable={true}
              error={formErrors.state}
              colorScheme="rose"
            />
          </div>

          <FormInput
            label="Postal / Zip Code"
            name="address.pincode"
            autoComplete="postal-code"
            type="text"
            value={address?.pincode || ""}
            error={formErrors.pincode}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="e.g., 10001"
            required
            colorScheme="rose"
          />
        </div>
      </div>
    );
  },
);

export default AddressInfoSection;
