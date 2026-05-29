import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Wrench,
  FileSpreadsheet,
  FileCode2,
  TableProperties,
  MapPin,
  Download,
  Eye,
  CheckCircle2
} from 'lucide-react';

type FlowTab = "converter" | "viewer";

export type ThemeColor = "blue" | "emerald" | "indigo" | "purple" | "amber" | "orange" | "rose" | "pink" | "cyan" | "fuchsia" | "red";

interface StepData {
  id: number;
  title: string;
  description: string[];
  icon: any;
  theme: ThemeColor;
}

const CONVERTER_FLOW: StepData[] = [
  {
    id: 1,
    title: "Excel Data Ingestion",
    description: [
      "Drag & Drop or Browse to upload .xlsx or .xls files (Max 5MB limit).",
      "Optionally download the Sample Template to ensure native column compatibility."
    ],
    icon: FileSpreadsheet,
    theme: "emerald"
  },
  {
    id: 2,
    title: "Live Data Preview & Edit",
    description: [
      "Uploaded data instantly populates an interactive Preview Table.",
      "Search, verify, and directly edit coordinates and attributes before conversion.",
      "Missing icons? The system automatically assigns a default pin marker to ensure visibility."
    ],
    icon: TableProperties,
    theme: "indigo"
  },
  {
    id: 3,
    title: "Map Verification Engine",
    description: [
      "Verify the raw plotted data visually on the internal mapped canvas before you confirm conversion.",
      "Allows manual adjustments to ensure absolute positional accuracy."
    ],
    icon: MapPin,
    theme: "purple"
  },
  {
    id: 4,
    title: "Final Export",
    description: [
      "Execute the conversion algorithm to output highly optimized files.",
      "Download straight to local machine as uncompressed .KML or zipped .KMZ archives."
    ],
    icon: Download,
    theme: "orange"
  }
];

const VIEWER_FLOW: StepData[] = [
  {
    id: 1,
    title: "Upload Unverified KML/KMZ",
    description: [
      "Drag & drop any third-party or externally sourced KML/KMZ file onto the portal.",
      "Immediately parse the file to extract structural geometry and plot data."
    ],
    icon: FileCode2,
    theme: "cyan"
  },
  {
    id: 2,
    title: "Render & Analyze",
    description: [
      "Visualize the entire network layer overlaid directly on the high-definition base map.",
      "Examine file statistics: total objects, path lengths, and embedded meta-data strings."
    ],
    icon: Eye,
    theme: "pink"
  },
  {
    id: 3,
    title: "Validation & Hand-off",
    description: [
      "Confirm the structural integrity of the spatial data before deploying it permanently into the Network Planning environment or sharing externally."
    ],
    icon: CheckCircle2,
    theme: "blue"
  }
];

const TABS = [
  { id: "converter", label: "Excel to KMZ Converter", icon: FileSpreadsheet },
  { id: "viewer", label: "KML/KMZ Spatial Viewer", icon: Eye }
];

export const ToolsGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FlowTab>("converter");

  const getThemeClasses = (theme: ThemeColor) => {
    switch (theme) {
      case "blue": return { iconBg: "bg-blue-500", cardBg: "bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-800", border: "border-blue-100 dark:border-blue-900/50 group-hover:border-blue-300 dark:group-hover:border-blue-700", badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", bullet: "bg-blue-400" };
      case "emerald": return { iconBg: "bg-emerald-500", cardBg: "bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-800", border: "border-emerald-100 dark:border-emerald-900/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-700", badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", bullet: "bg-emerald-400" };
      case "indigo": return { iconBg: "bg-indigo-500", cardBg: "bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-800", border: "border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700", badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300", bullet: "bg-indigo-400" };
      case "purple": return { iconBg: "bg-purple-500", cardBg: "bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-800", border: "border-purple-100 dark:border-purple-900/50 group-hover:border-purple-300 dark:group-hover:border-purple-700", badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300", bullet: "bg-purple-400" };
      case "amber": return { iconBg: "bg-amber-500", cardBg: "bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-900/10 dark:to-slate-800", border: "border-amber-100 dark:border-amber-900/50 group-hover:border-amber-300 dark:group-hover:border-amber-700", badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300", bullet: "bg-amber-400" };
      case "orange": return { iconBg: "bg-orange-500", cardBg: "bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-slate-800", border: "border-orange-100 dark:border-orange-900/50 group-hover:border-orange-300 dark:group-hover:border-orange-700", badgeBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300", bullet: "bg-orange-400" };
      case "cyan": return { iconBg: "bg-cyan-500", cardBg: "bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-900/10 dark:to-slate-800", border: "border-cyan-100 dark:border-cyan-900/50 group-hover:border-cyan-300 dark:group-hover:border-cyan-700", badgeBg: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300", bullet: "bg-cyan-400" };
      case "rose": return { iconBg: "bg-rose-500", cardBg: "bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-900/10 dark:to-slate-800", border: "border-rose-100 dark:border-rose-900/50 group-hover:border-rose-300 dark:group-hover:border-rose-700", badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300", bullet: "bg-rose-400" };
      case "pink": return { iconBg: "bg-pink-500", cardBg: "bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-900/10 dark:to-slate-800", border: "border-pink-100 dark:border-pink-900/50 group-hover:border-pink-300 dark:group-hover:border-pink-700", badgeBg: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300", bullet: "bg-pink-400" };
      case "red": return { iconBg: "bg-red-500", cardBg: "bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/10 dark:to-slate-800", border: "border-red-100 dark:border-red-900/50 group-hover:border-red-300 dark:group-hover:border-red-700", badgeBg: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300", bullet: "bg-red-400" };
      case "fuchsia": return { iconBg: "bg-fuchsia-500", cardBg: "bg-gradient-to-br from-fuchsia-50/50 to-white dark:from-fuchsia-900/10 dark:to-slate-800", border: "border-fuchsia-100 dark:border-fuchsia-900/50 group-hover:border-fuchsia-300 dark:group-hover:border-fuchsia-700", badgeBg: "bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300", bullet: "bg-fuchsia-400" };
      default: return { iconBg: "bg-slate-500", cardBg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", badgeBg: "bg-slate-100 text-slate-700", bullet: "bg-slate-400" };
    }
  };

  const getActiveFlow = () => {
    switch(activeTab) {
      case "converter": return CONVERTER_FLOW;
      case "viewer": return VIEWER_FLOW;
      default: return CONVERTER_FLOW;
    }
  };

  const currentTheme = getThemeClasses("orange"); // Base theme

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-6 lg:p-12 lg:pb-32 font-sans transition-colors duration-200">
      
      {/* Navigation & Header Space */}
      <div className="max-w-[1600px] mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex gap-6 items-start">
            <button 
              onClick={() => navigate('/user-workflows')}
              className="mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm group flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
            </button>
            <div>
              <div className={`inline-flex items-center justify-center p-3 rounded-2xl ${currentTheme.badgeBg} border ${currentTheme.border} mb-6 mt-1`}>
                <Wrench className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                Tools Module
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Specialized data conversion utilities. Process bulk infrastructure coordinates directly into deployable spatial overlays.
              </p>
            </div>
          </div>
          <div className="flex -space-x-3 mb-2">
            {[FileSpreadsheet, ArrowLeft, FileCode2].map((Icon, i) => (
              <div key={i} className={`w-12 h-12 rounded-full border-4 border-slate-50 dark:border-[#0f172a] flex items-center justify-center text-white shadow-md z-${30-i*10} ${
                i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-indigo-500' : 'bg-cyan-500'
              }`}>
                {i === 1 ? <span className="font-bold text-lg">to</span> : <Icon className="w-5 h-5" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FlowTab)}
                  className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-md transform scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : ""}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabTools"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" 
                      initial={false}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Flow Content */}
          <div className="p-8 lg:p-12 relative min-h-[400px] bg-slate-50/50 dark:bg-[#0f172a]/20">
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
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white dark:ring-slate-800 z-10 ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      
                      {/* Content Card */}
                      <div className={`flex-1 border rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-all duration-300 ${theme.cardBg} ${theme.border}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider ${theme.badgeBg}`}>
                            Module Engine {step.id}
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {step.title}
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {step.description.map((desc, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 shadow-sm ${theme.bullet}`} />
                              <span className="leading-relaxed text-[15px] font-medium text-slate-600 dark:text-slate-300">{desc}</span>
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

export default ToolsGuidePage;
