import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Network,
  FolderTree,
  FileCheck,
  PlusCircle,
  Trash2,
  HardDriveUpload,
  Building2,
  MapPin,
  ClipboardList,
  RotateCcw
} from "lucide-react";

type FlowTab = "infrastructure" | "feasibility" | "assets";

export type ThemeColor = "blue" | "emerald" | "indigo" | "purple" | "amber" | "orange" | "rose" | "pink" | "cyan";

interface StepData {
  id: number;
  title: string;
  description: string[];
  icon: any;
  theme: ThemeColor;
}

const INFRASTRUCTURE_FLOW: StepData[] = [
  {
    id: 1,
    title: "System Folders",
    description: [
      "The directory starts with two primary root folders: 'Customer' and 'Infrastructure'.",
      "Visibility is strictly RBAC-filtered. Users will only see designated child folders applicable to their business unit.",
    ],
    icon: FolderTree,
    theme: "blue"
  },
  {
    id: 2,
    title: "Customer Directory",
    description: [
      "Houses system-generated partner folders (Airtel, BSNL, Jio, Tata, etc.).",
      "These directories contain Approved feasibility data, imported customer external files, and live inventory entries.",
    ],
    icon: Building2,
    theme: "purple"
  },
  {
    id: 3,
    title: "Infrastructure Directory",
    description: [
      "Houses internal operational folders (Data Center, POP, Office Location, Node, etc.).",
      "Contains live infrastructure assets and imported vendor files natively integrated into the system."
    ],
    icon: Network,
    theme: "emerald"
  },
  {
    id: 4,
    title: "Data Import Engine",
    description: [
      "Permitted users can upload custom KML/KMZ payloads directly into specific folders.",
      "Imported datasets are instantly integrated and become visible globally via the Network Catalog on the Main Map."
    ],
    icon: HardDriveUpload,
    theme: "indigo"
  }
];

const FEASIBILITY_FLOW: StepData[] = [
  {
    id: 1,
    title: "Review Pipeline",
    description: [
      "Project Managers (PMs) access the dashboard to evaluate reports submitted by engineers via the 'Send for Review' map tool.",
      "The queue lists reports currently in the 'Sent' or 'Revalidated' states.",
    ],
    icon: ClipboardList,
    theme: "amber"
  },
  {
    id: 2,
    title: "Evaluation Actions",
    description: [
      "PMs can parse full report details natively or hit 'View on Main Map' to visually inspect the drafted topology.",
      "Available execution commands: Approve, Reject, or Revalidate (request changes).",
    ],
    icon: MapPin,
    theme: "cyan"
  },
  {
    id: 3,
    title: "Approval Mechanics",
    description: [
      "If Approved, the abstract report data materializes and moves permanently into the corresponding structured Customer folder.",
      "The completed integration immediately broadcasts to the live Network Catalog under the Reports Tab."
    ],
    icon: FileCheck,
    theme: "emerald"
  }
];

const ASSETS_FLOW: StepData[] = [
  {
    id: 1,
    title: "Live Inventory Creation",
    description: [
      "Engineers use a structured multipart form to inject new live infrastructure into the ecosystem.",
      "Includes precise location designation (Click & Pick directly from Map), Address details, and Technical specs like Bandwidth and Power Source.",
    ],
    icon: PlusCircle,
    theme: "blue"
  },
  {
    id: 2,
    title: "Asset Lifecycle",
    description: [
      "Upon creation, the geometry immediately populates the applicable operational folder and renders on the Main Map via the Catalog.",
      "The asset remains editable by authorized personnel throughout its operational lifecycle.",
    ],
    icon: Network,
    theme: "indigo"
  },
  {
    id: 3,
    title: "Recycle Bin Operations",
    description: [
      "Data loss prevention: Any deleted live or approved feature is intercepted and moved to the secure Recycle Bin.",
      "Only elevated administrators possess the clearance to access this quadrant.",
    ],
    icon: Trash2,
    theme: "rose"
  },
  {
    id: 4,
    title: "Terminal Commands",
    description: [
      "Administrators reviewing the Recycle Bin can command a full structural Restore of the object, returning it to the Map.",
      "Alternatively, they may execute a Permanent Deletion, burning the record from the database entirely."
    ],
    icon: RotateCcw,
    theme: "amber"
  }
];

const TABS = [
  { id: "infrastructure", label: "Infrastructure Explorer", icon: FolderTree },
  { id: "feasibility", label: "Feasibility Reviews", icon: FileCheck },
  { id: "assets", label: "Asset Management", icon: PlusCircle }
];

export const NetworkPlanningGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FlowTab>("infrastructure");

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
      case "infrastructure": return INFRASTRUCTURE_FLOW;
      case "feasibility": return FEASIBILITY_FLOW;
      case "assets": return ASSETS_FLOW;
      default: return INFRASTRUCTURE_FLOW;
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
              Network Planning
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Explore the framework for managing live infrastructure, feasibility pipelines, and system directories.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden shadow-blue-500/5">
          
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
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabNetworkPlanning"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" 
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

export default NetworkPlanningGuidePage;
