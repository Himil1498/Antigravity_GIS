import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ImportPreviewResult {
  totalFeatures: number;
  parsedRegions: Array<{
    id: number;
    name: string;
    code: string;
    action: string;
    isChanged: boolean;
  }>;
  notFoundNames: string[];
}

interface ImportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isImporting: boolean;
  data: ImportPreviewResult | null;
}

export const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isImporting,
  data,
}) => {
  if (!isOpen || !data) return null;

  const changesToPublish = data.parsedRegions.filter(r => r.isChanged).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isImporting ? undefined : onClose}
          className="absolute inset-0 bg-gray-900/40 dark:bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-700"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Preview
              </h3>
              <p className="text-sm text-gray-500 mt-1">Review changes before publishing to the live map.</p>
            </div>
            <button
              onClick={onClose}
              disabled={isImporting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Summary Banner */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{data.totalFeatures}</div>
                <div className="text-xs font-bold text-blue-800/60 dark:text-blue-300/60 uppercase tracking-wider mt-1">Found in File</div>
              </div>
              <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{changesToPublish}</div>
                <div className="text-xs font-bold text-amber-800/60 dark:text-amber-300/60 uppercase tracking-wider mt-1">Changes to Publish</div>
              </div>
              <div className="flex-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{data.notFoundNames.length}</div>
                <div className="text-xs font-bold text-rose-800/60 dark:text-rose-300/60 uppercase tracking-wider mt-1">Unmatched</div>
              </div>
            </div>

            {/* Changed Regions List */}
            {data.parsedRegions.length > 0 ? (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Regions to be Updated:</h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Region Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {data.parsedRegions.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 font-mono">{r.code}</td>
                          <td className="px-4 py-2 text-sm text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                              ${r.action === 'New' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                r.action === 'Update' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}
                            `}>
                              {r.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 mb-6">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-gray-900 dark:text-white font-bold text-lg">No Valid Regions Found</h4>
                <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                  The file doesn't contain any valid GeoJSON features with matching region names.
                </p>
              </div>
            )}

            {/* Unmatched Regions warning */}
            {data.notFoundNames.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/10 border-l-4 border-rose-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400">
                      Skipped {data.notFoundNames.length} features
                    </h3>
                    <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                      <p>The following names could not be matched to any regions in your system:</p>
                      <p className="mt-1 font-mono text-xs bg-rose-100 dark:bg-rose-900/40 px-2 py-1 rounded inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {data.notFoundNames.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isImporting || changesToPublish === 0}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-lg shadow-sm hover:shadow transition-all disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                "Confirm & Publish"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
