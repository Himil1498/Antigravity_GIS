/**
 * Admin Tab Navigation Component
 * Displays the tab navigation bar for switching between admin sections
 * Features premium 3D raised tab effects harmonized with app UI
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { AdminTab, AdminTabConfig } from './adminTabs';

interface AdminTabNavigationProps {
  tabs: AdminTabConfig[];
  activeTab: AdminTab;
  onTabClick: (tabId: AdminTab) => void;
}

const AdminTabNavigation: React.FC<AdminTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabClick
}) => {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      {/* Outer tray — matches premium-header-capsule glassmorphism with subtle 3D inset */}
      <div
        className="w-full relative flex overflow-hidden rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60"
        style={{
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.06),
            0 1px 3px rgba(0,0,0,0.08),
            0 4px 12px rgba(0,0,0,0.04)
          `,
          padding: '5px',
        }}
      >
        <div className="w-full flex-1 overflow-x-auto scrollbar-hide">
          <nav className="flex items-center gap-1 px-1 relative z-10">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              
              const iconVariants: Variants = {
                idle: { scale: 1, rotate: 0, y: 0 },
                hover: { 
                  scale: 1.25, 
                  rotate: [0, -15, 15, 0],
                  y: [0, -4, 0],
                  transition: { 
                    duration: 0.4,
                    y: { duration: 0.3, ease: "easeOut" }
                  }
                },
                active: {
                  scale: [1, 1.03, 1],
                  transition: { 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" as const 
                  }
                }
              };

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabClick(tab.id)}
                  whileTap={{ scale: 0.96, y: 1 }}
                  initial="idle"
                  whileHover="hover"
                  animate={active ? "active" : "idle"}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 text-sm font-semibold 
                    rounded-full whitespace-nowrap cursor-pointer select-none z-10
                    transition-colors duration-200
                    ${active
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }
                  `}
                >
                  {/* Icon with animation — variants propagated from parent button */}
                  <motion.span 
                    className={`${active ? "text-white" : tab.iconColor} flex-shrink-0 relative z-20`}
                    variants={iconVariants}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement<any>, { 
                      className: "w-5 h-5" 
                    })}
                  </motion.span>

                  {/* Label */}
                  <span className={`whitespace-nowrap font-medium relative z-20 ${active ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
                    {tab.name}
                  </span>
                  
                  {/* 3D Raised Active Pill — solid color + gradient highlight overlay */}
                  {active && (
                    <>
                      {/* Base color layer */}
                      <motion.div
                        layoutId="admin-pill-color-bg"
                        className={`absolute inset-0 rounded-full -z-10 ${tab.borderColor.replace('border-', 'bg-')}`}
                        initial={false}
                        transition={{
                          layout: { type: "spring", stiffness: 400, damping: 32 }
                        }}
                        style={{
                          boxShadow: `
                            0 3px 10px rgba(0,0,0,0.2),
                            0 1px 3px rgba(0,0,0,0.15),
                            inset 0 1px 2px rgba(255,255,255,0.3),
                            inset 0 -2px 4px rgba(0,0,0,0.12)
                          `,
                        }}
                      />
                      {/* Glossy highlight overlay — top-half shine */}
                      <motion.div
                        layoutId="admin-pill-gloss"
                        className="absolute inset-0 rounded-full -z-[5] overflow-hidden"
                        initial={false}
                        transition={{
                          layout: { type: "spring", stiffness: 400, damping: 32 }
                        }}
                        style={{
                          background: `linear-gradient(
                            180deg,
                            rgba(255,255,255,0.30) 0%,
                            rgba(255,255,255,0.08) 45%,
                            transparent 50%,
                            rgba(0,0,0,0.05) 100%
                          )`,
                        }}
                      />
                    </>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminTabNavigation;
