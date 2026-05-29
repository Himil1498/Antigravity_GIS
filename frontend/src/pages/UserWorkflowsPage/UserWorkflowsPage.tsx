import React from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BookOpenCheck,
  LogIn,
  DatabaseZap,
  Map as MapIcon,
  LayoutDashboard,
  Network,
  ActivitySquare,
  Users,
  ShieldAlert,
  Users2,
  LineChart,
  Wrench,
  Compass
} from "lucide-react";

const UserWorkflowsPage: React.FC = () => {
  const navigate = useNavigate();

  // Animation variants for staggering the nodes
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const nodeVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-6 lg:p-12 overflow-hidden">
      <div className="max-w-[1600px] mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-8 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2 border border-purple-200 dark:border-purple-800 shadow-lg shadow-purple-500/20"
          >
            <BookOpenCheck className="w-14 h-14 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Platform Learning Journey
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mx-auto mb-8">
              Follow the sequential path below to master the OptiConnect GIS platform ecosystems.
            </p>
          </motion.div>
          
          <div className="absolute top-0 right-[-10px] xl:right-[-200px]">
             <button
               onClick={() => navigate('/map-guide')}
               className="flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
             >
               <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest hidden sm:block">Interactive Map</span>
             </button>
          </div>
        </div>

        {/* Serpentine Flowchart Canvas */}
        <div className="relative w-full max-w-6xl mx-auto mb-16 xl:px-8">
          
          {/* Top Right Loop (Row 1 -> Row 2) */}
          <div 
            className="absolute z-0 hidden lg:block border-slate-300 dark:border-slate-700 border-t-4 border-r-4 border-b-4 rounded-r-[150px]"
            style={{ top: '16.6%', bottom: '50%', left: '12.5%', right: '3%' }}
          />
          {/* Bottom Left Turn (Row 2 -> Row 3) */}
          <div 
            className="absolute z-0 hidden lg:block border-slate-300 dark:border-slate-700 border-t-4 border-l-4 border-b-4 rounded-l-[150px]"
            style={{ top: 'calc(50% - 4px)', bottom: '16.6%', left: '3%', right: '87.5%' }}
          />
          {/* Row 3 Line Continuation (Node 9 -> Node 11) */}
          <div 
            className="absolute z-0 hidden lg:block bg-slate-300 dark:bg-slate-700 rounded-r-full"
            style={{ bottom: '16.6%', height: '4px', left: '12.5%', right: '37.5%' }}
          />

          <motion.div 
            className="relative z-10 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-3 lg:auto-rows-fr gap-8 lg:gap-x-10 lg:gap-y-24 py-12 lg:px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* ROW 1 (Left to Right: 1, 2, 3, 4) */}
            
            {/* 1. Login */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/login-guide')} className="bg-indigo-50/90 dark:bg-indigo-900/50 border-2 border-indigo-200 dark:border-indigo-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-indigo-500/20 transition-all group backdrop-blur-md lg:col-start-1 lg:row-start-1 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><LogIn className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Login & Verify</h3>
              <p className="text-xs font-medium text-indigo-600/80 dark:text-indigo-300/80 uppercase tracking-widest mb-3">Access Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Account creation and authentication recovery.</p>
            </motion.div>

            {/* 2. Platform UI */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/interface-guide')} className="bg-emerald-50/90 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-emerald-500/20 transition-all group backdrop-blur-md lg:col-start-2 lg:row-start-1 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><LayoutDashboard className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Platform UI</h3>
              <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-300/80 uppercase tracking-widest mb-3">Navigation Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Understand the workspace and core menus.</p>
            </motion.div>

            {/* 3. Map Operations */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/map-operations-guide')} className="bg-pink-50/90 dark:bg-pink-900/50 border-2 border-pink-200 dark:border-pink-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-pink-500/20 transition-all group backdrop-blur-md lg:col-start-3 lg:row-start-1 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><MapIcon className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Map Operations</h3>
              <p className="text-xs font-medium text-pink-600/80 dark:text-pink-300/80 uppercase tracking-widest mb-3">Core Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Learn spatial tools, feasibility logic, and routing.</p>
            </motion.div>

            {/* 4. GIS Data Hub */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/data-hub-guide')} className="bg-amber-50/90 dark:bg-amber-900/50 border-2 border-amber-200 dark:border-amber-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-amber-500/20 transition-all group backdrop-blur-md lg:col-start-4 lg:row-start-1 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><DatabaseZap className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. GIS Data Hub</h3>
              <p className="text-xs font-medium text-amber-600/80 dark:text-amber-300/80 uppercase tracking-widest mb-3">Data Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Manage, filter, and purge saved topology.</p>
            </motion.div>

            {/* ROW 2 (Right to Left: 5, 6, 7, 8) */}
            
            {/* 5. Network Planning */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/network-planning-guide')} className="bg-blue-50/90 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-blue-500/20 transition-all group backdrop-blur-md lg:col-start-4 lg:row-start-2 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform shadow-inner"><Network className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Network Planning</h3>
              <p className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80 uppercase tracking-widest mb-3">Architect Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Approve infrastructure and live inventory.</p>
            </motion.div>

            {/* 6. Dashboard */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/dashboard-guide')} className="bg-violet-50/90 dark:bg-violet-900/50 border-2 border-violet-200 dark:border-violet-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-violet-500/20 transition-all group backdrop-blur-md lg:col-start-3 lg:row-start-2 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-300 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform shadow-inner"><ActivitySquare className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Dashboard</h3>
              <p className="text-xs font-medium text-violet-600/80 dark:text-violet-300/80 uppercase tracking-widest mb-3">Monitoring Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Track network growth and system logs.</p>
            </motion.div>

            {/* 7. Users Module */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/users-guide')} className="bg-fuchsia-50/90 dark:bg-fuchsia-900/50 border-2 border-fuchsia-200 dark:border-fuchsia-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-fuchsia-500/20 transition-all group backdrop-blur-md lg:col-start-2 lg:row-start-2 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-fuchsia-100 dark:bg-fuchsia-800 text-fuchsia-600 dark:text-fuchsia-300 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform shadow-inner"><Users className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">7. Users Module</h3>
              <p className="text-xs font-medium text-fuchsia-600/80 dark:text-fuchsia-300/80 uppercase tracking-widest mb-3">Auth Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">RBAC controls and security enforcement.</p>
            </motion.div>

            {/* 8. Groups Module */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/groups-guide')} className="bg-cyan-50/90 dark:bg-cyan-900/50 border-2 border-cyan-200 dark:border-cyan-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-cyan-500/20 transition-all group backdrop-blur-md lg:col-start-1 lg:row-start-2 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-300 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform shadow-inner"><Users2 className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">8. Groups Module</h3>
              <p className="text-xs font-medium text-cyan-600/80 dark:text-cyan-300/80 uppercase tracking-widest mb-3">Auth Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Enterprise bulk permission assignment.</p>
            </motion.div>

            {/* ROW 3 (Left to Right: 9, 10, 11) */}

            {/* 9. Admin Module */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/admin-guide')} className="bg-red-50/90 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-red-500/20 transition-all group backdrop-blur-md lg:col-start-1 lg:row-start-3 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><ShieldAlert className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">9. Admin Module</h3>
              <p className="text-xs font-medium text-red-600/80 dark:text-red-300/80 uppercase tracking-widest mb-3">System Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Central governance and access logs.</p>
            </motion.div>

            {/* 10. Analytics Module */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/analytics-guide')} className="bg-emerald-50/90 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-emerald-500/20 transition-all group backdrop-blur-md lg:col-start-2 lg:row-start-3 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><LineChart className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">10. Analytics</h3>
              <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-300/80 uppercase tracking-widest mb-3">Reporting Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">API latency, users online, and trends.</p>
            </motion.div>

            {/* 11. Tools Module */}
            <motion.div variants={nodeVariants} whileHover={{ scale: 1.05, y: -5 }} onClick={() => navigate('/tools-guide')} className="bg-orange-50/90 dark:bg-orange-900/50 border-2 border-orange-200 dark:border-orange-700/50 rounded-3xl p-6 text-center cursor-pointer shadow-xl hover:shadow-orange-500/20 transition-all group backdrop-blur-md lg:col-start-3 lg:row-start-3 flex flex-col items-center justify-center min-h-[290px]">
              <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform shadow-inner"><Wrench className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">11. Tools Module</h3>
              <p className="text-xs font-medium text-orange-600/80 dark:text-orange-300/80 uppercase tracking-widest mb-3">Utility Tier</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Excel data to KMZ spatial conversions.</p>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default UserWorkflowsPage;
