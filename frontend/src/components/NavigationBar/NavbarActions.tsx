import React from "react";
import { motion, Variants } from "framer-motion";
import { NotificationBell } from "./NotificationBell/index";
import HelpMenu from "./HelpMenu/index";
import { updatesApi } from "../../services/api/systemUpdatesApiService";

interface NavbarActionsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUpdates?: () => void;
}

const NavbarActions: React.FC<NavbarActionsProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenUpdates,
}) => {
  const [hasUnreadUpdates, setHasUnreadUpdates] = React.useState(false);

  // Check for unread updates (Industry standard seen status)
  const checkUnreadUpdates = React.useCallback(async () => {
    try {
      const lastCheck = localStorage.getItem('opticonnect_last_updates_check');
      const res = await updatesApi.getPublishedUpdates(1, 1); // Just get the latest one
      
      if (res.data && res.data.length > 0) {
        const latestUpdateAt = new Date(res.data[0].created_at).getTime();
        const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
        
        setHasUnreadUpdates(latestUpdateAt > lastCheckTime);
      }
    } catch (error) {
      console.error('Failed to check unread updates', error);
    }
  }, []);

  React.useEffect(() => {
    checkUnreadUpdates();

    // Re-check periodically or listen for custom event
    const handleUpdateChange = () => checkUnreadUpdates();
    window.addEventListener('opticonnect:refresh_updates_badge', handleUpdateChange);
    window.addEventListener('system:update_published', handleUpdateChange);
    
    // Also check when localStorage changes (in case of multi-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'opticonnect_last_updates_check') checkUnreadUpdates();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('opticonnect:refresh_updates_badge', handleUpdateChange);
      window.removeEventListener('system:update_published', handleUpdateChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [checkUnreadUpdates]);

  const handleOpenUpdates = () => {
    if (onOpenUpdates) {
      onOpenUpdates();
      // Optimistically clear badge
      setHasUnreadUpdates(false);
    }
  };

  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.25, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="flex items-center premium-header-capsule">
      {/* Help Menu */}
      <HelpMenu />

      {/* What's New - System Updates */}
      {onOpenUpdates && (
        <motion.button
          onClick={handleOpenUpdates}
          initial="idle"
          whileHover="hover"
          className="px-2.5 py-2 text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 transition-all duration-200 flex items-center group relative rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50"
          title="What's New"
        >
          <motion.svg 
            variants={iconVariants}
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </motion.svg>
          
          {/* Notification Badge */}
          {hasUnreadUpdates && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-500 border border-white dark:border-gray-800"></span>
            </span>
          )}
        </motion.button>
      )}

      {/* Theme Toggle */}
      <motion.button
        onClick={onToggleDarkMode}
        initial="idle"
        whileHover="hover"
        className="px-2.5 py-2 transition-all duration-200 flex items-center group rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50"
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          // Moon icon
          <motion.svg
            variants={iconVariants}
            className="h-5 w-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        ) : (
          // Sun icon
          <motion.svg
            variants={iconVariants}
            className="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </motion.svg>
        )}
      </motion.button>

      {/* Notification Bell */}
      <NotificationBell />
    </div>
  );
};

export default NavbarActions;

