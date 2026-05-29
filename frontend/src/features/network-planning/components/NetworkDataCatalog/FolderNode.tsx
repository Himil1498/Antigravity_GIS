// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { ChevronRight, ChevronDown, FolderOpen, Folder, Layers, GripVertical, Pencil, MoreVertical, Trash2, Plus } from "lucide-react";
// import { FolderItem } from "../../types";
// import { RenderMapIcon } from "../../../../components/ui/RenderMapIcon";
// import { getFolderIconKey } from "../NetworkMap/MapIcons";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { darkFiberApiService } from "../../../../services/darkFiberApiService";
// import { toast } from "react-toastify";
// import { useAppSelector } from "../../../../store";

// export interface FolderNodeProps {
//   folder: FolderItem;
//   visibleIds: number[];
//   visibleFileIds?: number[];
//   onToggle: (ids: number[], visible: boolean) => void;
//   onToggleFile?: (id: number, visible: boolean) => void;
//   depth?: number;
//   forceExpand?: boolean;
//   parentName?: string;
//   isDraggable?: boolean;
// }

// const CountBadge: React.FC<{ count: number; isActive: boolean }> = ({ count, isActive }) => (
//   <div className={`flex-shrink-0 ml-2 mr-1 px-2 py-[1px] rounded-md flex items-center justify-center transition-all duration-500 ${
//     isActive ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium"
//   }`}>
//     <span className="text-[10px] tracking-wide select-none">{count}</span>
//   </div>
// );

// const AnimatedCheckbox = ({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: (e: any) => void }) => {
//   const ref = useRef<HTMLInputElement>(null);
//   useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  
//   return (
//     <div className="relative flex items-center justify-center w-4.5 h-4.5 mr-2 shrink-0">
//       <input type="checkbox" ref={ref} checked={checked} onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
//       <div className={`w-4 h-4 rounded-[6px] border-[1.5px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
//         checked || indeterminate 
//           ? "bg-indigo-500 border-indigo-500 shadow-[0_2px_8px_rgba(99,102,241,0.4)] scale-105" 
//           : "bg-transparent border-gray-300 dark:border-gray-500 group-hover:border-indigo-400"
//       }`}>
//         <svg viewBox="0 0 14 14" fill="none" className={`w-3 h-3 text-white stroke-current stroke-[2.5px] stroke-linecap-round stroke-linejoin-round transition-all duration-300 ${checked && !indeterminate ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
//           <polyline points="2.5 7.5 5.5 10.5 11.5 3.5" />
//         </svg>
//         <div className={`absolute w-2 h-[2.5px] bg-white rounded-full transition-all duration-300 ${indeterminate ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
//       </div>
//     </div>
//   );
// };

// const FolderNodeInner: React.FC<FolderNodeProps> = ({
//   folder, visibleIds, visibleFileIds = [], onToggle, onToggleFile,
//   depth = 0, forceExpand, parentName, isDraggable = false,
// }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editName, setEditName] = useState(folder.name);
//   const [isSaving, setIsSaving] = useState(false);
//   const contentRef = useRef<HTMLDivElement>(null);

//   const { user } = useAppSelector((state) => state.auth);
//   const canRename = user?.role === "admin" || user?.role === "superadmin" || user?.permissions?.includes("network:folder:rename" as any) || user?.directPermissions?.includes("network:folder:rename") || user?.permissions?.includes("*" as any);
//   const canDelete = user?.role === "admin" || user?.role === "superadmin" || user?.permissions?.includes("network:folder:delete" as any) || user?.directPermissions?.includes("network:folder:delete") || user?.permissions?.includes("*" as any);

//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
//     id: `folder-${folder.id}`,
//     disabled: !isDraggable,
//   });

//   const sortableStyle: React.CSSProperties = isDraggable ? {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.4 : 1,
//     zIndex: isDragging ? 50 : "auto",
//     position: 'relative'
//   } : {};

//   useEffect(() => { if (forceExpand) setExpanded(true); }, [forceExpand]);

//   const getAllFileIds = (item: FolderItem): number[] => {
//     let ids = item.files ? item.files.map((f) => f.id) : [];
//     if (item.children) item.children.forEach((c) => { ids.push(...getAllFileIds(c)); });
//     return ids;
//   };

//   const allFileIds = useMemo(() => getAllFileIds(folder), [folder]);
//   const visibleCount = allFileIds.filter((id) => visibleFileIds.includes(id)).length;
//   const isChecked = allFileIds.length > 0 ? visibleCount === allFileIds.length : visibleIds.includes(folder.id);
//   const isIndeterminate = visibleCount > 0 && visibleCount < allFileIds.length;

//   const getAllDescendantIds = (item: FolderItem): number[] => {
//     let ids = [item.id];
//     if (item.children) item.children.forEach((c) => { ids.push(...getAllDescendantIds(c)); });
//     return ids;
//   };

//   const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => onToggle(getAllDescendantIds(folder), e.target.checked);
//   const toggleExpand = () => hasChildren && setExpanded(!expanded);
//   const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpand(); } };

//   const hasFiles = folder.files && folder.files.length > 0;
//   const hasChildren = (folder.children && folder.children.length > 0) || hasFiles;
//   const firstFile = folder.files?.[0];
//   const featureCount = folder.featureCount ?? folder.count;

//   return (
//     <div ref={isDraggable ? setNodeRef : undefined} style={sortableStyle} className="flex flex-col select-none" {...(isDraggable ? attributes : {})}>
      
//       {/* Pill Row Highlight */}
//       <div className={`relative group/row flex items-center justify-between px-2 py-1 mx-2 my-[1px] rounded-[10px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
//         isChecked || isIndeterminate 
//           ? "bg-indigo-50/80 dark:bg-indigo-500/[0.12] shadow-[0_1px_2px_rgba(0,0,0,0.02)]" 
//           : "hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
//       } ${featureCount === 0 ? "opacity-50 grayscale" : ""}`}>
        
//         {/* Indentation offset */}
//         <div style={{ width: depth * 40 }} className="shrink-0 transition-all duration-300" />

//         <div className="flex items-center gap-1 overflow-hidden flex-1 relative z-10">
//           {isDraggable && (
//             <button {...listeners} className="p-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 opacity-100 transition-all">
//               <GripVertical className="w-3.5 h-3.5" />
//             </button>
//           )}

//           <button onClick={(e) => { e.stopPropagation(); toggleExpand(); }} onKeyDown={handleKeyDown}
//             className={`p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${!hasChildren ? 'invisible' : ''}`}
//             aria-expanded={expanded}>
//             {expanded ? <ChevronDown className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors" />}
//           </button>
          
//           <AnimatedCheckbox checked={isChecked} indeterminate={isIndeterminate} onChange={handleCheck} />
          
//           <div className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1 min-w-0 py-0.5" onClick={toggleExpand} role="treeitem" tabIndex={hasChildren ? 0 : -1} onKeyDown={handleKeyDown}>
//             <div className={`transition-transform duration-300 ${isChecked ? "scale-110" : ""}`}>
//               {(() => {
//                 const sysIcon = getFolderIconKey(folder, parentName);
//                 if (sysIcon) return <RenderMapIcon type={sysIcon} className="w-4 h-4 shrink-0" />;
//                 if (hasChildren) return expanded ? <FolderOpen className="w-4 h-4 text-indigo-500 shrink-0" /> : <Folder className="w-4 h-4 text-indigo-400 dark:text-indigo-500 shrink-0" />;
//                 if (firstFile?.icon_type) return <RenderMapIcon type={firstFile.icon_type} className="w-4 h-4" />;
//                 return <Layers className="w-4 h-4 text-gray-400 shrink-0" />;
//               })()}
//             </div>
//             {isEditing ? (
//               <input
//                 type="text"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 autoFocus
//                 disabled={isSaving}
//                 onClick={(e) => e.stopPropagation()}
//                 onKeyDown={async (e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     if (!editName.trim()) return;
//                     setIsSaving(true);
//                     try {
//                       await darkFiberApiService.updateFolder(folder.id, editName);
//                       folder.name = editName; // Local optimistic update
//                       setIsEditing(false);
//                       toast.success("Folder renamed successfully");
//                     } catch (err) {
//                       toast.error("Failed to rename folder");
//                       setEditName(folder.name); // Revert
//                     } finally {
//                       setIsSaving(false);
//                     }
//                   } else if (e.key === 'Escape') {
//                     setIsEditing(false);
//                     setEditName(folder.name);
//                   }
//                 }}
//                 onBlur={() => {
//                   setIsEditing(false);
//                   setEditName(folder.name);
//                 }}
//                 className="text-[13px] font-bold bg-white dark:bg-gray-800 border border-indigo-500 rounded px-1 text-gray-900 dark:text-white outline-none w-full"
//               />
//             ) : (
//               <span className={`text-[13px] truncate transition-colors duration-300 ${
//                 depth === 0 ? "font-bold" : "font-medium"
//               } ${
//                 isChecked || isIndeterminate ? "text-indigo-900 dark:text-indigo-100" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
//               }`} title={folder.name}>{folder.name}</span>
//             )}
//           </div>
          
//             {/* More Options Menu */}
//             {!isEditing && (canRename || canDelete) && (
//               <div className="ml-auto relative group/menu">
//                 <button
//                   className="p-1 text-gray-400 hover:text-indigo-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
//                   title="More Options"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <MoreVertical className="w-4 h-4" />
//                 </button>
//                 <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-lg p-1.5 min-w-[140px] z-[60]">
//                    {canRename && (
//                      <button 
//                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
//                        className="w-full text-left px-2 py-1.5 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
//                      >
//                        <Pencil className="w-3.5 h-3.5" /> Rename
//                      </button>
//                    )}
//                    {canDelete && (
//                      <button 
//                        onClick={(e) => { 
//                          e.stopPropagation(); 
//                          toast.info("Delete is handled via the main grid for safety."); 
//                        }}
//                        className="w-full text-left px-2 py-1.5 text-[12.5px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2 mt-0.5 transition-colors"
//                      >
//                        <Trash2 className="w-3.5 h-3.5" /> Delete
//                      </button>
//                    )}
//                 </div>
//               </div>
//             )}
//         </div>
//         {featureCount !== undefined && <CountBadge count={featureCount} isActive={isChecked || isIndeterminate} />}
//       </div>

//       <div className={`catalog-collapse ${expanded ? "catalog-collapse-open" : ""}`}>
//         <div ref={contentRef} className="relative flex flex-col pb-1">
//           {expanded && hasChildren && (
//             <>
//               {/* Premium Vertical Guide Line */}
//               <div className="absolute top-0 bottom-4 w-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 shadow-[0_0_2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover/parent:bg-indigo-300/50" style={{ left: (depth * 40) + 25 }} />
              
//               {folder.files?.map((file) => {
//                 const isFileChecked = visibleFileIds.includes(file.id);
//                 return (
//                   <div key={`file-${file.id}`} className={`relative group/item flex items-center px-2 py-1 mx-2 my-[1px] rounded-[10px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
//                     isFileChecked ? "bg-indigo-50/80 dark:bg-indigo-500/[0.12]" : "hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
//                   } ${(file.feature_count || 0) === 0 ? "opacity-50 grayscale hover:opacity-80" : ""}`}>
//                     {/* Horizontal Branch Connector for File */}
//                     <div className="absolute left-0 top-[1.1rem] h-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 transition-colors duration-300 group-hover/item:bg-indigo-400/50" style={{ left: (depth * 40) + 25, width: 30 }} />
                    
//                     {/* Deep File Indentation */}
//                     <div style={{ width: (depth + 1) * 40 }} className="shrink-0 transition-all duration-300" />
                    
//                     <div className="w-[24px] shrink-0 relative z-10 flex items-center justify-center" />
                    
//                     <AnimatedCheckbox checked={isFileChecked} indeterminate={false} onChange={(e) => onToggleFile?.(file.id, e.target.checked)} />

//                     <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer py-0.5" onClick={() => onToggleFile?.(file.id, !isFileChecked)}>
//                       <div className={`transition-transform duration-300 ${isFileChecked ? "scale-110" : ""}`}>
//                         {(() => {
//                           const fIcon = file.icon_type || folder.default_icon;
//                           return fIcon ? <RenderMapIcon type={fIcon} className="w-3.5 h-3.5 shrink-0" /> : <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
//                         })()}
//                       </div>
//                       <span className={`text-[12px] truncate transition-colors duration-300 font-medium ${
//                         isFileChecked ? "text-indigo-900 dark:text-indigo-100" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
//                       }`}>
//                         {file.name}
//                         {(file.feature_count || 0) > 0 && <span className="ml-1.5 text-[10.5px] text-gray-400/80 dark:text-gray-500 font-mono">({file.feature_count})</span>}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
              
//               {folder.children?.map((child) => (
//                 <div key={`folder-wrapper-${child.id}`} className="relative group/subfolder">
//                   {/* Horizontal Branch Connector for Subfolder */}
//                   <div className="absolute left-0 top-[1.1rem] h-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 transition-colors duration-300 group-hover/subfolder:bg-indigo-400/50" style={{ left: (depth * 40) + 25, width: 30 }} />
                  
//                   <FolderNode folder={child} visibleIds={visibleIds} visibleFileIds={visibleFileIds}
//                     onToggle={onToggle} onToggleFile={onToggleFile} depth={depth + 1} forceExpand={forceExpand} parentName={folder.name} />
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export const FolderNode = React.memo(FolderNodeInner);
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, ChevronDown, FolderOpen, Folder, Layers, GripVertical, Pencil, MoreVertical, Trash2 } from "lucide-react";
import { FolderItem } from "../../types";
import { RenderMapIcon } from "../../../../components/ui/RenderMapIcon";
import { getFolderIconKey } from "../NetworkMap/MapIcons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { darkFiberApiService } from "../../../../services/darkFiberApiService";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../store";

export interface FolderNodeProps {
  folder: FolderItem;
  visibleIds: number[];
  visibleFileIds?: number[];
  onToggle: (ids: number[], visible: boolean) => void;
  onToggleFile?: (id: number, visible: boolean) => void;
  depth?: number;
  forceExpand?: boolean;
  parentName?: string;
  isDraggable?: boolean;
}

// ─── Layout constants ────────────────────────────────────────────────────────
// All connector math derives from these two values so nothing ever drifts.
const INDENT_PX = 28;   // horizontal step per depth level
const GUIDE_X   = 24;   // px from row's left edge where the vertical guide sits
//                         (= px-2 row padding [8] + drag-grip [~6] + chevron-btn [~8])
// ─────────────────────────────────────────────────────────────────────────────

const CountBadge: React.FC<{ count: number; isActive: boolean }> = ({ count, isActive }) => (
  <div className={`flex-shrink-0 ml-1 px-1.5 py-[1px] rounded-md flex items-center justify-center transition-all duration-500 ${
    isActive
      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold"
      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium"
  }`}>
    <span className="text-[10px] tracking-wide select-none">{count}</span>
  </div>
);

const AnimatedCheckbox = ({
  checked, indeterminate, onChange,
}: {
  checked: boolean; indeterminate: boolean; onChange: (e: any) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <div className="relative flex items-center justify-center w-4 h-4 mr-1.5 shrink-0">
      <input type="checkbox" ref={ref} checked={checked} onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      <div className={`w-4 h-4 rounded-[6px] border-[1.5px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
        checked || indeterminate
          ? "bg-indigo-500 border-indigo-500 shadow-[0_2px_8px_rgba(99,102,241,0.4)] scale-105"
          : "bg-transparent border-gray-300 dark:border-gray-500 group-hover:border-indigo-400"
      }`}>
        <svg viewBox="0 0 14 14" fill="none" className={`w-3 h-3 text-white stroke-current stroke-[2.5px] stroke-linecap-round stroke-linejoin-round transition-all duration-300 ${
          checked && !indeterminate ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}>
          <polyline points="2.5 7.5 5.5 10.5 11.5 3.5" />
        </svg>
        <div className={`absolute w-2 h-[2.5px] bg-white rounded-full transition-all duration-300 ${
          indeterminate ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`} />
      </div>
    </div>
  );
};

const FolderNodeInner: React.FC<FolderNodeProps> = ({
  folder, visibleIds, visibleFileIds = [], onToggle, onToggleFile,
  depth = 0, forceExpand, parentName, isDraggable = false,
}) => {
  const [expanded, setExpanded]   = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName]   = useState(folder.name);
  const [isSaving, setIsSaving]   = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const canRename = user?.role === "admin" || user?.role === "superadmin"
    || user?.permissions?.includes("network:folder:rename" as any)
    || user?.directPermissions?.includes("network:folder:rename")
    || user?.permissions?.includes("*" as any);
  const canDelete = user?.role === "admin" || user?.role === "superadmin"
    || user?.permissions?.includes("network:folder:delete" as any)
    || user?.directPermissions?.includes("network:folder:delete")
    || user?.permissions?.includes("*" as any);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `folder-${folder.id}`,
    disabled: !isDraggable,
  });

  const sortableStyle: React.CSSProperties = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  } : {};

  useEffect(() => { if (forceExpand) setExpanded(true); }, [forceExpand]);

  const getAllFileIds = (item: FolderItem): number[] => {
    let ids = item.files ? item.files.map((f) => f.id) : [];
    if (item.children) item.children.forEach((c) => { ids.push(...getAllFileIds(c)); });
    return ids;
  };

  const allFileIds        = useMemo(() => getAllFileIds(folder), [folder]);
  const visibleCount      = allFileIds.filter((id) => visibleFileIds.includes(id)).length;
  const isChecked         = allFileIds.length > 0 ? visibleCount === allFileIds.length : visibleIds.includes(folder.id);
  const isIndeterminate   = visibleCount > 0 && visibleCount < allFileIds.length;

  const getAllDescendantIds = (item: FolderItem): number[] => {
    let ids = [item.id];
    if (item.children) item.children.forEach((c) => { ids.push(...getAllDescendantIds(c)); });
    return ids;
  };

  const handleCheck   = (e: React.ChangeEvent<HTMLInputElement>) => onToggle(getAllDescendantIds(folder), e.target.checked);
  const toggleExpand  = () => hasChildren && setExpanded((v) => !v);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpand(); }
  };

  const hasFiles    = folder.files && folder.files.length > 0;
  const hasChildren = (folder.children && folder.children.length > 0) || hasFiles;
  const firstFile   = folder.files?.[0];
  const featureCount = folder.featureCount ?? folder.count;

  // ── Derived connector positions ──────────────────────────────────────────
  // Where THIS row's vertical guide sits (absolute left inside the row div)
  const guideLeft    = depth * INDENT_PX + GUIDE_X;
  // Where children's content should start (right edge of their branch connector)
  const childIndent  = guideLeft + INDENT_PX;
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={isDraggable ? setNodeRef : undefined}
      style={sortableStyle}
      className="flex flex-col select-none"
      {...(isDraggable ? attributes : {})}
    >
      {/* ── Pill row ─────────────────────────────────────────────────────── */}
      <div className={`relative group/row flex items-center px-2 py-1 mx-1 my-[1px] rounded-[10px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isChecked || isIndeterminate
          ? "bg-indigo-50/80 dark:bg-indigo-500/[0.12] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          : "hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
      } ${featureCount === 0 ? "opacity-50 grayscale" : ""}`}>

        {/* Incoming Horizontal Branch from Parent */}
        {depth > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 group-hover/row:bg-indigo-400/50 transition-colors duration-300 pointer-events-none"
            style={{ 
              left: (depth - 1) * INDENT_PX + GUIDE_X, 
              width: 8 + INDENT_PX - GUIDE_X // Exactly touches the chevron
            }}
          />
        )}

        {/* Depth indent spacer */}
        <div style={{ width: depth * INDENT_PX }} className="shrink-0" />

        {/* Drag handle */}
        {isDraggable && (
          <button
            {...listeners}
            className="p-0.5 mr-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all shrink-0"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Expand chevron */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
          onKeyDown={handleKeyDown}
          className={`p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 ${!hasChildren ? "invisible" : ""}`}
          aria-expanded={expanded}
        >
          {expanded
            ? <ChevronDown  className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            : <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover/row:text-indigo-500 transition-colors" />}
        </button>

        {/* Checkbox */}
        <AnimatedCheckbox checked={isChecked} indeterminate={isIndeterminate} onChange={handleCheck} />

        {/* Icon + label — flex-1 min-w-0 so truncate works */}
        <div
          className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0 cursor-pointer py-0.5"
          onClick={toggleExpand}
          role="treeitem"
          tabIndex={hasChildren ? 0 : -1}
          onKeyDown={handleKeyDown}
        >
          <div className={`shrink-0 transition-transform duration-300 ${isChecked ? "scale-110" : ""}`}>
            {(() => {
              const sysIcon = getFolderIconKey(folder, parentName);
              if (sysIcon)              return <RenderMapIcon type={sysIcon} className="w-4 h-4 shrink-0" />;
              if (hasChildren) return expanded
                ? <FolderOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                : <Folder     className="w-4 h-4 text-indigo-400 dark:text-indigo-500 shrink-0" />;
              if (firstFile?.icon_type) return <RenderMapIcon type={firstFile.icon_type} className="w-4 h-4 shrink-0" />;
              return <Layers className="w-4 h-4 text-gray-400 shrink-0" />;
            })()}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              disabled={isSaving}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); e.stopPropagation();
                  if (!editName.trim()) return;
                  setIsSaving(true);
                  try {
                    await darkFiberApiService.updateFolder(folder.id, editName);
                    folder.name = editName;
                    setIsEditing(false);
                    toast.success("Folder renamed successfully");
                  } catch {
                    toast.error("Failed to rename folder");
                    setEditName(folder.name);
                  } finally {
                    setIsSaving(false);
                  }
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(folder.name);
                }
              }}
              onBlur={() => { setIsEditing(false); setEditName(folder.name); }}
              className="text-[13px] font-bold bg-white dark:bg-gray-800 border border-indigo-500 rounded px-1 text-gray-900 dark:text-white outline-none w-full min-w-0"
            />
          ) : (
            <span
              className={`text-[13px] break-words whitespace-normal leading-tight transition-colors duration-300 flex-1 ${
                depth === 0 ? "font-bold" : "font-medium"
              } ${
                isChecked || isIndeterminate
                  ? "text-indigo-900 dark:text-indigo-100"
                  : "text-gray-700 dark:text-gray-300 group-hover/row:text-gray-900 dark:group-hover/row:text-white"
              }`}
              title={folder.name}
            >
              {folder.name}
            </span>
          )}
        </div>

        {/* Context menu */}
        {!isEditing && (canRename || canDelete) && (
          <div className="relative group/menu shrink-0">
            <button
              className="p-1 text-gray-400 hover:text-indigo-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
              title="More Options"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-lg p-1.5 min-w-[140px] z-[60]">
              {canRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="w-full text-left px-2 py-1.5 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Rename
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); toast.info("Delete is handled via the main grid for safety."); }}
                  className="w-full text-left px-2 py-1.5 text-[12.5px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2 mt-0.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Count badge */}
        {featureCount !== undefined && (
          <CountBadge count={featureCount} isActive={isChecked || isIndeterminate} />
        )}
      </div>

      {/* ── Children ─────────────────────────────────────────────────────── */}
      <div className={`catalog-collapse ${expanded ? "catalog-collapse-open" : ""}`}>
        <div ref={contentRef} className="relative flex flex-col pb-1">
          {expanded && hasChildren && (
            <>
              {/* Vertical guide line — anchored at guideLeft */}
              <div
                className="absolute top-0 bottom-4 w-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 transition-all duration-300"
                style={{ left: guideLeft }}
              />

              {/* ── File rows ─────────────────────────────────────────── */}
              {folder.files?.map((file) => {
                const isFileChecked = visibleFileIds.includes(file.id);
                return (
                  <div
                    key={`file-${file.id}`}
                    className={`relative group/item flex items-center px-2 py-1 mx-1 my-[1px] rounded-[10px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isFileChecked
                        ? "bg-indigo-50/80 dark:bg-indigo-500/[0.12]"
                        : "hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
                    } ${(file.feature_count || 0) === 0 ? "opacity-50 grayscale hover:opacity-80" : ""}`}
                  >
                    {/* Horizontal branch: exactly touches the checkbox */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-gray-200/80 dark:bg-gray-700/50 group-hover/item:bg-indigo-400/50 transition-colors duration-300 pointer-events-none"
                      style={{ left: guideLeft, width: 8 + INDENT_PX }}
                    />

                    {/* Indent spacer — pushes content to childIndent */}
                    <div style={{ width: childIndent }} className="shrink-0" />

                    <AnimatedCheckbox
                      checked={isFileChecked}
                      indeterminate={false}
                      onChange={(e) => onToggleFile?.(file.id, e.target.checked)}
                    />

                    <div
                      className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0 cursor-pointer py-0.5"
                      onClick={() => onToggleFile?.(file.id, !isFileChecked)}
                    >
                      <div className={`shrink-0 transition-transform duration-300 ${isFileChecked ? "scale-110" : ""}`}>
                        {(() => {
                          const fIcon = file.icon_type || folder.default_icon;
                          return fIcon
                            ? <RenderMapIcon type={fIcon} className="w-3.5 h-3.5 shrink-0" />
                            : <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
                        })()}
                      </div>
                      <span className={`text-[12px] break-words whitespace-normal leading-tight transition-colors duration-300 font-medium flex-1 ${
                        isFileChecked
                          ? "text-indigo-900 dark:text-indigo-100"
                          : "text-gray-600 dark:text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-200"
                      }`}>
                        {file.name}
                        {(file.feature_count || 0) > 0 && (
                          <span className="ml-1 text-[10.5px] text-gray-400/80 dark:text-gray-500 font-mono">
                            ({file.feature_count})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* ── Sub-folder rows ───────────────────────────────────── */}
              {folder.children?.map((child) => (
                <div key={`folder-wrapper-${child.id}`} className="relative group/subfolder">
                  <FolderNode
                    folder={child}
                    visibleIds={visibleIds}
                    visibleFileIds={visibleFileIds}
                    onToggle={onToggle}
                    onToggleFile={onToggleFile}
                    depth={depth + 1}
                    forceExpand={forceExpand}
                    parentName={folder.name}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const FolderNode = React.memo(FolderNodeInner);