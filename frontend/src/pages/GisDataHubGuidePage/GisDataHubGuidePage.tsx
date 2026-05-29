import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Database,
  Filter,
  Search,
  ListTree,
  Eye,
  Trash2,
  RefreshCw,
  BarChart3,
  Map as MapIcon,
  ServerCog
} from "lucide-react";

type FlowTab = "layout" | "filtering" | "management";

export type ThemeColor = "blue" | "emerald" | "indigo" | "purple" | "amber" | "orange" | "rose" | "pink" | "cyan";

interface StepData {
  id: number;
  title: string;
  description: string[];
  icon: any;
  theme: ThemeColor;
}

const LAYOUT_FLOW: StepData[] = [
  {
    id: 1,
    title: "Repository Overview",
    description: [
      "The GIS Data Hub serves as the central, synchronized repository for all spatial markings and topology saved from the Main Map.",
      "The top-level header features a global Refresh action to manually pull the latest backend states.",
    ],
    icon: Database,
    theme: "emerald"
  },
  {
    id: 2,
    title: "Tool Category Tabs",
    description: [
      "Records are strictly separated by the tool that generated them: Distance, Polygon, Circle, RF Sector, and Elevation.",
      "Selecting a tab instantly filters the dataset list and updates the global statistics context.",
    ],
    icon: ServerCog,
    theme: "indigo"
  },
  {
    id: 3,
    title: "Global Statistics Context",
    description: [
      "A dedicated metrics board renders Total Saved Records across the entire system.",
      "Dynamically counts sub-totals (e.g., Distance Count, Polygon Count) that react iteratively as filters are adjusted."
    ],
    icon: BarChart3,
    theme: "blue"
  }
];

const FILTERING_FLOW: StepData[] = [
  {
    id: 1,
    title: "Data Visibility Scopes",
    description: [
      "User-level visibility controls determine query boundaries: 'My Data Only', 'All Users', or search targeting a 'Specific User'.",
      "Visibility scope inherently depends on the active RBAC permissions of the current session.",
    ],
    icon: Filter,
    theme: "purple"
  },
  {
    id: 2,
    title: "Fuzzy Data Search",
    description: [
      "Enables targeted textual searches against the 'Saved Data Name' attribute.",
      "The data list reacts dynamically via live-filtering as the user types.",
    ],
    icon: Search,
    theme: "amber"
  },
  {
    id: 3,
    title: "Parametric Toggles",
    description: [
      "Tool-specific toggle layers (e.g., forcing visibility of datasets containing localized Elevation metadata)."
    ],
    icon: ListTree,
    theme: "cyan"
  }
];

const MANAGEMENT_FLOW: StepData[] = [
  {
    id: 1,
    title: "Record Identification",
    description: [
      "Each list entity provides clear identifiers: Object Name, Tool Indicator, Author, Current Status (Permanent/Temporary), and Creation Timestamp.",
      "A fast-read summary string exists on the list level (e.g., total distance in KM)."
    ],
    icon: Eye,
    theme: "emerald"
  },
  {
    id: 2,
    title: "Core Operations Menu",
    description: [
      "Details Mode: Expands the record to reveal full underlying metadata arrays and sub-parameters.",
      "Map Redirection: Triggers a routing command to the Main Map, aggressively loads the specific object's coordinates, and automatically zooms the viewport.",
    ],
    icon: MapIcon,
    theme: "blue"
  },
  {
    id: 3,
    title: "Deletion Mechanics",
    description: [
      "Single Target: Clicking the Trash icon explicitly triggers a hard-delete against the database for that specific entity.",
      "Bulk Operation: A global 'Delete All' command exists per tool-tab to clear entire categories, protected by an interactive confirmation loop.",
    ],
    icon: Trash2,
    theme: "rose"
  },
  {
    id: 4,
    title: "State Synchronization",
    description: [
      "A manual trigger to perform a full un-cached repository refresh, synchronizing the live UI state with any background writes securely."
    ],
    icon: RefreshCw,
    theme: "amber"
  }
];

const TABS = [
  { id: "layout", label: "Repository Layout", icon: Database },
  { id: "filtering", label: "Filtering & Search", icon: Filter },
  { id: "management", label: "Record Management", icon: ServerCog }
];

export const GisDataHubGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FlowTab>("layout");

  const getThemeClasses = (theme: ThemeColor) => {
    switch (theme) {
      case "blue": return { iconBg: "bg-blue-500", cardBg: "bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-800", border: "border-blue-100 dark:border-blue-900/50 group-hover:border-blue-300 dark:group-hover:border-blue-700", badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", bullet: "bg-blue-400" };
      case "emerald": return { iconBg: "bg-emerald-500", cardBg: "bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-800", border: "border-emerald-100 dark:border-emerald-900/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-700", badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", bullet: "bg-emerald-400" };
      case "indigo": return { iconBg: "bg-indigo-500", cardBg: "bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-800", border: "border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700", badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300", bullet: "bg-indigo-400" };
      case "purple": return { iconBg: "bg-purple-500", cardBg: "bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-800", border: "border-purple-100 dark:border-purple-900/50 group-hover:border-purple-300 dark:group-hover:border-purple-700", badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300", bullet: "bg-purple-400" };
      case "amber": return { iconBg: "bg-amber-500", cardBg: "bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/10 dark:to-slate-800", border: "border-amber-100 dark:border-amber-900/50 group-hover:border-amber-300 dark:group-hover:border-amber-700", badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300", bullet: "bg-amber-400" };
      case "rose": return { iconBg: "bg-rose-500", cardBg: "bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-900/10 dark:to-slate-800", border: "border-rose-100 dark:border-rose-900/50 group-hover:border-rose-300 dark:group-hover:border-rose-700", badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300", bullet: "bg-rose-400" };
      case "cyan": return { iconBg: "bg-cyan-500", cardBg: "bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-900/10 dark:to-slate-800", border: "border-cyan-100 dark:border-cyan-900/50 group-hover:border-cyan-300 dark:group-hover:border-cyan-700", badgeBg: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300", bullet: "bg-cyan-400" };
      default: return { iconBg: "bg-slate-500", cardBg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", badgeBg: "bg-slate-100 text-slate-700", bullet: "bg-slate-400" };
    }
  };

  const getActiveFlow = () => {
    switch(activeTab) {
      case "layout": return LAYOUT_FLOW;
      case "filtering": return FILTERING_FLOW;
      case "management": return MANAGEMENT_FLOW;
      default: return LAYOUT_FLOW;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-6 lg:p-12 font-sans select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/user-workflows')}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              GIS Data Hub operations
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Explore the central repository mechanics for saved network and spatial markers.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden shadow-emerald-500/5">
          
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FlowTab)}
                  className={`flex-1 min-w-[180px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md transform scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabDataHub"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" 
                      initial={false}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Flow Content */}
          <div className="p-8 lg:p-12 relative min-h-[400px] bg-slate-50 dark:bg-[#0f172a]/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-8 relative"
              >
                {/* Vertical Line Connector */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                {getActiveFlow().map((step, index) => {
                  const StepIcon = step.icon;
                  const theme = getThemeClasses(step.theme);

                  return (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                      className="relative z-10 flex items-start gap-6 group"
                    >
                      {/* Icon Node */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10 ring-4 ring-white dark:ring-slate-800 z-10 ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      
                      {/* Content Card */}
                      <div className={`flex-1 border rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-all duration-300 ${theme.cardBg} ${theme.border}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider shadow-sm ${theme.badgeBg}`}>
                            Section {step.id}
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {step.title}
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {step.description.map((desc, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 shadow-sm ${theme.bullet}`} />
                              <span className="leading-relaxed text-[15px] font-medium text-slate-600 dark:text-slate-300 shadow-white/10 text-shadow-sm">{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GisDataHubGuidePage;
