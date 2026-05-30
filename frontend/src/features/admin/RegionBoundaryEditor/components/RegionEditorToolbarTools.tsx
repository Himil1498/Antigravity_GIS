import React from "react";
import {
  MousePointer2,
  PenLine,
  Layers,
  Download,
  Upload,
  RotateCcw,
  Undo2,
  Redo2,
  Save,
  Maximize,
  Wand2,
  ShieldAlert,
  Combine,
} from "lucide-react";

interface RegionEditorToolbarToolsProps {
  editMode: boolean;
  activeMode: 'select' | 'add_point' | 'boolean';
  onChangeMode: (mode: 'select' | 'add_point' | 'boolean') => void;
  showPolygonManager: boolean;
  onTogglePolygonManager: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onResetClick: () => void;
  showReferences: boolean;
  onToggleReferences: () => void;
  showOriginal: boolean;
  onToggleOriginal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  hasChanges: boolean;
  saving: boolean;
  onFitBounds: () => void;
  onAutoSnap: () => void;
  isAutoSnapping?: boolean;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

const RegionEditorToolbarTools: React.FC<RegionEditorToolbarToolsProps> = ({
  editMode,
  activeMode,
  onChangeMode,
  showPolygonManager,
  onTogglePolygonManager,
  onImportClick,
  onExportClick,
  onResetClick,
  showReferences,
  onToggleReferences,
  showOriginal,
  onToggleOriginal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  hasChanges,
  saving,
  onFitBounds,
  onAutoSnap,
  isAutoSnapping = false,
  onAnalyze,
  isAnalyzing = false,
}) => {
  const btnBase = "group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-1 transition-all duration-300 z-10";
  
  const getThemeVars = (id: string, active: boolean, disabled: boolean = false) => {
    if (disabled) {
      return "text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed";
    }
    switch (id) {
      case "select":
        return active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
          : "text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30";
      case "add_point":
        return active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30";
      case "manage":
        return active
          ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
          : "text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-100/50 dark:hover:bg-fuchsia-900/30";
      case "boolean":
        return active
          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
          : "text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30";
      case "import":
        return "text-amber-500 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/30";
      case "export":
        return "text-teal-600 dark:text-teal-400 hover:bg-teal-100/50 dark:hover:bg-teal-900/30";
      case "fit":
        return "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30";
      case "reset":
        return "text-red-500 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/30";
      case "save":
        return active 
          ? "bg-green-600 text-white shadow-md shadow-green-600/30 hover:bg-green-700" 
          : "bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400";
      case "references":
        return active
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
          : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30";
      case "original":
        return active
          ? "bg-yellow-500 text-slate-900 shadow-md shadow-yellow-500/30"
          : "text-yellow-600 dark:text-yellow-500 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30";
      case "autosnap":
        return "text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30";
      case "simplify":
        return "text-pink-600 dark:text-pink-400 hover:bg-pink-100/50 dark:hover:bg-pink-900/30";
      case "analyze":
        return active
          ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
          : "text-orange-600 dark:text-orange-500 hover:bg-orange-100/50 dark:hover:bg-orange-900/30";
      default:
        return active
          ? "bg-slate-600 text-white shadow-md shadow-slate-600/30"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50";
    }
  };

  return (
    <div className="flex items-center gap-1.5 ml-1">
      {/* Editor specific tools (Only show in edit mode) */}
      {editMode && (
        <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
          <button
            onClick={() => onChangeMode("select")}
            className={`${btnBase} ${getThemeVars("select", activeMode === "select")}`}
            title="Select Mode"
          >
            <span className={`transition-transform duration-300 ${activeMode === "select" ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <MousePointer2 size={16} strokeWidth={activeMode === "select" ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Select</span>
          </button>
          
          <button
            onClick={() => onChangeMode(activeMode === "add_point" ? "select" : "add_point")}
            className={`${btnBase} ${getThemeVars("add_point", activeMode === "add_point")}`}
            title="Add Vertex Mode"
          >
            <span className={`transition-transform duration-300 ${activeMode === "add_point" ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <PenLine size={16} strokeWidth={activeMode === "add_point" ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Vertex</span>
          </button>

          <button
            onClick={() => onChangeMode(activeMode === "boolean" ? "select" : "boolean")}
            className={`${btnBase} ${getThemeVars("boolean", activeMode === "boolean")}`}
            title="Boolean Operations (Merge/Subtract)"
          >
            <span className={`transition-transform duration-300 ${activeMode === "boolean" ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <Combine size={16} strokeWidth={activeMode === "boolean" ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Boolean</span>
          </button>

          <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-600/50 mx-0.5"></div>

          <button
            onClick={onTogglePolygonManager}
            className={`${btnBase} ${getThemeVars("manage", showPolygonManager)}`}
            title="Manage Parts"
          >
            <span className={`transition-transform duration-300 ${showPolygonManager ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <Layers size={16} strokeWidth={showPolygonManager ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Parts</span>
          </button>

          <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-600/50 mx-0.5"></div>

          <button
            onClick={onToggleReferences}
            className={`${btnBase} ${getThemeVars("references", showReferences)}`}
            title="Show Reference Boundaries"
          >
            <span className={`transition-transform duration-300 ${showReferences ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={showReferences ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Refs</span>
          </button>

          <button
            onClick={onAutoSnap}
            disabled={isAutoSnapping}
            className={`${btnBase} ${getThemeVars("autosnap", false, isAutoSnapping)}`}
            title="Auto Snap points to Reference"
          >
            {isAutoSnapping ? (
              <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
              </span>
            )}
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">
              {isAutoSnapping ? "..." : "Snap"}
            </span>
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`${btnBase} ${getThemeVars("analyze", false, isAnalyzing)}`}
            title="Analyze Overlaps & Gaps"
          >
            {isAnalyzing ? (
              <svg className="w-4 h-4 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
                <ShieldAlert size={16} strokeWidth={2} />
              </span>
            )}
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">
              {isAnalyzing ? "..." : "Analyze"}
            </span>
          </button>

          <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-600/50 mx-0.5"></div>

          <button
            onClick={onToggleOriginal}
            className={`${btnBase} ${getThemeVars("original", showOriginal)}`}
            title="Show Original Boundary"
          >
            <span className={`transition-transform duration-300 ${showOriginal ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={showOriginal ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Orig</span>
          </button>
        </div>
      )}

      {/* History & Action buttons */}
      {editMode && (
        <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`${btnBase} ${getThemeVars("undo", false, !canUndo)}`}
            title="Undo"
          >
            <span className={`transition-transform duration-300 ${!canUndo ? '' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <Undo2 size={16} strokeWidth={2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Undo</span>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`${btnBase} ${getThemeVars("redo", false, !canRedo)}`}
            title="Redo"
          >
            <span className={`transition-transform duration-300 ${!canRedo ? '' : 'group-hover:scale-110 group-hover:-translate-y-0.5'} inline-block`}>
              <Redo2 size={16} strokeWidth={2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Redo</span>
          </button>

          <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-600/50 mx-0.5"></div>
          
          <button
            onClick={onResetClick}
            className={`${btnBase} ${getThemeVars("reset", false)}`}
            title="Reset to Original"
          >
            <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
              <RotateCcw size={16} strokeWidth={2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Reset</span>
          </button>
        </div>
      )}

      {/* Universal Export & Fit Region */}
      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        <button
          onClick={onImportClick}
          className={`${btnBase} ${getThemeVars("import", false)}`}
          title="Import GeoJSON"
        >
          <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
            <Download size={16} strokeWidth={2} />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Import</span>
        </button>

        <button
          onClick={onExportClick}
          className={`${btnBase} ${getThemeVars("export", false)}`}
          title="Export GeoJSON"
        >
          <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
            <Upload size={16} strokeWidth={2} />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Export</span>
        </button>

        <button
          onClick={onFitBounds}
          className={`${btnBase} ${getThemeVars("fit", false)}`}
          title="Fit Region to Screen"
        >
          <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block`}>
            <Maximize size={16} strokeWidth={2} />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">Fit</span>
        </button>
      </div>

      {/* Save Button (Edit Mode Only) */}
      {editMode && (
        <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
           <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            className={`${btnBase} px-3 ${getThemeVars("save", hasChanges, !hasChanges || saving)}`}
            title="Save Draft"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save size={16} strokeWidth={2} />
            )}
            <span className="text-xs font-semibold ml-0.5">Save</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RegionEditorToolbarTools;
