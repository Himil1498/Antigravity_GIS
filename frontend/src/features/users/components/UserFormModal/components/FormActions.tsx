import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, X, Loader2 } from "lucide-react";
import { FormActionsProps } from "../types";

const actionConfig = {
  create: {
    label: "Initialize User Workspace",
    loadingLabel: "Configuring...",
    gradient: "from-violet-600 to-indigo-600",
    hoverGradient: "hover:from-violet-500 hover:to-indigo-500",
    shadow: "shadow-violet-500/30",
  },
  edit: {
    label: "Commit Profile Updates",
    loadingLabel: "Synchronizing...",
    gradient: "from-blue-600 to-cyan-600",
    hoverGradient: "hover:from-blue-500 hover:to-cyan-500",
    shadow: "shadow-blue-500/30",
  },
  view: {
    label: "",
    loadingLabel: "",
    gradient: "",
    hoverGradient: "",
    shadow: "",
  },
};

const FormActions: React.FC<FormActionsProps> = ({
  isViewMode,
  isLoading,
  modalType,
  onClose,
  onSubmit,
}) => {
  const config = actionConfig[modalType] || actionConfig.create;

  return (
    <div className="flex justify-between items-center w-full">
      
      {/* Dynamic Status Helper Text (Optional) */}
      <div className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wide hidden sm:block">
        {isViewMode ? "Read-Only Identity View" : "All fields marked with * are required to proceed."}
      </div>

      <div className="flex justify-end gap-4 w-full sm:w-auto">
        <motion.button
          type="button"
          onClick={onClose}
          className="px-6 py-3.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm w-full sm:w-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X className="w-4 h-4 opacity-70" />
          {isViewMode ? "Close Profile" : "Discard"}
        </motion.button>

        {!isViewMode && (
          <motion.button
            type="submit"
            disabled={isLoading}
            onClick={onSubmit}
            className={`px-8 py-3.5 bg-gradient-to-r ${config.gradient} ${config.hoverGradient} text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg ${config.shadow} disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
            whileHover={isLoading ? {} : { scale: 1.02, y: -1 }}
            whileTap={isLoading ? {} : { scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {config.loadingLabel}
              </>
            ) : (
              <>
                {config.label}
                <ArrowRight className="w-4 h-4 opacity-90" />
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FormActions;
