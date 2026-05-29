import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  ArrowDownToLine,
  Map,
  Search,
  Layers,
  Wrench,
  Navigation,
  Database,
  Calculator,
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCw,
  Settings,
  MapPin,
  Compass,
  LayoutTemplate,
  PenTool,
  Trash2,
  ArrowRight,
  MousePointerClick,
  Hexagon,
  LineChart,
  Mountain,
  FileDown,
  Save,
  Circle,
  Wifi,
  GitCommit,
  X
} from "lucide-react";

// Added useState for interactive tabs
import { useState } from "react";

interface FeatureItemProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  imageUrls?: string[];
  children?: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps & { index: number }> = ({ icon: Icon, title, description, color, imageUrls, index, children }) => {
  const getColors = () => {
    switch (color) {
      case "blue": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "emerald": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "purple": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "amber": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rose": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getBorderColor = () => {
    switch (color) {
      case "blue": return "border-l-blue-500/50 hover:border-l-blue-500";
      case "emerald": return "border-l-emerald-500/50 hover:border-l-emerald-500";
      case "purple": return "border-l-purple-500/50 hover:border-l-purple-500";
      case "amber": return "border-l-amber-500/50 hover:border-l-amber-500";
      case "rose": return "border-l-rose-500/50 hover:border-l-rose-500";
      default: return "border-l-slate-500/50 hover:border-l-slate-400";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
      className={`group bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm border-y border-r border-l-4 border-slate-200/50 dark:border-slate-700/50 ${getBorderColor()} p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-800/60`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-5">
           <div className={`p-4 rounded-2xl border ${getColors()} shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
             <Icon className="w-6 h-6" />
           </div>
           <div className="flex-1 pt-1">
             <h3 className="font-bold text-slate-900 dark:text-white text-xl md:text-2xl tracking-tight mb-2">{title}</h3>
             <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">{description}</p>
           </div>
        </div>
        
        {imageUrls && imageUrls.length > 0 && (
           <div className="flex flex-wrap gap-4 mt-2 md:pl-[4.5rem]">
             {imageUrls.map((url, idx) => (
               <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-md group-hover:shadow-lg transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/50 p-2 backdrop-blur-sm">
                 <img 
                   src={url} 
                   alt={`${title} Interface Visual ${idx + 1}`} 
                   className="rounded-xl object-contain w-full max-h-[300px] hover:scale-[1.02] transition-transform duration-500" 
                 />
               </div>
             ))}
           </div>
        )}
        
        {/* Render nested children (like flows) here */}
        {children && (
          <div className="mt-2 md:pl-[4.5rem]">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const GISToolsFlow = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    { id: "distance", label: "Distance Measurement Tool", icon: LineChart, desc: "Measure multi-point paths, analyze elevation, and verify street view." },
    { id: "polygon", label: "Polygon Tool", icon: Hexagon, desc: "Draw custom service boundaries and calculate contained areas." },
    { id: "circle", label: "Circle Tool", icon: Circle, desc: "Map radial distances from specific fiber nodes or towers." },
    { id: "sector", label: "Sector RF Tool", icon: Wifi, desc: "Visualize precise radio frequency broadcast cones and coverage." },
    { id: "elevation", label: "Elevation Tool", icon: Mountain, desc: "Instantly analyze point-specific or path-based topological height." }
  ];

  return (
    <div className="mt-8 mb-2">
      <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-2">
        <Wrench className="w-4 h-4" />
        Available Interactive Tools
      </h4>
      
      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool(tool.id)}
              className="text-left bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all group flex flex-col gap-3"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl w-max group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                <Icon className="w-6 h-6 text-slate-500 group-hover:text-emerald-500" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{tool.label}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tool.desc}</p>
              </div>
              <div className="mt-auto pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Full Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Modal Overlay for Tool Details using CreatePortal to escape parent transforms */}
      {createPortal(
        <AnimatePresence>
          {selectedTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/80 backdrop-blur-lg"
            onClick={() => setSelectedTool(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-50 dark:bg-slate-900 w-[98vw] max-w-[1600px] h-[96vh] max-h-[96vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-700/50 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  {(() => {
                    const tool = tools.find(t => t.id === selectedTool);
                    const Icon = tool?.icon || LineChart;
                    return (
                      <>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{tool?.label} Overview</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Step-by-step visual interaction guide</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100/50 dark:bg-black/20">
                {selectedTool === "distance" ? (
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                     {/* Title block */}
                     <div className="mb-20 text-center">
                       <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                         Distance & Topography Mastery
                       </h3>
                       <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                         The incredibly powerful <strong>Distance Measurement Tool</strong> goes far beyond simple line drawing. It is a comprehensive utility designed for mapping multi-point physical paths, providing granular segment-by-segment analysis, interactive topological elevation graphing, comprehensive Street View integration, and robust data persistence.
                       </p>
                     </div>

                     {/* The Timeline Container */}
                     <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                       
                       {/* Step 1 */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         whileInView={{ opacity: 1, y: 0 }} 
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4, ease: "easeOut" }}
                         className="relative pl-10 md:pl-20 will-change-[transform,opacity]"
                       >
                         {/* Dot */}
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">
                           1
                         </div>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Activate Canvas & Plot Path</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Select the ruler tool from the floating toolbox to initialize the interactive plotting state across the entire map canvas.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-blue-500 font-bold mt-1">•</span> <span><strong>Plotting:</strong> Click to drop precise path markers. Each node is automatically serialized (labeled A, B, C, etc.). Double-click your final node to finish the active polyline string.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-blue-500 font-bold mt-1">•</span> <span><strong>Undo Mechanics:</strong> Use the dedicated <strong>Undo</strong> capability in the Expanded Toolbox to perfectly remove the last dropped marker without breaking your chain.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-blue-500 font-bold mt-1">•</span> <span><strong>Canvas Reset:</strong> Hit <strong>Clear</strong> to instantly wipe the canvas, removing all polyline SVGs, markers, and localized state logic to restart measuring entirely from zero.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <img src="/img/DistanceTool_OnClick_of_Tool.png" alt="Activating Distance Tool" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 2 */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         whileInView={{ opacity: 1, y: 0 }} 
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4, ease: "easeOut" }}
                         className="relative pl-10 md:pl-20 will-change-[transform,opacity]"
                       >
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">
                           2
                         </div>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Real-time Granular Segment Analysis</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>As you actively drop points, the Expanded Toolbox intercepts the geometry and runs an automatic segment logic loop, displaying live data tabularly.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Micro-Distances:</strong> View the exact total mileage combined with the isolated metric variations automatically logged between specific point pairs (e.g., Point A to B specifically, versus B to C).</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Street View Booleans:</strong> It runs an instantaneous check against Google's Street View Coverage API for every node, returning a green checkmark or red "X" to ensure line-of-sight image data exists precisely where you dropped a marker.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Interactive Table:</strong> Hovering or interacting with rows in the analysis table visually triggers feedback on the respective map segment.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <img src="/img/After_Marking_Points_on_Map_DistanceTool.png" alt="Granular Segment Analysis" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 3 */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         whileInView={{ opacity: 1, y: 0 }} 
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4, ease: "easeOut" }}
                         className="relative pl-10 md:pl-20 will-change-[transform,opacity]"
                       >
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">
                           3
                         </div>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Deep Topological Elevation Graphing</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click "Get Elevation" to execute an API call pulling hundreds of live topological data samples interpolating across your exact sketched path string.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Comprehensive Metrics Panel:</strong> Instantly calculates and displays critical metrics automatically: <strong>⛰️ Highest Peak</strong>, <strong>🏞️ Lowest Point</strong>, total <strong>↑ Elevation Gain</strong>, and total <strong>↓ Elevation Loss</strong> across the route.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Graph Options & Syncing:</strong> Generates a collapsible UI drawer with a "Show Graph" toggle, or click "Fullscreen" for a massive map overlay view.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Bi-directional Hover:</strong> Scrubbing your mouse across the generated elevation graph simultaneously slides a tracker indicator along your physical map path, mapping altitude spikes directly to their geographical origin point.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <img src="/img/ELevationGraph_IfClick_on_Yes_Elevation.png" alt="Interactive Elevation Graph" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 4 */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         whileInView={{ opacity: 1, y: 0 }} 
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4, ease: "easeOut" }}
                         className="relative pl-10 md:pl-20 will-change-[transform,opacity]"
                       >
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">
                           4
                         </div>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Engineered Street View Validation</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Enable deep Street View integration for real-world environmental visual verification along your sketched route without ever leaving the application.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-emerald-500 font-bold mt-1">•</span> <span><strong>Google Coverage Layer Overlay:</strong> Toggle the "Coverage Layer" (cyan lines) to instantly discover exactly which roads and trails in your vicinity contain 360-degree panoramas mapped by Google survey vehicles.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-emerald-500 font-bold mt-1">•</span> <span><strong>Direct Panorama Drop:</strong> Click to drop directly into a 360-degree interactive Street View on one of your specific markers. A persistent UI panel will indicate exactly which node (e.g., "Viewing Point B") you are centered on.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-emerald-500 font-bold mt-1">•</span> <span><strong>Hotkeys & Flow Navigation:</strong> Navigate seamlessly using dedicated <strong>Next/Previous buttons</strong>, or optimize your workflow utilizing <strong>Keyboard shortcuts</strong> (Arrow Keys or N/P) to jump sequentially between your path nodes exclusively while inside the Street View popup window. Use ESC to rapidly exit.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <img src="/img/OnClick_of_Enable_StreetView.png" alt="Advanced Street View Logic" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 5 */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} 
                         whileInView={{ opacity: 1, y: 0 }} 
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4, ease: "easeOut" }}
                         className="relative pl-10 md:pl-20 will-change-[transform,opacity]"
                       >
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">
                           5
                         </div>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Cross-platform Persist & Export Pipeline</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Once your analysis is 100% complete, secure your geographic dataset using the robust cross-platform save and export pipeline mapped seamlessly to your user account. Anything you save here is immediately synced and accessible within your <strong>GISDataHub</strong>.</p>
                               <div className="space-y-6 mt-8">
                                 <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                    <h5 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2"><Save className="w-5 h-5"/> Secure Database Saving</h5>
                                    <p className="text-sm">Clicking "Save" spawns a descriptive dialog matrix. Provide a custom <strong>Name</strong> and heavy text <strong>Description</strong>. Optimize data limits by choosing <strong>Permanent storage</strong> for vital network infrastructure routing, or <strong>Temporary storage</strong> for quick scratch-pad forecasting that is automatically GC-collected. All saved records instantly appear in your <strong>GISDataHub</strong> for global review.</p>
                                 </div>
                                 <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                                    <h5 className="font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2"><FileDown className="w-5 h-5"/> Offline Raw Porting</h5>
                                    <p className="text-sm">Instantly process and download your geometric coordinate data structures to your local machine for enterprise integrations into software like Google Earth Pro, QGIS, or ArcGIS. Natively parses output configurations as geometric <strong>KML</strong>, path-trackable <strong>GPX</strong>, and tabular <strong>CSV</strong> raw data exports.</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <img src="/img/Distance_Data_Save_Modal.png" alt="Saving Dialog Box Options" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20 bg-white dark:bg-slate-900" />
                           </div>
                         </div>
                       </motion.div>

                     </div>
                  </div>
                ) : selectedTool === "polygon" ? (
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                     {/* Title block */}
                     <div className="mb-20 text-center">
                       <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                         Polygon Bounding & Area Analysis
                       </h3>
                       <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                         The <strong>Polygon Drawing Tool</strong> is essential for regional asset management. It empowers telecom engineers to demarcate custom topological boundaries, perform instant square-meter feasibility checks, categorize competitive zones aesthetically, and lock regions into the database for large-scale infrastructure queries.
                       </p>
                     </div>

                     {/* The Timeline Container */}
                     <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                       
                       {/* Step 1 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">1</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Demarcate Custom Territory</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Activate the Polygon tool to begin framing a designated geographical zone directly onto the live map layer.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-blue-500 font-bold mt-1">•</span> <span><strong>Initial Plotting:</strong> Click to drop the first outer boundary stake to begin the shape process.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Polygon.png" alt="Drawing a Polygon Boundary" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 2 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">2</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Multi-Point Enclosure</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Continue dropping stakes to wrap your geographic target. The system calculates connecting bounds in real-time.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Live Vectoring:</strong> A minimum of three vertices is required. The live array captures precise Latitude and Longitude nodes.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/Markings_with_Multiple_Points_PolygonTool.png" alt="Multiple Points Polygon Tool" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 3 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">3</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Finalize Boundary</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Snap the final string to your origin point or hit <strong>"Complete"</strong> in the panel to instantly shade the defined boundary and lock the geometric shape.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Complete_PolygonTool.png" alt="Completing the Polygon" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 4 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">4</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Micro-Geometric Mathematics</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Essential for generating accurate RFPs and estimating budgets, the tool renders instant geometric math upon completion.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Total Area Calculation:</strong> Identifies exact internal square-meter / square-kilometer area bound within your shape.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Perimeter Sizing:</strong> Calculates the raw length of the outer bounding lines.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/What_Details_Appearing_for_PolygonTool.png" alt="Polygon Area Calculations" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 5 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">5</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Canvas Reset</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Need to redraw? The <strong>Clear All</strong> trigger instantly dismounts all markers, flushes the coordinate array, and drops you back into an empty ready-state.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_ClearAll_PolygonTool.png" alt="Clear All Polygon Tool" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 6 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">6</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Database Extensibility</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click "Save" to bind the boundary structure directly into the backend GIS database. Tag it as Permanent or Temporary.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Save_PolygonTool.png" alt="Saving Dialog Box Options" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20 bg-white dark:bg-slate-900" />
                           </div>
                         </div>
                       </motion.div>

                     </div>
                  </div>
                ) : selectedTool === "circle" ? (
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                     <div className="mb-20 text-center">
                       <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                         Radial Coverage & Service Range
                       </h3>
                       <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                         The <strong>Circle Tool</strong> is precision-engineered for evaluating radial distance limits. Set a central focal point to visualize maximum broadcasting ranges, fiber node reach, and exactly calculate the total square-meter geographic spread affected by a single infrastructure point.
                       </p>
                     </div>

                     <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">1</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Establish Focal Origin</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Plot the absolute center coordinate to simulate an infrastructure origin point, such as a cellular tower array or a central fiber node.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-orange-500 font-bold mt-1">•</span> <span><strong>Coordinate Snapping:</strong> Activate the tool and single-click anywhere on the map to firmly plant the true center pin, logging exact vector coordinates.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_CircleTool.png" alt="Circle Focal Point Setup" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">2</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Area Math & Validation</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>The system actively runs recursive geometry parameters against your boundary, enforcing shapes while spitting out service capacities.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-red-500 font-bold mt-1">•</span> <span><strong>Radial Expansion:</strong> Once the center is set, drag your mouse outward to continuously scale the visual radius boundary in real-time.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-red-500 font-bold mt-1">•</span> <span><strong>Live Metrics:</strong> Calculates strict linear Radius reach and the absolute Area within the circle, converting to square-kilometers.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/Using_CircleTool.png" alt="Circle Area Validation" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">3</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Canvas Reset</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Recalculate your radial range easily. Clicking <strong>Clear</strong> instantly wipes the specific map overlay allowing you to quickly drop a new center pin without cluttering the screen.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Clear_CircleTool.png" alt="Clear Circle Canvas" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">4</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Database Extensibility (Save Dialog)</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Save the specific circle overlay for reporting or infrastructure proposals. Saved parameters instantly appear in your <strong>GISDataHub</strong>.</p>
                               <div className="space-y-6 mt-8">
                                 <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                                    <h5 className="font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2"><Save className="w-5 h-5"/> Secure Persistence</h5>
                                    <p className="text-sm">Click "Save" to bind the boundary into the backend. Tag it as <strong>Permanent</strong> for established regional arrays or <strong>Temporary</strong> for multiple rapid feasibility drafts.</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Save_CircleTool.png" alt="Saving Circle Bounds" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20 bg-white dark:bg-slate-900" />
                           </div>
                         </div>
                       </motion.div>
                     </div>
                  </div>
                ) : selectedTool === "sector" ? (
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                     <div className="mb-20 text-center">
                       <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                         Telecommunication Sector RF
                       </h3>
                       <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                         The advanced <strong>Sector RF Tool</strong> allows deep visualization of cellular environments. Drop a tower point and configure exact sweep arcs by manipulating Radius, Azimuth, and Beamwidth spread for precision broadcast planning.
                       </p>
                     </div>

                     <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">1</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Device Initialization</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Activate the Sector RF tool from the toolbox to begin planning directed wireless broadcasts.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_SectorRFTool.png" alt="Activating Sector Tool" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">2</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Tower Control & Directionality</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Determine exactly where your tower equipment is located and instantly orient the directionality of the broadcast sector.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-rose-500 font-bold mt-1">•</span> <span><strong>Azimuth Panning:</strong> Manually manipulate the <strong>Azimuth (0°-360°)</strong> slider to rotate the transmission cone toward specific population centers.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-rose-500 font-bold mt-1">•</span> <span><strong>Beamwidth Spread:</strong> Pinch the signal tightly using the <strong>Beamwidth</strong> slider or fan it outwards into a massive wide-angle broadcast zone.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnMark_on_Map_SectorRFTool.png" alt="Adjusting Azimuth and Beamwidth" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">3</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Database Extensibility (Save Dialog)</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click "Save" to bind the RF hardware layout directly into the backend GIS database. Sector features are preserved for future wireless infrastructure planning.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Save_SectorRFTool.png" alt="Saving Sector Features" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20 bg-white dark:bg-slate-900" />
                           </div>
                         </div>
                       </motion.div>
                     </div>
                  </div>
                ) : selectedTool === "elevation" ? (
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                     <div className="mb-20 text-center">
                       <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-sky-600">
                         3D Elevation & Topography
                       </h3>
                       <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                         The ultra-specialized <strong>Elevation Tool</strong> produces dense environmental cross-sections spanning any drawn vector path. Render intricate geometric elevations, execute <strong>Line-of-Sight (LOS)</strong> clearance analysis, and rapidly pivot your canvas into an interactive 3D realm.
                       </p>
                     </div>

                     <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                       {/* Step 1 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">1</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Initialize Elevation Node</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Activate the <strong>Elevation Tool</strong> from the toolbox. Single-click precisely on your origin point to anchor the first altitude measurement node.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_ElevationTool.png" alt="Activate Elevation Tool" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 2 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">2</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Transcontinental Path Vectoring</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Draw routes across diverse biomes to instruct the backend GIS to prepare contiguous satellite topography extractions.</p>
                               <ul className="space-y-4 mt-6">
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Distance Metric Logging:</strong> Every path placed tracks strict Kilometers/Meters sequentially.</span></li>
                                 <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Coordinate Polling:</strong> Each segment vertex instantly requests raw physical altitude data via database querying.</span></li>
                               </ul>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnMarking_ElevationTool.png" alt="Drawing Elevation Path" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 3 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">3</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Deep Topological Density Graphing</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click "Yes" to query the elevation database. The system synthesizes the entire vector path and generates a beautiful, deep-analytical line graph at the bottom panel.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/ELevationGraph_IfClick_on_Yes_Elevation.png" alt="Generated Elevation Graph" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 4 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">4</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Fullscreen Graph Analysis</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click the "Full Screen" icon to pop the topological density graph into a massive viewing resolution, crucial and ideal for finding microscopic dips or fatal geographic blocking cliffs along fiber paths.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Full_ElevationTool.png" alt="Fullscreen Elevation Graph" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 5 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">5</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Bi-directional Geographic Hovering</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Hover anywhere over the interactive line graph to perfectly sync a live reticle indicator onto the primary cartography map. Every peak on the graph instantly translates to its exact GPS coordinate on Earth.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnHover_of_Graph_ElevationTool.png" alt="Hovering over the Graph" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 6 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">6</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Canvas Reset</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Instantly discard the rendered topography map and the line data by clicking 'Clear All', resetting the workspace to a zeroed canvas.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Clear_ElvationTool.png" alt="Clear Elevation Data" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                           </div>
                         </div>
                       </motion.div>

                       {/* Step 7 */}
                       <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                         <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">7</div>
                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                           <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl flex flex-col justify-center">
                             <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Database Extensibility (Save Dialog)</h4>
                             <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                               <p>Click "Save" to bind the drawn elevation path structure directly into the backend GIS database. Sector features are preserved for future cross-organizational routing.</p>
                             </div>
                           </div>
                           <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/OnClick_of_Save_ElevationTool.png" alt="Saving Elevation Dialog" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20 bg-white dark:bg-slate-900" />
                           </div>
                         </div>
                       </motion.div>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                     <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                       <Wrench className="w-12 h-12 text-slate-400" />
                     </div>
                     <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Detailed Flow Pending</h2>
                     <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                       The exhaustive image-based breakdown for the <strong>{tools.find(t => t.id === selectedTool)?.label}</strong> is currently being compiled and will be injected here shortly.
                     </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const LayersGuideFlow = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 mb-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="text-left bg-purple-50 dark:bg-purple-900/20 backdrop-blur-md p-5 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-sm hover:shadow-lg transition-all group flex flex-col gap-3 w-full sm:w-max"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Interactive Layers Guide</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deep dive into data visibility, regions, and popup context menus.</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Explore Layers Mechanics</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/80 backdrop-blur-lg"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-slate-50 dark:bg-slate-900 w-[98vw] max-w-[1600px] h-[96vh] max-h-[96vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-700/50 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Layers & Region Controls</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Step-by-step visual interaction guide</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100/50 dark:bg-black/20">
                  <div className="relative max-w-[1600px] mx-auto pb-20">
                    <div className="mb-20 text-center">
                      <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600">
                        Map Aesthetics & Context Menus
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                        The <strong>Layers Panel</strong> operates as the master visibility switchboard. Use it to instantly reveal past architecture elements, strip away regional boundaries, or engage powerful Contextual Popups directly overlaid on the interactive map canvas.
                      </p>
                    </div>

                    <div className="relative border-l-[6px] border-slate-200 dark:border-slate-700 ml-6 md:ml-12 space-y-32 py-10">
                      
                      {/* Step 1 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                        <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">1</div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                          <div className="xl:col-span-12 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                            <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Region Boundaries & Monochrome Maps</h4>
                            <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg mb-8">
                              <p>Refine visual canvas noise before initiating telecom planning checks.</p>
                              <ul className="space-y-4 mt-6">
                                <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Boundaries:</strong> Uncheck "Region Boundaries" to completely strip underlying franchise area borders, giving a pristine map surface.</span></li>
                                <li className="flex gap-3 items-start"><span className="text-purple-500 font-bold mt-1">•</span> <span><strong>Monochrome:</strong> Toggle grayscale satellite rendering. This instantly ensures brightly colored GIS vectors pop visually without background conflict.</span></li>
                              </ul>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                              <img src="/img/LayerPanel_Uncheck_RegionBoundaries.png" alt="Region Boundaries Checkbox" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                              <img src="/img/LayerPanel_Monochrome_Mode.png" alt="Monochrome Map Styling" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Step 2 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                        <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">2</div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                          <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                            <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Polygons & Spatial Territories</h4>
                            <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                              <p>Activate the <strong>Polygon Markings</strong> layer to instantly render every custom territory previously saved to the database.</p>
                              <ul className="space-y-4 mt-6">
                                <li className="flex gap-3 items-start"><span className="text-fuchsia-500 font-bold mt-1">•</span> <span><strong>Context Popups:</strong> Clicking explicitly onto a rendered polygon physically maps its mathematical data into an interactive popup floating above the shape.</span></li>
                                <li className="flex gap-3 items-start"><span className="text-fuchsia-500 font-bold mt-1">•</span> <span><strong>Area Recovery:</strong> It perfectly recalculates and reminds the team of the square-meter surface area and boundary perimeter without forcing a redraw.</span></li>
                              </ul>
                            </div>
                          </div>
                          <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                            <img src="/img/LayerPanel_ClickOnPolygonMarkingsOnMap.png" alt="Polygon Markings Contextual Popup" className="w-full h-auto max-h-[600px] object-cover md:object-contain rounded-[2rem] shadow-md group-hover:scale-[1.45] group-hover:-translate-y-2 group-hover:z-50 transition-all duration-400 ease-out will-change-transform cursor-pointer relative z-20" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Step 3 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                        <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">3</div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                          <div className="xl:col-span-12 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                            <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Distance Tracing & 360 Street View Embeds</h4>
                            <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg mb-8">
                              <p>Toggle "Distance Markings" to trace complex fiber lines. Clicking nodes on these distance paths unlocks deep geographical inspection features.</p>
                              <ul className="space-y-4 mt-6">
                                <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Measurement Verification:</strong> Review the granular distances saved between specific origin/destination points.</span></li>
                                <li className="flex gap-3 items-start"><span className="text-indigo-500 font-bold mt-1">•</span> <span><strong>Street View Initiation:</strong> Clicking any "Start Point" or valid node within the popup violently drops the user perspective into an interactive <strong>360° Google Street View</strong>.</span></li>
                              </ul>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 relative z-10 pl-0 md:pl-10">
                              <img src="/img/LayerPanel_ClickOn_StartPoint_for_DistanceTool.png" alt="Start Point Distance Marker" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                              <img src="/img/LayerPanel_ClickOn_360StreetView_for_DistanceTool.png" alt="360 Street view active modal" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Step 4 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                        <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">4</div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                          <div className="xl:col-span-12 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                            <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Radial Maps & Telecom Sector RF</h4>
                            <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg mb-8">
                              <p>Re-instantiate highly specialized transmission zones without recalculating the math manually.</p>
                              <ul className="space-y-4 mt-6">
                                <li className="flex gap-3 items-start"><span className="text-emerald-500 font-bold mt-1">•</span> <span><strong>Circle Validation:</strong> View exact Kilometers sweeps stemming directly from fiber junctions.</span></li>
                                <li className="flex gap-3 items-start"><span className="text-emerald-500 font-bold mt-1">•</span> <span><strong>Sector Hardware:</strong> Popup context menus report critical <strong>Frequency Bands</strong>, <strong>Antenna Angles (Azimuth)</strong>, and network tiers inherited strictly from the RF Tool database.</span></li>
                              </ul>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 relative z-10 pl-0 md:pl-10">
                              <img src="/img/LayerPanel_ClickOnCircleMarkingsOnMap.png" alt="Circle Tool Data Menu" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                              <img src="/img/LayerPanel_ClickOnSectorRFMarkingsOnMap.png" alt="Sector Tool Architecture Details Menu" className="w-full md:w-1/2 h-auto object-cover md:object-contain rounded-[2rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 p-2" />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Step 5 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative pl-10 md:pl-20 will-change-[transform,opacity]">
                        <div className="absolute -left-[35px] top-0 w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-[8px] ring-slate-100 dark:ring-slate-900 border-4 border-white dark:border-slate-800">5</div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
                          <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all hover:shadow-xl">
                            <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Restoring Elevation Topography Graphics</h4>
                            <div className="text-slate-600 dark:text-slate-400 space-y-4 text-lg">
                              <p>Activate "Elevation Markings" to bring back dense topographical routes. Clicking an elevation vector line opens its unique Context Menu popup overlay.</p>
                              <ul className="space-y-4 mt-6">
                                <li className="flex gap-3 items-start"><span className="text-sky-500 font-bold mt-1">•</span> <span><strong>Bottom Drawer Trigger:</strong> Clicking "View Details" from the popup forces the master Elevation Line Graph to dynamically unfold back into the bottom UI drawer.</span></li>
                                <li className="flex gap-3 items-start"><span className="text-sky-500 font-bold mt-1">•</span> <span><strong>Fullscreen Analytics:</strong> The graph operates seamlessly as it did during creation, allowing engineers to blow it up to Full Screen mode for line-of-sight reviews.</span></li>
                              </ul>
                            </div>
                          </div>
                          <div className="xl:col-span-7 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-4 items-center justify-center group relative shadow-inner z-10 hover:z-50 transition-all duration-300">
                             <img src="/img/LayerPanel_ClickOnElevationMarkingsONMap.png" alt="Clicking Elevation vector on Map" className="w-full h-auto max-h-[300px] object-cover md:object-contain rounded-[1.5rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer relative z-20" />
                             <img src="/img/LayerPanel_ClickOnBottomDrawerFro_ElevationViewDetailsBox.png" alt="Elevation details drawer populates" className="w-full h-auto max-h-[300px] object-cover md:object-contain rounded-[1.5rem] shadow-md hover:scale-[1.45] hover:z-50 transition-transform cursor-pointer relative z-20 mt-4 border border-slate-300 dark:border-slate-700" />
                          </div>
                        </div>
                      </motion.div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const InteractiveMapGuidePage: React.FC = () => {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text("OptiConnect GIS - Main Map Guide", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), "MMM d, yyyy")}`, 14, 32);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 36, pageWidth - 14, 36);

    // We will render a single table in the PDF for all 15 features to match the linear flow
    autoTable(doc, {
      startY: 48,
      head: [["#", "Feature", "Description"]],
      body: [
        ["1", "GIS Tools", "Contains interactive capabilities to draw Polygons, place Points, measure Distances, or calculate elevation."],
        ["2", "Layers", "Control visibility of specific network infrastructure types. Toggle specific cables, conduits, and manholes."],
        ["3", "Network Catalog", "A comprehensive index of all predefined infrastructure assets available to add to the map."],
        ["4", "Feasibility", "Calculate build scenarios and route viability, generating automated Feasibility Reports."],
        ["5", "Global Search", "Unified search bar to instantly find locations, coordinates, nodes, streets, or customers globally."],
        ["6", "Zoom In", "Increases the map resolution to see precise street-level infrastructure."],
        ["7", "Zoom Out", "Decreases the map resolution to see broad area overviews."],
        ["8", "Live Location", "Automatically zooms and centers the map onto your current physical GPS coordinates."],
        ["9", "Reset to Preferences", "Instantly resets your map view, zoom level, and enabled layers to your configured defaults."],
        ["10", "Full Screen", "Expands the map to cover your entire monitor for maximum viewing area."],
        ["11", "Refresh Map", "Synchronizes your view to pull the absolute latest infrastructure data from the live server."],
        ["12", "Boundary Settings", "Configure specific geographical boundaries or franchise operational areas on your map."],
        ["13", "Map Type", "Toggle between Default Street Map, Satellite Imagery, or Hybrid views depending on context."],
        ["14", "Live Coordinates", "Real-time readout displaying exact Latitude and Longitude coordinates."],
        ["15", "360 Street View", "Drop into a 3D street-level view to visualize physical utility environments."]
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 
        0: { cellWidth: 10, fontStyle: "bold", halign: "center" },
        1: { cellWidth: 40, fontStyle: "bold" } 
      }
    });

    doc.save("OptiConnect_MainMap_Guide.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] relative overflow-hidden">
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-emerald-600/10 dark:bg-emerald-600/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[20%] w-[25%] h-[25%] rounded-full bg-purple-600/10 dark:bg-purple-600/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '5s' }} />
        
        {/* Subtle dot pattern grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4xKSIvPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent,white)]" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/user-workflows")}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium mb-8 transition-colors group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 w-max"
      >
        <span className="text-xl leading-none group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Workflows
      </button>

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 lg:p-8 rounded-3xl shadow-lg">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
              <Map className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            Interactive Map Guide
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg font-medium">
            Master the 15 core operational tools available on the mapping dashboard.
          </p>
        </div>
        
        <button
          onClick={handleDownloadPDF}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 overflow-hidden whitespace-nowrap"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <ArrowDownToLine className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Download PDF Guide</span>
        </button>
      </div>

      <div className="space-y-12">
        {/* Main Screenshot Visual Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/80 p-3 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10"
        >
           <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-950">
             {/* Decorative Window Controls */}
             <div className="absolute top-4 left-4 flex gap-2 z-20">
               <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600/50" />
               <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600/50" />
               <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600/50" />
             </div>
             
             <img 
                 src="/img/MainMapPage.png" 
                 alt="Main Map Global Dashboard Visual" 
                 className="w-full h-auto object-cover object-top hover:scale-[1.01] transition-transform duration-700 ease-out" 
             />
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
           </div>
        </motion.div>

        {/* Feature List (Line by Line) */}
        <div className="space-y-6 max-w-4xl mx-auto relative z-10 pt-8">
          
          <FeatureItem index={0} icon={Wrench} title="1. GIS Tools" description="Contains interactive capabilities to draw Polygons, place Points, measure Distances, or calculate elevation." color="emerald" imageUrls={["/img/GISToolsDropdown.png"]}>
            <GISToolsFlow />
          </FeatureItem>

          <FeatureItem index={1} icon={Layers} title="2. Layers" description="Control visibility of specific network infrastructure types. Toggle specific cables, conduits, and manholes." color="purple" imageUrls={["/img/LayersDropdown.png"]}>
            <LayersGuideFlow />
          </FeatureItem>

          <FeatureItem index={2} icon={Database} title="3. Network Catalog" description="A comprehensive index of all predefined infrastructure assets available to add to the map." color="amber" imageUrls={["/img/NetworkCatalog_Infrastructure.png", "/img/NetworkCatalog_Customer.png", "/img/NetworkCatalog_Report.png"]} />

          <FeatureItem index={3} icon={Calculator} title="4. Feasibility" description="Calculate build scenarios and route viability, generating automated Feasibility Reports." color="rose" imageUrls={["/img/FeasibilityCheck.png"]} />

          <FeatureItem index={4} icon={Search} title="5. Global Search" description="Use this unified search bar to instantly find locations, coordinates, specific fiber nodes, streets, or customers globally." color="blue" imageUrls={["/img/GlobalSearch.png"]} />

          <FeatureItem index={5} icon={ZoomIn} title="6. Zoom In" description="Increases the map resolution to see precise street-level infrastructure." color="blue" />

          <FeatureItem index={6} icon={ZoomOut} title="7. Zoom Out" description="Decreases the map resolution to see broad area overviews." color="blue" />

          <FeatureItem index={7} icon={MapPin} title="8. Live Location" description="Automatically zooms and centers the map onto your current physical GPS coordinates." color="emerald" />

          <FeatureItem index={8} icon={RefreshCw} title="9. Reset to Preferences" description="Instantly resets your map view, zoom level, and enabled layers to your configured defaults." color="purple" />

          <FeatureItem index={9} icon={Maximize} title="10. Full Screen" description="Expands the map to cover your entire monitor for maximum viewing area." color="amber" />

          <FeatureItem index={10} icon={RefreshCw} title="11. Refresh Map" description="Synchronizes your view to pull the absolute latest infrastructure data from the live server." color="rose" />

          <FeatureItem index={11} icon={LayoutTemplate} title="12. Boundary Settings" description="Configure specific geographical boundaries or franchise operational areas on your map." color="blue" imageUrls={["/img/BoundarySettings.png"]} />

          <FeatureItem index={12} icon={Layers} title="13. Map Type" description="Toggle between Default Street Map, Satellite Imagery, or Hybrid views depending on context." color="emerald" imageUrls={["/img/MapTypeSelector.png"]} />

          <FeatureItem index={13} icon={MapPin} title="14. Live Coordinates" description="Readout displaying your mouse cursor's exact Latitude and Longitude coordinates." color="amber" />

          <FeatureItem index={14} icon={Compass} title="15. 360 Street View" description="Drop into a 3D street-level view to visualize physical utility poles and environments." color="purple" />

        </div>
      </div>
      </div>
    </div>
  );
};

export default InteractiveMapGuidePage;
