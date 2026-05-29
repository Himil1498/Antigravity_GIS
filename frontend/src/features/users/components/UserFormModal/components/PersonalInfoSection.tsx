import React from "react";
import { PersonalInfoSectionProps } from "../types";
import { GENDER_OPTIONS } from "../constants";
import EnhancedSelect from "../../../../../components/ui/EnhancedSelect";
import FormInput from "./FormInput";
import PasswordStrengthMeter from "../../../../../components/ui/PasswordStrengthMeter";
import { User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = React.memo(
  ({
    formData,
    formErrors,
    isViewMode,
    onChange,
    onFieldChange,
    showPassword,
    onTogglePassword,
    modalType,
  }) => {
    return (
      <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-gray-700/30 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
          <motion.div 
            className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Personal Identity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <div className="md:col-span-2">
            <FormInput
              label="Full Legal Name"
              name="name"
              autoComplete="name"
              type="text"
              value={formData.name || ""}
              error={formErrors.name}
              onChange={onChange}
              disabled={isViewMode}
              placeholder="e.g., Jane Doe"
              required
              colorScheme="violet"
            />
          </div>

          <FormInput
            label="Username"
            name="username"
            autoComplete="username"
            type="text"
            value={formData.username || ""}
            error={formErrors.username}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="Unique identifier"
            required
            colorScheme="violet"
          />

          <FormInput
            label="Primary Email"
            name="email"
            autoComplete="email"
            type="email"
            value={formData.email || ""}
            error={formErrors.email}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="user@enterprise.com"
            required
            colorScheme="violet"
          />

          {modalType === "create" && (
            <div className="md:col-span-2 mt-2 mb-4 bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800/50">
               <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Shield className="w-4 h-4 text-violet-500" />
                  Security Credentials
               </div>
              <FormInput
                label="System Password"
                name="password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                error={formErrors.password}
                onChange={onChange}
                disabled={isViewMode}
                placeholder="Generate a strong password"
                required
                colorScheme="violet"
                showPasswordToggle
                onTogglePassword={onTogglePassword}
                showPassword={showPassword}
              />
              <div className="mt-1">
                <PasswordStrengthMeter password={formData.password || ""} />
              </div>
            </div>
          )}

          <FormInput
            label="Direct Contact (Phone)"
            name="phoneNumber"
            autoComplete="tel"
            type="tel"
            value={formData.phoneNumber || ""}
            error={formErrors.phoneNumber}
            onChange={onChange}
            disabled={isViewMode}
            placeholder="+1 (555) 000-0000"
            required
            colorScheme="violet"
          />

          <div className="mb-6">
            <EnhancedSelect
              label="Legal Gender"
              value={formData.gender || ""}
              onChange={(value: string) => onFieldChange("gender", value)}
              disabled={isViewMode}
              options={GENDER_OPTIONS}
              colorScheme="violet"
            />
          </div>
        </div>
      </div>
    );
  },
);

export default PersonalInfoSection;
