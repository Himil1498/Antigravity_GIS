import React, { useState, useRef, useEffect } from "react";
import type { GraphType } from "../hooks/useChartConfig";

interface GraphTypeSelectorProps {
  graphType: GraphType;
  setGraphType: (type: GraphType) => void;
}

const graphOptions: { value: GraphType; label: string; icon: string }[] = [
  { value: "gradient", label: "Gradient", icon: "🌈" },
  { value: "area", label: "Area", icon: "⛰️" },
  { value: "line", label: "Line", icon: "📈" },
  { value: "scatter", label: "Scatter", icon: "✨" },
];

const GraphTypeSelector: React.FC<GraphTypeSelectorProps> = ({
  graphType,
  setGraphType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = graphOptions.find((opt) => opt.value === graphType) || graphOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mr-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-white/70 dark:bg-slate-700/70 backdrop-blur-md border border-white/60 dark:border-slate-600/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] text-slate-700 dark:text-slate-200 text-[11px] font-extrabold tracking-wider rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:outline-none pl-3 pr-2 py-1 hover:bg-white/90 dark:hover:bg-slate-600 transition-all h-9 uppercase"
        title="Select Graph Style"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-sm">{selectedOption.icon}</span>
          {selectedOption.label}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1.5 z-[100] transform origin-top-left transition-all overflow-hidden">
          {graphOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setGraphType(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold transition-colors ${
                graphType === option.value
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-sm">{option.icon}</span>
              <span className="uppercase tracking-wide">{option.label}</span>
              {graphType === option.value && (
                <svg className="w-3.5 h-3.5 ml-auto text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraphTypeSelector;
