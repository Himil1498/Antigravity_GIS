// components/HelpMenuItem.tsx
import React from "react";
import { HelpMenuItem as HelpMenuItemType } from "../types";

interface HelpMenuItemProps {
  item: HelpMenuItemType;
  onClick: () => void;
}

export const HelpMenuItem: React.FC<HelpMenuItemProps> = ({
  item,
  onClick,
}) => {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 ${item.hoverBgColor} transition-colors group`}
    >
      <div className={`p-1.5 rounded-lg ${item.iconBgColor} transition-colors`}>
        <Icon className={`h-4 w-4 ${item.iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {item.label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {item.description}
        </div>
      </div>
    </button>
  );
};

