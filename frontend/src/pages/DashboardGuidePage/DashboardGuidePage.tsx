import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  ActivitySquare,
  BarChart3,
  Globe2,
  ServerCrash,
  UserCheck,
  Building,
  RadioTower,
  Clock,
  Zap,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

type FlowTab = "overview" | "health";

export type ThemeColor = "blue" | "emerald" | "indigo" | "purple" | "amber" | "orange" | "rose" | "pink" | "cyan" | "violet";

interface StepData {
  id: number;
  title: string;
  description: string[];
  icon: any;
  theme: ThemeColor;
}

const OVERVIEW_FLOW: StepData[] = [
  {
    id: 1,
    title: "Global Header Panel",
    description: [
      "The static top bar providing immediate context including User Name, Role Badge (e.g., Administrator), and Company.",
      "Displays the total count of Assigned Regions and features a manual Refresh trigger to restat data.",
    ],
    icon: Globe2,
    theme: "blue"
  },
  {
    id: 2,
    title: "Infrastructure Diagnostics",
    description: [
      "Real-time macro breakdown of physical topologies including Data Centers, POPs, Office Locations, and Bandwidth BTS nodes.",
      "Each metric card abstracts the underlying massive geometry queries into immediate, digestible figures.",
    ],
    icon: RadioTower,
    theme: "amber"
  },
  {
    id: 3,
    title: "Customer Topology",
    description: [
      "Aggregated readouts of distinct telecom partners and their approved infrastructure presence inside the network (Jio, Airtel, BSNL, etc.).",
      "Validates the successful mapping from the 'Network Planning' workflow into the live environment."
    ],
    icon: Building,
    theme: "purple"
  }
];

const HEALTH_FLOW: StepData[] = [
  {
    id: 1,
    title: "Audit & Activity Logs",
    description: [
      "A chronological transaction ledger monitoring deep user actions like LOGIN_SUCCESS, Object Updates, and Session Expirations.",
      "Critical for operational security, attributing exact timestamps and user emails to discrete application state changes.",
    ],
    icon: Clock,
    theme: "orange"
  },
  {
    id: 2,
    title: "System Telemetry",
    description: [
      "Microservice and database connection pulse checks ensuring the backend PostgreSQL and Express APIs are online.",
      "Monitors internal network health, measuring active infrastructure ratios and structural utilization metrics.",
    ],
    icon: Zap,
    theme: "emerald"
  },
  {
    id: 3,
    title: "Environment Diagnostics",
    description: [
      "Lower footer readout exposing the underlying deployment footprint: Development vs Production modes, Debug status, and Versioning stamps.",
      "Confirms structural deployment alignments and database linkage prior to executing bulk modifications."
    ],
    icon: ServerCrash,
    theme: "cyan"
  }
];

const TABS = [
  { id: "overview", label: "Infrastructure Overview", icon: BarChart3 },
  { id: "health", label: "System Health & Audits", icon: ShieldCheck }
];

export const DashboardGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FlowTab>("overview");

  const getThemeClasses = (theme: ThemeColor) => {
    switch (theme) {
      case "blue": return { iconBg: "bg-blue-500", cardBg: "bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-800", border: "border-blue-100 dark:border-blue-900/50 group-hover:border-blue-300 dark:group-hover:border-blue-700", badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", bullet: "bg-blue-400" };
      case "emerald": return { iconBg: "bg-emerald-500", cardBg: "bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-800", border: "border-emerald-100 dark:border-emerald-900/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-700", badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", bullet: "bg-emerald-400" };
      case "indigo": return { iconBg: "bg-indigo-500", cardBg: "bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-800", border: "border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700", badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300", bullet: "bg-indigo-400" };
      case "purple": return { iconBg: "bg-purple-500", cardBg: "bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-800", border: "border-purple-100 dark:border-purple-900/50 group-hover:border-purple-300 dark:group-hover:border-purple-700", badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300", bullet: "bg-purple-400" };
      case "violet": return { iconBg: "bg-violet-500", cardBg: "bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-900/10 dark:to-slate-800", border: "border-violet-100 dark:border-violet-900/50 group-hover:border-violet-300 dark:group-hover:border-violet-700", badgeBg: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300", bullet: "bg-violet-400" };
      case "amber": return { iconBg: "bg-amber-500", cardBg: "bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/10 dark:to-slate-800", border: "border-amber-100 dark:border-amber-900/50 group-hover:border-amber-300 dark:group-hover:border-amber-700", badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300", bullet: "bg-amber-400" };
      case "orange": return { iconBg: "bg-orange-500", cardBg: "bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-slate-800", border: "border-orange-100 dark:border-orange-900/50 group-hover:border-orange-300 dark:group-hover:border-orange-700", badgeBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300", bullet: "bg-orange-400" };
      case "cyan": return { iconBg: "bg-cyan-500", cardBg: "bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-900/10 dark:to-slate-800", border: "border-cyan-100 dark:border-cyan-900/50 group-hover:border-cyan-300 dark:group-hover:border-cyan-700", badgeBg: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300", bullet: "bg-cyan-400" };
      default: return { iconBg: "bg-slate-500", cardBg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", badgeBg: "bg-slate-100 text-slate-700", bullet: "bg-slate-400" };
    }
  };

  const getActiveFlow = () => {
    switch(activeTab) {
      case "overview": return OVERVIEW_FLOW;
      case "health": return HEALTH_FLOW;
      default: return OVERVIEW_FLOW;
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
              Dashboard Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Real-time statistical overview of ecosystem topologies, user transactions, and environment diagnostics.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden shadow-violet-500/5">
          
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
                      ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-md transform scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-violet-500" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabDashboard"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-violet-500" 
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

export default DashboardGuidePage;
