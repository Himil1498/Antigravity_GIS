import React from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ScrollButtonProps {
  direction: "left" | "right";
  onClick: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ScrollButton Component
 * Reusable scroll button for navigation scrolling
 */
const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className="absolute z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    style={{ [direction]: 0 }}
    aria-label={`Scroll ${direction}`}
  >
    <svg
      className="w-5 h-5 text-gray-700 dark:text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
);

export default ScrollButton;

