import React, { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Permission } from "../../../types/common";
import { HelpMenuDropdown } from "./components/HelpMenuDropdown";
import { HELP_MENU_ITEMS } from "./constants";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { useHelpMenuHandlers } from "./hooks/useHelpMenuHandlers";
import { HelpIcon } from "./icons";
import { useContactSupport } from "../../ui/ContactSupport/useContactSupport";
import ContactSupportModal from "../../ui/ContactSupport/ContactSupportModal";

import { useAppSelector } from "../../../store/index";
import { hasPermission } from "../../../utils/rbac/helpers";

export const HelpMenuMain: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Define icon variants for hover
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.25, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  // Filter items based on permission
  const filteredItems = HELP_MENU_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(user, item.permission as Permission);
  });

  // Contact Support Hook
  const contactState = useContactSupport();

  useOutsideClick(menuRef as React.RefObject<HTMLDivElement>, () => {
    if (isOpen) setIsOpen(false);
  });

  const { handleItemClick } = useHelpMenuHandlers(
    () => setIsOpen(false),
    contactState.handleContactSupport,
  );

  return (
    <div className="relative" ref={menuRef}>
      {/* Help Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial="idle"
        whileHover="hover"
        className="px-2.5 py-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 flex items-center group"
        title="Help & Documentation"
      >
        <motion.div variants={iconVariants}>
          <HelpIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </motion.div>
      </motion.button>

      <HelpMenuDropdown
        ref={menuRef}
        items={filteredItems}
        isOpen={isOpen}
        onItemClick={handleItemClick}
      />

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={contactState.showContactModal}
        onClose={contactState.handleCloseContactModal}
        onOpenOutlook={contactState.handleOpenOutlookWeb}
        onCopyEmail={contactState.handleCopyEmail}
        emailCopied={contactState.emailCopied}
      />
    </div>
  );
};
