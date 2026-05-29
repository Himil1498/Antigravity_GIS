import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiService } from "../../services/api/index";
import { useAuth } from "../../contexts/AuthContext";

export const GlobalAnnouncement: React.FC = () => {
  const [publicUpdate, setPublicUpdate] = useState<{ id: number; title: string; content: string; type: string } | null>(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch if authenticated (login screen handles its own)
    if (!isAuthenticated) return;

    const fetchUpdates = async () => {
      try {
        const response = await apiService.get('/updates/public');
        if (response.data?.success && response.data.data) {
          const update = response.data.data;
          const dismissedId = localStorage.getItem('dismissed_notice_id');
          if (dismissedId !== String(update.id)) {
            setPublicUpdate(update);
          } else {
            setPublicUpdate(null);
          }
        } else {
          setPublicUpdate(null);
        }
      } catch (err) {
        console.error("Failed to fetch global updates", err);
      }
    };

    fetchUpdates();
    // Poll every 5 minutes (300000ms) for new announcements
    const interval = setInterval(fetchUpdates, 300000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]); // Re-check on nav

  const handleDismissNotice = () => {
    if (publicUpdate) {
      localStorage.setItem('dismissed_notice_id', String(publicUpdate.id));
      setPublicUpdate(null);
    }
  };

  // Only render on Dashboard page and if there is an update
  if (location.pathname !== '/dashboard' || !publicUpdate) return null;

  const getThemeClasses = (type?: string) => {
    switch(type?.toLowerCase()) {
      case 'maintenance':
      case 'critical':
      case 'outage':
      case 'alert':
        return {
          bg: "bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-700/50",
          text: "text-red-600 dark:text-red-400 font-semibold",
          icon: "text-red-600 dark:text-red-400",
          button: "text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/50"
        };
      case 'feature':
      case 'update':
      case 'info':
        return {
          bg: "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700/50",
          text: "text-blue-900 dark:text-blue-100",
          icon: "text-blue-600 dark:text-blue-400",
          button: "text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800/50"
        };
      case 'success':
        return {
          bg: "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700/50",
          text: "text-emerald-900 dark:text-emerald-100",
          icon: "text-emerald-600 dark:text-emerald-400",
          button: "text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
        };
      default: // 'warning', 'notice'
        return {
          bg: "bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-700/50",
          text: "text-amber-900 dark:text-amber-100",
          icon: "text-amber-600 dark:text-amber-400",
          button: "text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/50"
        };
    }
  };

  const theme = getThemeClasses(publicUpdate.type);

  return (
    <div className={`w-full px-4 py-2 text-sm shadow-sm relative z-10 border-b transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center flex-1 min-w-max">
          {publicUpdate.type?.toLowerCase() === 'maintenance' ? (
             <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          ) : (
             <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
          <span className="font-medium mr-2">Notice:</span> 
          <span>{publicUpdate.title} - {publicUpdate.content}</span>
        </div>
        <div className="flex-1 flex justify-end">
          <button 
            onClick={handleDismissNotice}
            className={`focus:outline-none p-1 rounded transition-colors ${theme.button}`}
            aria-label="Dismiss notice"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnnouncement;
