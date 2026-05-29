import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
  message = "Infrastructure Added Successfully!",
}) => {
  // Auto-close after 3 seconds? No, user wants a "nice confirm box", better let them click OK.

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Success!
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Continue
            </button>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
            >
              <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SubmissionSuccessModal);

