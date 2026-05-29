import React, { Fragment } from "react";
import {
  Listbox,
  Transition,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

export interface OptionItem {
  id: string;
  name: string;
  icon?: React.ElementType;
  desc?: string;
  color?: string; // Tailwind text color class
}

interface CustomSelectProps {
  label: string;
  options: OptionItem[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  required,
  placeholder = "Select Option",
}) => {
  const selectedOption = options.find((o) => o.id === value);
  const displayName = selectedOption?.name || placeholder;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <ListboxButton className="relative w-full cursor-default rounded-xl bg-gray-50 dark:bg-gray-900 py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm transition-all hover:bg-white dark:hover:bg-gray-800">
            <span className="flex items-center gap-3 truncate">
              {selectedOption?.icon && (
                <selectedOption.icon
                  className={`h-5 w-5 ${selectedOption?.color || "text-indigo-500"}`}
                />
              )}
              <span className="flex flex-col">
                <span
                  className={`block truncate font-medium leading-none ${selectedOption ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {displayName}
                </span>
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 custom-scrollbar">
              {options.map((option, personIdx) => (
                <ListboxOption
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2.5 pl-4 pr-4 ${
                      active
                        ? "bg-indigo-50 dark:bg-gray-700 text-indigo-900 dark:text-gray-100"
                        : "text-gray-900 dark:text-gray-100"
                    }`
                  }
                  value={option.id}
                >
                  {({ selected }) => (
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <option.icon
                          className={`h-5 w-5 ${option.color || "text-gray-400"}`}
                        />
                      )}
                      <div className="flex-1">
                        <span
                          className={`block truncate ${
                            selected
                              ? "font-bold text-indigo-600 dark:text-indigo-400"
                              : "font-medium"
                          }`}
                        >
                          {option.name}
                        </span>
                        {option.desc && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                            {option.desc}
                          </span>
                        )}
                      </div>
                      {selected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default React.memo(CustomSelect);

