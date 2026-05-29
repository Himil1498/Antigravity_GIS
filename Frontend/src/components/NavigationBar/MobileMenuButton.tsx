import React from "react";

// ============================================================================
// TYPES
// ============================================================================

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MobileMenuButton Component
 * Toggle button for mobile navigation menu
 */
const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    aria-label="Toggle mobile menu"
  >
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
      />
    </svg>
  </button>
);

export default MobileMenuButton;

