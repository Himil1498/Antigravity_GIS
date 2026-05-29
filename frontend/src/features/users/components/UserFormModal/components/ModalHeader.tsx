import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Eye, Edit3, X } from "lucide-react";
import { ModalHeaderProps } from "../types";

const modalConfig = {
  create: {
    title: "Create New User Workspace",
    subtitle: "Setting up a new administrative or operational profile.",
    icon: <UserPlus className="w-6 h-6 text-violet-400" />,
    badgeColor: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  view: {
    title: "User Profile Overview",
    subtitle: "Viewing complete digital identity and assigned clearance.",
    icon: <Eye className="w-6 h-6 text-emerald-400" />,
    badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  edit: {
    title: "Modify User Clearance",
    subtitle: "Updating professional identity and workspace configurations.",
    icon: <Edit3 className="w-6 h-6 text-blue-400" />,
    badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ modalType, onClose }) => {
  const config = modalConfig[modalType] || modalConfig.create;

  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex items-center gap-5">
        <motion.div
          className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-800/50 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {config.icon}
        </motion.div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <motion.h2
              className="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {config.title}
            </motion.h2>
            <motion.span 
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${config.badgeColor}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              System Admin
            </motion.span>
          </div>
          
          <motion.p
            className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {config.subtitle}
          </motion.p>
        </div>
      </div>

      <motion.button
        onClick={onClose}
        aria-label="Close dialog"
        className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 border-2 border-transparent transition-all shadow-sm group"
        whileHover={{ 
          scale: 1.1,
          rotate: 90,
          backgroundColor: "rgba(220, 38, 38, 0.1)", // Red-600 with opacity
          borderColor: "rgba(220, 38, 38, 0.4)",
          color: "rgb(220, 38, 38)", // Red-600
        }}
        whileTap={{ scale: 0.9, rotate: -10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <X className="w-5 h-5 transition-colors duration-200" />
      </motion.button>
    </div>
  );
};

export default ModalHeader;
