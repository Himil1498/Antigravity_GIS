// import React from "react";
// import { Dialog, Transition } from "@headlessui/react";
// import { Fragment } from "react";
// import {
//   XMarkIcon,
//   MapPinIcon,
//   UserIcon,
//   ClockIcon,
//   FolderIcon,
//   DocumentIcon,
//   EyeIcon,
// } from "@heroicons/react/24/outline";

// interface RecycleBinDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   feature: any;
//   onRestore: () => void;
//   canRestore: boolean;
// }

// const RecycleBinDetailsModal: React.FC<RecycleBinDetailsModalProps> = ({
//   isOpen,
//   onClose,
//   feature,
//   onRestore,
//   canRestore,
// }) => {
//   if (!feature) return null;

//   const { properties, deleted_by_name, deleted_at, folder_name, file_name } =
//     feature;

//   // Filter internal properties
//   const displayProperties = Object.entries(properties || {}).filter(
//     ([key]) =>
//       ![
//         "id",
//         "created_at",
//         "updated_at",
//         "deleted_at",
//         "created_by",
//         "updated_by",
//         "deleted_by",
//         "geom",
//         "source",
//       ].includes(key),
//   );

//   return (
//     <Transition.Root show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-[90]" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
//         </Transition.Child>

//         <div className="fixed inset-0 z-10 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//               enterTo="opacity-100 translate-y-0 sm:scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0 sm:scale-100"
//               leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//             >
//               <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200 dark:border-gray-700">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
//                       <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                     </div>
//                     <div>
//                       <Dialog.Title
//                         as="h3"
//                         className="text-lg font-bold text-gray-900 dark:text-white leading-none"
//                       >
//                         {properties?.name || "Deleted Item"}
//                       </Dialog.Title>
//                       <span className="text-xs font-medium text-red-500 uppercase tracking-wider mt-1 block">
//                         Deleted {feature.type || 'Feature'}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={onClose}
//                     className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//                   >
//                     <XMarkIcon className="w-6 h-6" />
//                   </button>
//                 </div>

//                 {/* Content */}
//                 <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     {/* Left Column: Properties */}
//                     <div className="space-y-4">
//                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">
//                         {feature.type === 'folder' ? 'Folder' : feature.type === 'file' ? 'File' : 'Feature'} Properties
//                       </h4>
//                       <div className="space-y-3">
//                         {displayProperties.map(([key, value]) => (
//                           <div key={key} className="group">
//                             <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-0.5">
//                               {key.replace(/_/g, " ")}
//                             </dt>
//                             <dd className="text-sm font-semibold text-gray-900 dark:text-gray-200 break-words pl-2 border-l-2 border-transparent group-hover:border-indigo-500 transition-colors">
//                               {String(value)}
//                             </dd>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Right Column: Metadata */}
//                     <div className="space-y-6">
//                       <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
//                         <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-widest mb-3">
//                           Deletion Info
//                         </h4>
//                         <div className="space-y-3">
//                           <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
//                             <UserIcon className="w-4 h-4 opacity-70" />
//                             <span>
//                               Deleted by{" "}
//                               <span className="font-semibold">
//                                 {deleted_by_name || "Unknown"}
//                               </span>
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
//                             <ClockIcon className="w-4 h-4 opacity-70" />
//                             <span>
//                               {new Date(deleted_at).toLocaleString("en-IN")}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-600/30">
//                         <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
//                           Original Location
//                         </h4>
//                         <div className="space-y-3">
//                           {folder_name && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
//                               <FolderIcon className="w-4 h-4 text-indigo-500" />
//                               <span>{folder_name}</span>
//                             </div>
//                           )}
//                           {file_name && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
//                               <DocumentIcon className="w-4 h-4 text-emerald-500" />
//                               <span>{file_name}</span>
//                             </div>
//                           )}
//                           {(!feature.type || feature.type === 'feature') && feature.latitude && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
//                               <MapPinIcon className="w-4 h-4 text-amber-500" />
//                               <span>
//                                 {feature.latitude?.toFixed(5)},{" "}
//                                 {feature.longitude?.toFixed(5)}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
//                   <button
//                     type="button"
//                     className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
//                     onClick={onClose}
//                   >
//                     Close
//                   </button>
//                   {canRestore && (
//                     <button
//                       type="button"
//                       className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                       onClick={() => {
//                         onRestore();
//                         onClose();
//                       }}
//                     >
//                       Restore {feature.type ? feature.type.charAt(0).toUpperCase() + feature.type.slice(1) : 'Item'}
//                     </button>
//                   )}
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition.Root>
//   );
// };

// export default RecycleBinDetailsModal;


import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  FolderIcon,
  DocumentIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface RecycleBinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: any;
  onRestore: () => void;
  canRestore: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; lightColor: string; darkColor: string; lightBg: string; darkBg: string }> = {
  folder:  { label: "Folder",  lightColor: "#b45309", darkColor: "#fbbf24", lightBg: "rgba(217,119,6,0.1)",  darkBg: "rgba(251,191,36,0.1)"  },
  file:    { label: "File",    lightColor: "#059669", darkColor: "#34d399", lightBg: "rgba(5,150,105,0.1)",  darkBg: "rgba(52,211,153,0.1)"  },
  feature: { label: "Feature", lightColor: "#0284c7", darkColor: "#38bdf8", lightBg: "rgba(2,132,199,0.1)",  darkBg: "rgba(56,189,248,0.1)"  },
};

const RecycleBinDetailsModal: React.FC<RecycleBinDetailsModalProps> = ({
  isOpen,
  onClose,
  feature,
  onRestore,
  canRestore,
}) => {
  if (!feature) return null;

  const { properties, deleted_by_name, deleted_at, folder_name, file_name } = feature;
  const typeKey = feature.type || "feature";
  const typeConfig = TYPE_CONFIG[typeKey] ?? TYPE_CONFIG.feature;

  const displayProperties = Object.entries(properties || {}).filter(
    ([key]) =>
      !["id","created_at","updated_at","deleted_at","created_by","updated_by","deleted_by","geom","source"].includes(key)
  );

  const deletedDate = new Date(deleted_at);
  const formattedDate = deletedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formattedTime = deletedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        /* ─── Light mode tokens (default) ─── */
        .rbd-root {
          --rbd-bg:                   #ffffff;
          --rbd-bg-footer:            #f9fafb;
          --rbd-border:               rgba(0,0,0,0.08);
          --rbd-border-subtle:        rgba(0,0,0,0.06);
          --rbd-text-primary:         #111827;
          --rbd-text-secondary:       #4b5563;
          --rbd-text-muted:           #9ca3af;
          --rbd-text-empty:           #d1d5db;
          --rbd-shadow:               0 0 0 1px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.06);
          --rbd-backdrop:             rgba(15,15,20,0.4);
          --rbd-accent-top-start:     transparent;
          --rbd-accent-top-mid1:      rgba(239,68,68,0.3);
          --rbd-accent-top-mid2:      rgba(239,68,68,0.18);
          --rbd-accent-top-end:       transparent;
          --rbd-divider-mid:          rgba(0,0,0,0.07);
          --rbd-close-color:          #9ca3af;
          --rbd-close-hover-bg:       rgba(0,0,0,0.05);
          --rbd-close-hover-color:    #111827;
          --rbd-prop-border:          rgba(0,0,0,0.055);
          --rbd-prop-hover-bg:        rgba(0,0,0,0.025);
          --rbd-prop-key:             #9ca3af;
          --rbd-prop-val:             #111827;
          --rbd-scroll-thumb:         rgba(0,0,0,0.12);
          --rbd-scroll-hover:         rgba(0,0,0,0.22);
          /* Deletion card */
          --rbd-del-bg:               rgba(239,68,68,0.05);
          --rbd-del-border:           rgba(239,68,68,0.14);
          --rbd-del-label:            #dc2626;
          --rbd-del-icon:             #ef4444;
          --rbd-del-muted:            #991b1b;
          --rbd-del-strong:           #111827;
          --rbd-del-time:             #6b7280;
          /* Location card */
          --rbd-loc-bg:               rgba(0,0,0,0.022);
          --rbd-loc-border:           rgba(0,0,0,0.06);
          --rbd-loc-label:            #9ca3af;
          --rbd-loc-text:             #374151;
          --rbd-loc-mono:             #6b7280;
          --rbd-loc-folder:           #d97706;
          --rbd-loc-file:             #059669;
          --rbd-loc-pin:              #2563eb;
          /* Deleted chip */
          --rbd-chip-del-bg:          rgba(239,68,68,0.07);
          --rbd-chip-del-color:       #dc2626;
          --rbd-chip-del-border:      rgba(239,68,68,0.2);
          /* Trash badge */
          --rbd-trash-bg:             rgba(239,68,68,0.07);
          --rbd-trash-border:         rgba(239,68,68,0.14);
          --rbd-trash-icon:           #ef4444;
          /* Cancel btn */
          --rbd-cancel-color:         #6b7280;
          --rbd-cancel-bg:            rgba(0,0,0,0.04);
          --rbd-cancel-border:        rgba(0,0,0,0.09);
          --rbd-cancel-hover-bg:      rgba(0,0,0,0.07);
          --rbd-cancel-hover-color:   #111827;
          --rbd-cancel-hover-border:  rgba(0,0,0,0.14);
        }

        /* ─── Dark mode tokens (.dark class — Tailwind strategy) ─── */
        .dark .rbd-root {
          --rbd-bg:                   #18181b;
          --rbd-bg-footer:            rgba(0,0,0,0.2);
          --rbd-border:               rgba(255,255,255,0.08);
          --rbd-border-subtle:        rgba(255,255,255,0.05);
          --rbd-text-primary:         #f4f4f5;
          --rbd-text-secondary:       #a1a1aa;
          --rbd-text-muted:           #71717a;
          --rbd-text-empty:           #52525b;
          --rbd-shadow:               0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
          --rbd-backdrop:             rgba(0,0,0,0.65);
          --rbd-accent-top-start:     transparent;
          --rbd-accent-top-mid1:      rgba(239,68,68,0.5);
          --rbd-accent-top-mid2:      rgba(239,68,68,0.3);
          --rbd-accent-top-end:       transparent;
          --rbd-divider-mid:          rgba(255,255,255,0.07);
          --rbd-close-color:          #71717a;
          --rbd-close-hover-bg:       rgba(255,255,255,0.08);
          --rbd-close-hover-color:    #e4e4e7;
          --rbd-prop-border:          rgba(255,255,255,0.05);
          --rbd-prop-hover-bg:        rgba(255,255,255,0.02);
          --rbd-prop-key:             #71717a;
          --rbd-prop-val:             #e4e4e7;
          --rbd-scroll-thumb:         rgba(255,255,255,0.08);
          --rbd-scroll-hover:         rgba(255,255,255,0.15);
          --rbd-del-bg:               rgba(239,68,68,0.06);
          --rbd-del-border:           rgba(239,68,68,0.2);
          --rbd-del-label:            #f87171;
          --rbd-del-icon:             #f87171;
          --rbd-del-muted:            #fca5a5;
          --rbd-del-strong:           #f4f4f5;
          --rbd-del-time:             #a1a1aa;
          --rbd-loc-bg:               rgba(255,255,255,0.025);
          --rbd-loc-border:           rgba(255,255,255,0.06);
          --rbd-loc-label:            #71717a;
          --rbd-loc-text:             #d4d4d8;
          --rbd-loc-mono:             #a1a1aa;
          --rbd-loc-folder:           #fbbf24;
          --rbd-loc-file:             #34d399;
          --rbd-loc-pin:              #60a5fa;
          --rbd-chip-del-bg:          rgba(239,68,68,0.08);
          --rbd-chip-del-color:       #f87171;
          --rbd-chip-del-border:      rgba(239,68,68,0.25);
          --rbd-trash-bg:             rgba(239,68,68,0.08);
          --rbd-trash-border:         rgba(239,68,68,0.18);
          --rbd-trash-icon:           #f87171;
          --rbd-cancel-color:         #a1a1aa;
          --rbd-cancel-bg:            rgba(255,255,255,0.04);
          --rbd-cancel-border:        rgba(255,255,255,0.07);
          --rbd-cancel-hover-bg:      rgba(255,255,255,0.08);
          --rbd-cancel-hover-color:   #d4d4d8;
          --rbd-cancel-hover-border:  rgba(255,255,255,0.12);
        }

        /* ─── System preference fallback (no .dark class needed) ─── */
        @media (prefers-color-scheme: dark) {
          .rbd-root:not(.light .rbd-root) {
            --rbd-bg:                   #18181b;
            --rbd-bg-footer:            rgba(0,0,0,0.2);
            --rbd-border:               rgba(255,255,255,0.08);
            --rbd-border-subtle:        rgba(255,255,255,0.05);
            --rbd-text-primary:         #f4f4f5;
            --rbd-text-secondary:       #a1a1aa;
            --rbd-text-muted:           #71717a;
            --rbd-text-empty:           #52525b;
            --rbd-shadow:               0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
            --rbd-backdrop:             rgba(0,0,0,0.65);
            --rbd-accent-top-start:     transparent;
            --rbd-accent-top-mid1:      rgba(239,68,68,0.5);
            --rbd-accent-top-mid2:      rgba(239,68,68,0.3);
            --rbd-accent-top-end:       transparent;
            --rbd-divider-mid:          rgba(255,255,255,0.07);
            --rbd-close-color:          #71717a;
            --rbd-close-hover-bg:       rgba(255,255,255,0.08);
            --rbd-close-hover-color:    #e4e4e7;
            --rbd-prop-border:          rgba(255,255,255,0.05);
            --rbd-prop-hover-bg:        rgba(255,255,255,0.02);
            --rbd-prop-key:             #71717a;
            --rbd-prop-val:             #e4e4e7;
            --rbd-scroll-thumb:         rgba(255,255,255,0.08);
            --rbd-scroll-hover:         rgba(255,255,255,0.15);
            --rbd-del-bg:               rgba(239,68,68,0.06);
            --rbd-del-border:           rgba(239,68,68,0.2);
            --rbd-del-label:            #f87171;
            --rbd-del-icon:             #f87171;
            --rbd-del-muted:            #fca5a5;
            --rbd-del-strong:           #f4f4f5;
            --rbd-del-time:             #a1a1aa;
            --rbd-loc-bg:               rgba(255,255,255,0.025);
            --rbd-loc-border:           rgba(255,255,255,0.06);
            --rbd-loc-label:            #71717a;
            --rbd-loc-text:             #d4d4d8;
            --rbd-loc-mono:             #a1a1aa;
            --rbd-loc-folder:           #fbbf24;
            --rbd-loc-file:             #34d399;
            --rbd-loc-pin:              #60a5fa;
            --rbd-chip-del-bg:          rgba(239,68,68,0.08);
            --rbd-chip-del-color:       #f87171;
            --rbd-chip-del-border:      rgba(239,68,68,0.25);
            --rbd-trash-bg:             rgba(239,68,68,0.08);
            --rbd-trash-border:         rgba(239,68,68,0.18);
            --rbd-trash-icon:           #f87171;
            --rbd-cancel-color:         #a1a1aa;
            --rbd-cancel-bg:            rgba(255,255,255,0.04);
            --rbd-cancel-border:        rgba(255,255,255,0.07);
            --rbd-cancel-hover-bg:      rgba(255,255,255,0.08);
            --rbd-cancel-hover-color:   #d4d4d8;
            --rbd-cancel-hover-border:  rgba(255,255,255,0.12);
          }
        }

        /* ─── Base styles ─── */
        .rbd-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .rbd-mono   { font-family: 'DM Mono', monospace !important; }

        .rbd-scrollbar::-webkit-scrollbar       { width: 4px; }
        .rbd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .rbd-scrollbar::-webkit-scrollbar-thumb { background: var(--rbd-scroll-thumb); border-radius: 99px; }
        .rbd-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--rbd-scroll-hover); }

        .rbd-panel {
          background: var(--rbd-bg);
          border: 1px solid var(--rbd-border);
          box-shadow: var(--rbd-shadow);
        }

        .rbd-header {
          border-bottom: 1px solid var(--rbd-border-subtle);
        }

        /* Trash icon badge */
        .rbd-trash-badge {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--rbd-trash-bg);
          border: 1px solid var(--rbd-trash-border);
        }

        /* Close button */
        .rbd-close-btn {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          color: var(--rbd-close-color);
          transition: background 0.15s, color 0.15s;
        }
        .rbd-close-btn:hover {
          background: var(--rbd-close-hover-bg);
          color: var(--rbd-close-hover-color);
        }

        /* Chips */
        .rbd-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 99px;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .rbd-chip-deleted {
          background: var(--rbd-chip-del-bg);
          color: var(--rbd-chip-del-color);
          border: 1px solid var(--rbd-chip-del-border);
          background-image: repeating-linear-gradient(
            -55deg, transparent, transparent 3px,
            rgba(239,68,68,0.06) 3px, rgba(239,68,68,0.06) 6px
          );
        }

        /* Title */
        .rbd-title {
          font-size: 1.0625rem; font-weight: 600; line-height: 1.3; margin-bottom: 6px;
          color: var(--rbd-text-primary);
        }

        /* Section label */
        .rbd-section-label {
          font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 0.75rem;
          color: var(--rbd-text-muted);
        }

        /* Property rows */
        .rbd-prop-row {
          display: grid; grid-template-columns: 1fr 1.4fr;
          gap: 0.5rem; padding: 0.6rem 0.3rem;
          border-bottom: 1px solid var(--rbd-prop-border);
          align-items: baseline;
          border-radius: 6px;
          transition: background 0.12s;
        }
        .rbd-prop-row:last-child { border-bottom: none; }
        .rbd-prop-row:hover { background: var(--rbd-prop-hover-bg); }

        /* Info cards */
        .rbd-card {
          border-radius: 12px; padding: 1rem 1.1rem;
        }
        .rbd-card-del {
          background: var(--rbd-del-bg);
          border: 1px solid var(--rbd-del-border);
        }
        .rbd-card-loc {
          background: var(--rbd-loc-bg);
          border: 1px solid var(--rbd-loc-border);
        }

        /* Meta rows */
        .rbd-meta-row {
          display: flex; align-items: center; gap: 10px;
          padding: 0.4rem 0; font-size: 0.8125rem;
        }
        .rbd-meta-row svg { flex-shrink: 0; }

        /* Divider */
        .rbd-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--rbd-divider-mid), transparent);
        }

        /* Footer */
        .rbd-footer { background: var(--rbd-bg-footer); }

        /* Cancel btn */
        .rbd-cancel-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.1rem; border-radius: 10px;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--rbd-cancel-color);
          background: var(--rbd-cancel-bg);
          border: 1px solid var(--rbd-cancel-border);
          transition: all 0.15s;
        }
        .rbd-cancel-btn:hover {
          background: var(--rbd-cancel-hover-bg);
          color: var(--rbd-cancel-hover-color);
          border-color: var(--rbd-cancel-hover-border);
        }

        /* Restore btn — indigo works great on both modes */
        .rbd-restore-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 0.55rem 1.2rem; border-radius: 10px;
          font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.01em;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          box-shadow: 0 1px 2px rgba(99,102,241,0.25), 0 4px 12px rgba(99,102,241,0.18);
          border: 1px solid rgba(255,255,255,0.14);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .rbd-restore-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(99,102,241,0.3), 0 8px 20px rgba(99,102,241,0.28);
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        }
        .rbd-restore-btn:active { transform: translateY(0); }
      `}</style>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="rbd-root relative z-[90]" onClose={onClose}>

          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 backdrop-blur-md transition-opacity"
              style={{ background: "var(--rbd-backdrop)" }}
            />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-250"
                enterFrom="opacity-0 scale-95 translate-y-3"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-2"
              >
                <Dialog.Panel className="rbd-panel relative w-full max-w-2xl rounded-2xl overflow-hidden text-left">

                  {/* Top accent bar */}
                  <div
                    style={{
                      height: 1,
                      background: `linear-gradient(90deg,
                        var(--rbd-accent-top-start) 5%,
                        var(--rbd-accent-top-mid1) 30%,
                        var(--rbd-accent-top-mid2) 70%,
                        var(--rbd-accent-top-end) 95%
                      )`,
                    }}
                  />

                  {/* ── Header ── */}
                  <div className="rbd-header px-6 pt-5 pb-4" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>

                      <div className="rbd-trash-badge">
                        <TrashIcon style={{ width: 20, height: 20, color: "var(--rbd-trash-icon)" }} />
                      </div>

                      <div>
                        <Dialog.Title as="h2" className="rbd-title">
                          {properties?.name || "Deleted Item"}
                        </Dialog.Title>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* Type chip */}
                          <span
                            className="rbd-chip"
                            style={{
                              background: typeConfig.lightBg,
                              color: typeConfig.lightColor,
                              border: `1px solid ${typeConfig.lightColor}44`,
                            }}
                          >
                            {typeConfig.label}
                          </span>

                          {/* Deleted chip */}
                          <span className="rbd-chip rbd-chip-deleted">
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "var(--rbd-chip-del-color)",
                              display: "inline-block", flexShrink: 0,
                            }} />
                            Deleted
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="rbd-close-btn" onClick={onClose} aria-label="Close">
                      <XMarkIcon style={{ width: 17, height: 17 }} />
                    </button>
                  </div>

                  {/* ── Body ── */}
                  <div
                    className="rbd-scrollbar"
                    style={{ padding: "1.25rem 1.5rem", overflowY: "auto", maxHeight: "62vh" }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                      {/* Left: Properties */}
                      <div>
                        <p className="rbd-section-label">Properties</p>
                        {displayProperties.length > 0 ? (
                          <div>
                            {displayProperties.map(([key, value]) => (
                              <div className="rbd-prop-row" key={key}>
                                <dt className="rbd-mono" style={{ fontSize: "0.7rem", color: "var(--rbd-prop-key)", fontWeight: 500 }}>
                                  {key.replace(/_/g, " ")}
                                </dt>
                                <dd style={{ fontSize: "0.8125rem", color: "var(--rbd-prop-val)", fontWeight: 500, wordBreak: "break-word" }}>
                                  {String(value)}
                                </dd>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "0.8125rem", color: "var(--rbd-text-empty)", fontStyle: "italic" }}>
                            No additional properties
                          </p>
                        )}
                      </div>

                      {/* Right: Metadata */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

                        {/* Deletion info */}
                        <div className="rbd-card rbd-card-del">
                          <p className="rbd-section-label" style={{ color: "var(--rbd-del-label)" }}>
                            Deletion Info
                          </p>

                          <div className="rbd-meta-row">
                            <UserIcon style={{ width: 15, height: 15, color: "var(--rbd-del-icon)" }} />
                            <span>
                              <span style={{ color: "var(--rbd-del-muted)" }}>By </span>
                              <span style={{ color: "var(--rbd-del-strong)", fontWeight: 600 }}>
                                {deleted_by_name || "Unknown"}
                              </span>
                            </span>
                          </div>

                          <div className="rbd-meta-row">
                            <ClockIcon style={{ width: 15, height: 15, color: "var(--rbd-del-icon)" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <span style={{ color: "var(--rbd-del-strong)", fontWeight: 500 }}>{formattedDate}</span>
                              <span className="rbd-mono" style={{ fontSize: "0.7rem", color: "var(--rbd-del-time)" }}>{formattedTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        {(folder_name || file_name || feature.latitude) && (
                          <div className="rbd-card rbd-card-loc">
                            <p className="rbd-section-label" style={{ color: "var(--rbd-loc-label)" }}>
                              Original Location
                            </p>

                            {folder_name && (
                              <div className="rbd-meta-row">
                                <FolderIcon style={{ width: 15, height: 15, color: "var(--rbd-loc-folder)" }} />
                                <span style={{ fontSize: "0.8125rem", color: "var(--rbd-loc-text)" }}>{folder_name}</span>
                              </div>
                            )}
                            {file_name && (
                              <div className="rbd-meta-row">
                                <DocumentIcon style={{ width: 15, height: 15, color: "var(--rbd-loc-file)" }} />
                                <span style={{ fontSize: "0.8125rem", color: "var(--rbd-loc-text)" }}>{file_name}</span>
                              </div>
                            )}
                            {(!feature.type || feature.type === "feature") && feature.latitude && (
                              <div className="rbd-meta-row">
                                <MapPinIcon style={{ width: 15, height: 15, color: "var(--rbd-loc-pin)" }} />
                                <span className="rbd-mono" style={{ fontSize: "0.75rem", color: "var(--rbd-loc-mono)" }}>
                                  {feature.latitude?.toFixed(5)}, {feature.longitude?.toFixed(5)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="rbd-divider" />

                  {/* ── Footer ── */}
                  <div className="rbd-footer px-6 py-4" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                    <button className="rbd-cancel-btn" onClick={onClose}>
                      Close
                    </button>
                    {canRestore && (
                      <button
                        className="rbd-restore-btn"
                        onClick={() => { onRestore(); onClose(); }}
                      >
                        <ArrowUturnLeftIcon style={{ width: 14, height: 14 }} />
                        Restore {typeConfig.label}
                      </button>
                    )}
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default RecycleBinDetailsModal;