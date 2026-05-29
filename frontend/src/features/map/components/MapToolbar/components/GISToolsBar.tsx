/**
 * GIS Tools Horizontal Bar Component
 * Replaces the dropdown with an inline, horizontal set of tool icons for immediate access
 */

import React from "react";
import { GIS_TOOLS } from "../constants";
import type { GISToolType } from "../../../../../types/gisToolTypes/index";
import { useAppSelector } from "../../../../../store/index";
import { hasPermission } from "../../../../../utils/permissionUtils/checks";

interface GISToolsBarProps {
  activeTool: GISToolType | null;
  onToolSelect: (toolId: GISToolType) => void;
  hideLabels?: boolean;
  hideGeometrySuite?: boolean;
}

const GISToolsBar: React.FC<GISToolsBarProps> = ({
  activeTool,
  onToolSelect,
  hideLabels = false,
  hideGeometrySuite = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  const availableTools = React.useMemo(() => {
    if (!user) return [];

    return GIS_TOOLS.filter((tool) => {
      if (hideGeometrySuite && tool.id === "measurementSuite") return false;
      if (!tool.requiredPermission) return true;
      return hasPermission(user, tool.requiredPermission);
    });
  }, [user]);

  // If no tools available, don't render anything
  if (availableTools.length === 0) return null;

  const getThemeVars = (id: string, active: boolean) => {
    switch (id) {
      case "distance":
        return active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
          : "text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30";
      case "circle":
        return active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30";
      case "polygon":
        return active
          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
          : "text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30";
      case "elevation":
        return active
          ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
          : "text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/30";
      case "sectorRF":
        return active
          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
          : "text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30";
      case "measurementSuite":
        return active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50";
      default:
        return active
          ? "bg-slate-600 text-white shadow-md shadow-slate-600/30"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50";
    }
  };

  return (
    <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
      {availableTools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolSelect(isActive ? (null as any) : tool.id)} // Toggle off if already active
            className={`group relative h-8 px-1.5 rounded-lg flex justify-center items-center gap-0.5 transition-all duration-300 z-10 ${getThemeVars(tool.id, isActive)}`}
            title={tool.name}
            aria-label={tool.name}
          >
            <span className={`flex justify-center items-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>
              <tool.icon 
                size={16} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={!isActive && tool.id === "measurementSuite" ? "text-blue-500 dark:text-blue-400" : ""}
              />
            </span>
            {!hideLabels && (
              <span className="whitespace-nowrap text-xs font-semibold hidden lg:inline">
                {tool.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GISToolsBar;

