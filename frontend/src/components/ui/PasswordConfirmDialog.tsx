import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  LockClosedIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface PasswordConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

const PasswordConfirmDialog: React.FC<PasswordConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Please enter your password to confirm this action.",
  isLoading = false,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Lock scroll
      setPassword("");
      setError(null);
    } else {
      document.body.style.overflow = "unset"; // Unlock scroll
    }
    return () => {
      document.body.style.overflow = "unset"; // Unlock on unmount
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    try {
      await onConfirm(password);
      setPassword(""); // Clear password on success
    } catch (err: any) {
      setError(err.message || "Incorrect password");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 transition-all duration-300">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Area */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Security verification required
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            {message}
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm ${
                  error
                    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                placeholder="Enter your administrative password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex gap-3 flex-row-reverse border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            className={`flex-1 sm:flex-none justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-all shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
              isLoading ? "cursor-wait" : ""
            }`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Confirm & Delete"
            )}
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-none justify-center rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm px-6 py-2.5 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:w-auto sm:text-sm transition-all hover:border-gray-300 dark:hover:border-gray-500"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmDialog;
