// components/HelpMenuDropdown.tsx
import React, { forwardRef } from "react";
import { HelpMenuItem as HelpMenuItemType } from "../types";
import { HelpMenuItem } from "./HelpMenuItem";
import { LifebuoyIcon } from "../icons";

interface HelpMenuDropdownProps {
  items: HelpMenuItemType[];
  isOpen: boolean;
  onItemClick: (action: string) => void;
}

export const HelpMenuDropdown = forwardRef<
  HTMLDivElement,
  HelpMenuDropdownProps
>(({ items, isOpen, onItemClick }, ref) => {
  if (!isOpen) return null;

  // Split items into main items and support
  const mainItems = items.slice(0, -1);
  const supportItem = items[items.length - 1];

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-64 rounded-lg shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <LifebuoyIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Help & Documentation
          </h3>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {mainItems.map((item) => (
          <HelpMenuItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item.action)}
          />
        ))}

        {/* Divider */}
        <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Support Item */}
        <HelpMenuItem
          item={supportItem}
          onClick={() => onItemClick(supportItem.action)}
        />
      </div>
    </div>
  );
});

HelpMenuDropdown.displayName = "HelpMenuDropdown";

