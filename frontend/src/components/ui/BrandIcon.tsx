import React from 'react';

interface BrandIconProps {
  className?: string; // Container classes (size, bg, shadow, etc)
  iconClassName?: string; // SVG classes (size, color)
}

/**
 * BrandIcon Component
 * The official app icon (White rounded square with blue map)
 * Used in Navbar, Login Screen, and Splash Screen
 */
const BrandIcon: React.FC<BrandIconProps> = ({
  className = "w-10 h-10 bg-white rounded-lg shadow-md",
  iconClassName = "w-3/5 h-3/5 text-blue-600"
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={iconClassName}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    </div>
  );
};

export default BrandIcon;

