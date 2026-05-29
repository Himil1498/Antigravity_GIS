import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface EnhancedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  colorScheme?: "violet" | "emerald" | "blue" | "rose";
}

// Portal component for the dropdown menu
const DropdownPortal: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  parentRef:
    | React.RefObject<HTMLDivElement | null>
    | React.MutableRefObject<HTMLDivElement | null>;
  onClose: () => void;
}> = ({ children, isOpen, parentRef, onClose }) => {
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen && parentRef.current) {
      const updatePosition = () => {
        if (parentRef.current) {
          const rect = parentRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.bottom;
          const dropdownMaxHeight = 280; // max-h-64 = 256px + padding ~280px
          const openUpward = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow;

          if (openUpward) {
            setPosition({
              bottom: viewportHeight - rect.top + 4,
              left: rect.left,
              width: rect.width,
              openUpward: true,
            });
          } else {
            setPosition({
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              openUpward: false,
            });
          }
        }
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [isOpen, parentRef]);

  if (!isOpen || !position) return null;

  return ReactDOM.createPortal(
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          ...(position.openUpward
            ? { bottom: position.bottom }
            : { top: position.top }),
          left: position.left,
          width: position.width,
          zIndex: 9999,
          maxHeight: "280px",
          overflowY: "auto",
        }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body,
  );
};

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  required = false,
  disabled = false,
  error,
  className = "",
  icon,
  searchable = false,
  colorScheme = "blue",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Close when clicking outside is now handled by the Portal backdrop

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const colorClasses = {
    violet: "focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/20 text-violet-700 dark:text-violet-300",
    emerald: "focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    blue: "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 text-blue-700 dark:text-blue-300",
    rose: "focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-500/20 text-rose-700 dark:text-rose-300",
  };

  const labelColorClasses = {
    violet: "text-violet-700/80 dark:text-violet-300/80 group-hover:text-violet-600 dark:group-hover:text-violet-300",
    emerald: "text-emerald-700/80 dark:text-emerald-300/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300",
    blue: "text-blue-700/80 dark:text-blue-300/80 group-hover:text-blue-600 dark:group-hover:text-blue-300",
    rose: "text-rose-700/80 dark:text-rose-300/80 group-hover:text-rose-600 dark:group-hover:text-rose-300",
  }

  const focusClass = colorClasses[colorScheme];
  const labelColorClass = labelColorClasses[colorScheme];

  return (
    <div className={`relative group w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-semibold mb-1 transition-colors duration-200 ${
          disabled 
            ? "text-gray-400 dark:text-gray-500" 
            : isOpen 
              ? colorClasses[colorScheme].split(" ")[3] + " " + colorClasses[colorScheme].split(" ")[4] // Extract text color
              : labelColorClass
        }`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Selected Value Display */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          relative w-full text-left
          ${icon ? "pl-10" : "pl-3"} pr-10 py-2.5
          bg-gray-50/50 dark:bg-gray-800/40 backdrop-blur-sm
          border ${
            error
              ? "border-red-300 dark:border-red-500/50 ring-4 ring-red-500/10"
              : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
          }
          rounded-xl shadow-sm
          focus:outline-none focus:ring-4 ${isOpen ? "ring-4 shadow-inner " + focusClass.split(" ")[2] + " " + focusClass.split(" ")[0] : ""}
          ${disabled ? "opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-900/50" : "cursor-pointer"}
          transition-all duration-300
          text-sm text-gray-900 dark:text-gray-100
        `}
      >
        {/* Icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        )}

        {/* Selected Option */}
        <span className="block truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              {placeholder}
            </span>
          )}
        </span>

        {/* Chevron Icon */}
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1 absolute right-0 -top-6">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Dropdown Portal */}
      <DropdownPortal
        isOpen={isOpen}
        parentRef={dropdownRef}
        onClose={() => setIsOpen(false)}
      >
        {/* Search Input */}
        {searchable && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
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
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="max-h-64 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm font-medium">No options found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-4 py-3
                  flex items-start gap-3
                  ${
                    value === option.value
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                      : "text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                  transition-colors duration-150
                `}
              >
                {/* Option Icon */}
                {option.icon && (
                  <span
                    className={`flex-shrink-0 ${value === option.value ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                  >
                    {option.icon}
                  </span>
                )}

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{option.label}</span>
                    {value === option.value && (
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  {option.description && (
                    <p
                      className={`text-xs mt-0.5 ${value === option.value ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownPortal>
    </div>
  );
};

export default EnhancedSelect;
