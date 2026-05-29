import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  UserCheck, 
  Key,
  ExternalLink,
  CheckCircle2,
  X
} from "lucide-react";
import { useNotifications } from "../../../../components/NavigationBar/NotificationBell/useNotifications";
import { Notification } from "../../../../components/NavigationBar/NotificationBell/types";

const getNotificationConfig = (type: string) => {
  switch (type) {
    case "password_reset_request":
      return { icon: <Key className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Security" };
    case "user_verification":
      return { icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "User" };
    case "system_alert":
      return { icon: <AlertTriangle className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30", label: "System" };
    case "security_alert":
      return { icon: <ShieldAlert className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Critical" };
    case "region_request":
      return { icon: <Info className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Region" };
    default:
      return { icon: <Bell className="w-4 h-4" />, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", label: "Alert" };
  }
};

const NewNotifications: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, deleteNotif } = useNotifications();

  // Show only top 6 unread notifications on the dashboard
  const displayNotifications = notifications
    .filter((n: Notification) => !n.is_read)
    .slice(0, 6);

  if (isLoading && notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-blue-50/30 dark:from-indigo-900/10 dark:to-blue-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Daily alerts & status updates
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-full border border-rose-200 dark:border-rose-800/50">
            {unreadCount} NEW
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">No unread notifications to show.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayNotifications.map((notif: Notification, idx: number) => {
              const config = getNotificationConfig(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                >
                  <div className={`p-2.5 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                       <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        Dismiss
                      </button>
                      {notif.action_url && (
                        <a
                          href={notif.action_url}
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteNotif(notif.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700 text-center">
        <Link to="/notifications" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          View All Notifications
        </Link>
      </div>
    </div>
  );
};

export default NewNotifications;
