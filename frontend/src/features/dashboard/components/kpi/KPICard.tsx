import React from "react";
import { KPICardData } from '../../types/infrastructure.types';

interface KPICardProps {
  card: KPICardData;
}

const KPICard: React.FC<KPICardProps> = ({ card }) => {
  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    if (direction === "up") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    }
    if (direction === "down") {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return null;
  };

  const getTrendColor = (direction: "up" | "down" | "stable") => {
    if (direction === "up") return "text-green-600 dark:text-green-400";
    if (direction === "down") return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 relative group cursor-default hover:-translate-y-1 hover:z-50"
      style={{
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.08),
          0 6px 20px rgba(0,0,0,0.06),
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.04)
        `,
        borderLeft: card.rawColorHex ? `3px solid ${card.rawColorHex}` : undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `
          0 4px 16px rgba(0,0,0,0.12),
          0 12px 32px rgba(0,0,0,0.08),
          inset 0 1px 0 rgba(255,255,255,1),
          inset 0 -1px 0 rgba(0,0,0,0.06)
        `;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `
          0 2px 8px rgba(0,0,0,0.08),
          0 6px 20px rgba(0,0,0,0.06),
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.04)
        `;
      }}
    >
      {/* Inner wrapper to apply overflow-hidden for the progress bar without clipping the tooltip */}
      <div className="overflow-hidden rounded-xl flex flex-col h-full">
        <div 
          className={`${card.rawColorHex ? "" : card.bgColor} p-4 flex items-center justify-between`}
          style={card.rawColorHex ? { backgroundColor: `${card.rawColorHex}1A` } : undefined} // 1A is ~10% opacity
        >
          <div 
            className={card.rawColorHex ? "" : card.color}
            style={card.rawColorHex ? { color: card.rawColorHex } : undefined}
          >
            {card.icon}
          </div>
          {card.trend && (
            <div
              className={`flex items-center space-x-1 ${getTrendColor(
                card.trend.direction
              )}`}
            >
              {getTrendIcon(card.trend.direction)}
              <span className="text-xs font-semibold">{card.trend.value}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {card.title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {card.value}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {card.subtitle}
          </p>
          {card.trend && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {card.trend.label}
            </p>
          )}
        </div>

        <div 
          className={`${card.rawColorHex ? "" : card.bgColor} h-1 mt-auto`}
          style={card.rawColorHex ? { backgroundColor: `${card.rawColorHex}1A` } : undefined}
        >
          <div
            className={`h-full ${card.rawColorHex ? "" : card.color.replace("text-", "bg-")}`}
            style={{
              width: `${Math.min(((card.value as number) / 100) * 100, 100)}%`,
              backgroundColor: card.rawColorHex || undefined
            }}
          ></div>
        </div>
      </div>

      {/* Hover Tooltip Breakdown */}
      {card.breakdown && card.breakdown.length > 0 && (
        <div className="absolute z-[100] top-[105%] left-1/2 -translate-x-1/2 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-300 pointer-events-none drop-shadow-xl">
          <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-xl shadow-2xl">
            {/* Tooltip Arrow (Now on top pointing up) */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-t border-l border-gray-700 rotate-45"></div>
            
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-700/50 pb-1">
              Regions Breakdown
            </h4>
            <div className="max-h-56 overflow-y-auto custom-scrollbar pr-1 space-y-2">
              {card.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  {/* Top-level item */}
                  <div className="flex justify-between items-center text-sm py-0.5">
                    <span className={`truncate pr-3 ${item.type === "root_files" ? "text-amber-400 italic" : (item.type === "grouped" ? "text-indigo-300 font-bold" : "text-gray-300 font-medium")}`}>
                       {item.label}
                    </span>
                    <span className="text-white font-bold bg-gray-800 px-1.5 py-0.5 rounded-md text-xs">{item.count}</span>
                  </div>
                  
                  {/* Nested Sub-items (If any) */}
                  {item.subItems && (
                    <div className="pl-3 mt-1 ml-1 space-y-1 mb-1 border-l border-gray-700/50">
                      {item.subItems.map((sub: any, sIdx: number) => (
                         <div key={`sub-${sIdx}`} className="flex justify-between items-center text-[11px]">
                           <span className="text-gray-400 truncate pr-2">↳ {sub.label}</span>
                           <span className="text-gray-300 font-semibold">{sub.count}</span>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;

