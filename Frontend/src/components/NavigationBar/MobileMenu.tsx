import React from "react";
import { Link } from "react-router-dom";
import { NavigationItem } from "./navigationConfig";

interface MobileMenuProps {
  isOpen: boolean;
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  navigation,
  isActive,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
      <div className="pt-2 pb-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={`${
              isActive(item.href)
                ? `${item.bgColor} border-current ${item.iconColor} font-bold`
                : "border-transparent text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            } flex items-center gap-3 pl-3 pr-4 py-3 border-l-4 text-base transition-all duration-200`}
          >
            <span
              className={`flex-shrink-0 ${
                isActive(item.href)
                  ? item.iconColor
                  : "text-gray-700 dark:text-gray-400"
              }`}
            >
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;

