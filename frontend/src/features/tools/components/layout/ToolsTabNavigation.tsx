import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import type { ToolTab, ToolTabConfig } from './toolsTabs';

interface ToolsTabNavigationProps {
  tabs: ToolTabConfig[];
  activeTab: ToolTab;
}

const ToolsTabNavigation: React.FC<ToolsTabNavigationProps> = ({ tabs, activeTab }) => {
  const navigate = useNavigate();

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.25, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    },
    pulsing: { 
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div 
      className="relative flex w-max rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 overflow-hidden shadow-sm"
        style={{
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.06),
            0 1px 3px rgba(0,0,0,0.08),
            0 4px 12px rgba(0,0,0,0.04)
          `,
          padding: '5px',
        }}
      >
        <nav className="flex items-center justify-center gap-1 w-full px-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            // Map colors to solid brand versions for the 3D pills
            const brandColor = 
              tab.id === 'excel-to-kml' ? 'bg-orange-600' :
              tab.id === 'kml-to-excel' ? 'bg-violet-600' :
              tab.id === 'viewer' ? 'bg-blue-600' :
              'bg-emerald-600';
            
            const iconColor = 
              tab.id === 'excel-to-kml' ? 'text-orange-500' :
              tab.id === 'kml-to-excel' ? 'text-violet-500' :
              tab.id === 'viewer' ? 'text-blue-500' :
              'text-emerald-500';

            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                initial="idle"
                animate={isActive ? "pulsing" : "idle"}
                whileHover={isActive ? "pulsing" : "hover"}
                whileTap={{ scale: 0.96, y: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`
                  relative flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }
                `}
              >
                <motion.span
                  variants={iconVariants}
                  className={`
                    flex-shrink-0 relative z-20
                    ${isActive ? "text-white" : iconColor}
                  `}
                >
                  {tab.icon}
                </motion.span>
                <span className={`relative z-20 ${isActive ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>{tab.name}</span>
                
                {isActive && (
                  <>
                    {/* 3D Color Pill */}
                    <motion.div 
                      layoutId="tools-pill-color" 
                      className={`absolute inset-0 rounded-full -z-10 ${brandColor}`} 
                      initial={false}
                      transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                      style={{ 
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' 
                      }} 
                    />
                    {/* 3D Gloss Layer */}
                    <motion.div 
                      layoutId="tools-pill-gloss" 
                      className="absolute inset-0 rounded-full -z-[5] pointer-events-none" 
                      initial={false}
                      transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                      style={{ 
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)' 
                      }} 
                    />
                  </>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
  );
};

export default ToolsTabNavigation;
