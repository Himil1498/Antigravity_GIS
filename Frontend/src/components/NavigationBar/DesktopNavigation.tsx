import React, { useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { NavigationItem } from "./navigationConfig";

const MotionLink = motion(Link);

interface DesktopNavigationProps {
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  navScrollRef: React.RefObject<HTMLDivElement>;
  showScrollButtons: { left: boolean; right: boolean };
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigation,
  isActive,
  navScrollRef,
  showScrollButtons,
}) => {
  const { pathname } = useLocation();

  return (
    <div className="hidden md:flex flex-1 min-w-0 mx-2 relative group/nav-area justify-center">
      {/* The Outer Capsule */}
      <div className="premium-header-capsule w-auto max-w-full relative flex overflow-hidden isolate">
        {/* The Adaptive Scrollable Navigation Dock with native CSS masking for smooth edge fades */}
        <motion.div 
          layoutScroll
          ref={navScrollRef as any}
          className="w-auto flex-1 overflow-x-auto scrollbar-hide scroll-smooth relative z-0"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitMaskImage: `linear-gradient(to right, ${showScrollButtons.left ? 'transparent, black 2rem' : 'black, black'}, ${showScrollButtons.right ? 'black calc(100% - 2rem), transparent' : 'black, black'})`,
            maskImage: `linear-gradient(to right, ${showScrollButtons.left ? 'transparent, black 2rem' : 'black, black'}, ${showScrollButtons.right ? 'black calc(100% - 2rem), transparent' : 'black, black'})`,
          }}
        >
          <div className="flex items-center gap-0.5 relative z-10 px-4 h-full">
            {navigation.map((item) => {
              const active = isActive(item.href);
              
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
                <MotionLink
                  key={item.href}
                  to={item.href}
                  data-href={item.href}
                  initial="idle"
                  whileHover="hover"
                  whileTap={{ scale: 0.96, y: 1 }}
                  animate={active ? "active" : "idle"}
                  className={`nav-pill-item group relative ${
                    active
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <motion.span 
                    className={`${active ? "text-white" : item.iconColor} flex-shrink-0 relative z-20`}
                    variants={iconVariants}
                  >
                    {item.icon}
                  </motion.span>
                  <span className={`whitespace-nowrap font-medium px-1 relative z-20 ${active ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
                    {item.name}
                  </span>
                  
                  {/* 3D Active Pill — base color + glossy highlight */}
                  {active && (
                    <>
                      <motion.div
                        layoutId="pill-active-bg"
                        className="nav-active-indicator"
                        initial={false}
                        animate={{ backgroundColor: item.activeHex }}
                        transition={{
                          backgroundColor: { duration: 0.4, ease: "easeInOut" },
                          layout: { type: "spring", stiffness: 400, damping: 32 }
                        }}
                      />
                      {/* Glossy 3D highlight overlay */}
                      <motion.div
                        layoutId="pill-active-gloss"
                        className="absolute inset-0 rounded-full -z-[5] pointer-events-none"
                        initial={false}
                        transition={{
                          layout: { type: "spring", stiffness: 400, damping: 32 }
                        }}
                        style={{
                          background: `linear-gradient(
                            180deg,
                            rgba(255,255,255,0.28) 0%,
                            rgba(255,255,255,0.08) 45%,
                            transparent 50%,
                            rgba(0,0,0,0.05) 100%
                          )`,
                        }}
                      />
                    </>
                  )}
                </MotionLink>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default DesktopNavigation;
