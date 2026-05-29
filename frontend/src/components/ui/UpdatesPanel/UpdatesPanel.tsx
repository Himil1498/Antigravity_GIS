import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updatesApi, SystemUpdate } from '../../../services/api/systemUpdatesApiService';

interface UpdatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatesPanel: React.FC<UpdatesPanelProps> = ({ isOpen, onClose }) => {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Industry Standard: Mark updates as "seen" when panel opens
      localStorage.setItem('opticonnect_last_updates_check', Date.now().toString());
      fetchUpdates();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      const res = await updatesApi.getPublishedUpdates(1, 10);
      setUpdates(res.data);
    } catch (error) {
      console.error('Failed to load updates', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'feature': return { label: 'Feature', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'bugfix': return { label: 'Bug Fix', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'maintenance': return { label: 'Maintenance', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'announcement': return { label: 'Announcement', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'auto-release': return { label: 'System Update', color: 'bg-green-100 text-green-800 border-green-200' };
      default: return { label: 'Update', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">What's New</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-gray-900">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No recent updates.</p>
                </div>
              ) : (
                updates.map((update) => {
                  const badge = getBadgeConfig(update.type);
                  return (
                    <div key={update.id} className="relative pl-6">
                      {/* Timeline line */}
                      <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-gray-200 dark:bg-gray-800 last-of-type:bottom-0"></div>
                      
                      {/* Timeline dot */}
                      <div className="absolute left-[-4.5px] top-2 h-[10px] w-[10px] rounded-full bg-fuchsia-500 border-2 border-white dark:border-gray-900 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
                      
                      <div className="mb-1 flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {(Date.now() - new Date(update.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000) && (
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-fuchsia-600 text-white shadow-sm animate-pulse">
                            New
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(update.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mt-1 mb-2">
                        {update.is_automated && <span title="Automated System Release" className="text-base">🤖</span>}
                        {update.title}
                        {update.version_tag && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded font-mono font-normal">
                            {update.version_tag}
                          </span>
                        )}
                      </h3>
                      
                      <div className="prose prose-sm prose-cyan dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {update.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpdatesPanel;
