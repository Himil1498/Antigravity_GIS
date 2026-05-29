import React, { Fragment, useState, useMemo } from "react";
import {
  Combobox,
  Transition,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface OptionItem {
  id: string;
  name: string;
  icon?: React.ElementType;
  desc?: string;
  color?: string;
}

interface SearchableSelectProps {
  label: string;
  options: OptionItem[];
  value: string | null;
  onChange: (val: string | null) => void;
  required?: boolean;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  required,
  placeholder = "Search and select...",
}) => {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    let result = options;
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
    
    if (normalizedQuery !== "") {
      result = options.filter((option) =>
        option.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(normalizedQuery)
      );
    }
    
    // Slice to maximum 100 items to prevent DOM lag
    return result.slice(0, 100);
  }, [query, options]);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Combobox value={value} onChange={onChange} immediate>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 text-left border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 transition-all hover:bg-white dark:hover:bg-gray-800">
            <div className="flex items-center px-4">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <ComboboxInput
                className="w-full border-none py-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 bg-transparent focus:ring-0 outline-none"
                displayValue={(val: string | null) => options.find(o => o.id === val)?.name || ""}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
              />
            </div>
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 custom-scrollbar">
              {filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option: OptionItem) => (
                  <ComboboxOption
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2.5 pl-4 pr-10 ${
                        active
                          ? "bg-indigo-50 dark:bg-gray-700 text-indigo-900 dark:text-gray-100"
                          : "text-gray-900 dark:text-gray-100"
                      }`
                    }
                    value={option.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center gap-3">
                          {option.icon && (
                            <option.icon
                              className={`h-5 w-5 ${option.color || (active ? "text-indigo-600" : "text-gray-400")}`}
                            />
                          )}
                          <div className="flex-1">
                            <span
                              className={`block truncate ${
                                selected ? "font-bold text-indigo-600 dark:text-indigo-400" : "font-medium"
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
                        </div>
                        {selected && (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                              active ? "text-white" : "text-indigo-600"
                            }`}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                      </ComboboxOption>
                ))
              )}

            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};


export default SearchableSelect;
