import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page Container Component
 * Provides consistent full-height layout for all pages
 * Uses full viewport height with padding-top to account for fixed navbar
 * Navbar height: 56px (3.5rem/h-14) mobile, 64px (4rem/h-16) desktop
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`h-screen w-full pt-14 sm:pt-16 overflow-auto bg-gray-50 dark:bg-gray-900 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;

