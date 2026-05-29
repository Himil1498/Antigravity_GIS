import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Wrench } from 'lucide-react';
import ToolsTabNavigation from './ToolsTabNavigation';
import { toolTabs, type ToolTab } from './toolsTabs';

const ToolsLayout: React.FC = () => {
  const location = useLocation();

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  // Determine active tab from URL path
  let activeTab: ToolTab = 'excel-to-kml';
  if (location.pathname.includes('/kml-kmz')) {
    activeTab = 'kml-kmz';
  } else if (location.pathname.includes('/viewer')) {
    activeTab = 'viewer';
  } else if (location.pathname.includes('/kml-to-excel')) {
    activeTab = 'kml-to-excel';
  }

  // Determine dynamic colors based on activeTab
  const activeBrandColor = 
    activeTab === 'excel-to-kml' ? 'from-orange-500 to-orange-600 text-orange-600 dark:text-orange-400' :
    activeTab === 'kml-to-excel' ? 'from-violet-500 to-violet-600 text-violet-600 dark:text-violet-400' :
    activeTab === 'viewer' ? 'from-blue-500 to-blue-600 text-blue-600 dark:text-blue-400' :
    'from-emerald-500 to-emerald-600 text-emerald-600 dark:text-emerald-400';

  const gradientClasses = activeBrandColor.split(' ').slice(0, 2).join(' ');
  const textClasses = activeBrandColor.split(' ').slice(2).join(' ');

  return (
    <>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pt-16 overflow-hidden">
        
        {/* Sticky Header & Tabs Container */}
        <div className="z-[40] bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          {/* Top Header */}
          <div 
            className="bg-white dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 relative overflow-hidden"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
                <div className="flex items-center space-x-3">
                  <motion.div 
                     className="flex-shrink-0 cursor-pointer"
                     initial="idle"
                     whileHover="hover"
                  >
                     <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradientClasses} flex items-center justify-center`} style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' }}>
                       <motion.div variants={iconVariants}>
                         <Wrench className="h-5 w-5 text-white" />
                       </motion.div>
                     </div>
                  </motion.div>
                  <div>
                    <h1 className={`text-xl font-bold ${textClasses}`}>
                      Geospatial Tools
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Powerful standalone conversion and processing modules for your network data.
                    </p>
                  </div>
                </div>

                {/* Local Tab Navigation now in Header Right Side */}
                <ToolsTabNavigation tabs={toolTabs} activeTab={activeTab} />
              </div>
            </div>
          </div>
        </div>

        {/* Render the selected tool - FLEX-1 MIN-H-0 is the secret to zero scroll */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 pt-2 pb-2 overflow-hidden">
          <Outlet />
        </div>

      </div>
    </>
  );
};

export default ToolsLayout;
