import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormInputProps {
  label: string;
  name: string;
  type: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  colorScheme?: "violet" | "emerald" | "blue" | "rose";
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type,
  value,
  error,
  onChange,
  disabled = false,
  placeholder = "",
  required = false,
  colorScheme = "violet",
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const colorClasses = {
    violet: "focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-violet-500/20",
    emerald: "focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-emerald-500/20",
    blue: "focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-blue-500/20",
    rose: "focus-within:border-rose-500 dark:focus-within:border-rose-400 focus-within:ring-rose-500/20",
  };

  const labelColorClasses = {
    violet: "text-violet-700/80 dark:text-violet-300/80 group-hover:text-violet-600 dark:group-hover:text-violet-300 focus-within:text-violet-700 dark:focus-within:text-violet-400",
    emerald: "text-emerald-700/80 dark:text-emerald-300/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 focus-within:text-emerald-700 dark:focus-within:text-emerald-400",
    blue: "text-blue-700/80 dark:text-blue-300/80 group-hover:text-blue-600 dark:group-hover:text-blue-300 focus-within:text-blue-700 dark:focus-within:text-blue-400",
    rose: "text-rose-700/80 dark:text-rose-300/80 group-hover:text-rose-600 dark:group-hover:text-rose-300 focus-within:text-rose-700 dark:focus-within:text-rose-400",
  };

  const focusClass = colorClasses[colorScheme];
  const labelColor = labelColorClasses[colorScheme];

  return (
    <div className="relative group w-full mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <label
          htmlFor={name}
          className={`text-sm font-semibold transition-colors duration-200 ${
            disabled 
              ? "text-gray-400 dark:text-gray-500" 
              : labelColor
          }`}
        >
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        
        {/* Error message moved to top right to save vertical space and look cleaner */}
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div 
        className={`relative flex items-center overflow-hidden rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border backdrop-blur-sm transition-all duration-300
          ${disabled ? "bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-70 cursor-not-allowed" : ""}
          ${error 
            ? "border-red-300 dark:border-red-500/50 ring-4 ring-red-500/10" 
            : `border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 ${focusClass}`
          }
          ${isFocused && !error ? "ring-4 shadow-inner" : ""}
        `}
      >
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full py-2.5 px-3 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm
            ${showPasswordToggle ? "pr-12" : ""}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        />

        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            className={`absolute right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none`}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;
