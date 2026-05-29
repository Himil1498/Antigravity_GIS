import React, { useState } from "react";
import { apiService } from "../../../services/api/index";
import { showToast, toastMessages } from "../../../utils/toastUtils";
import { ChangePasswordDialogProps } from "./ChangePasswordTypes";
import { PasswordInput } from "./PasswordInput";

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ isOpen, onClose, userId, userName }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleClose = () => {
    setNewPassword(""); setConfirmPassword("");
    setError(""); setSuccess("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!newPassword || !confirmPassword) { setError("Both password fields are required"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setIsLoading(true);
    try {
      await apiService.resetPassword(userId, newPassword);
      setSuccess(`Password changed successfully for ${userName}!`);
      showToast.success(toastMessages.user.passwordChanged);
      setTimeout(() => { handleClose(); }, 1500);
    } catch (err: any) {
      console.error("❌ Password reset error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to change password";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </h2>
          <button onClick={handleClose} aria-label="Close dialog" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Setting new password for: <span className="font-semibold text-blue-700 dark:text-blue-300">{userName}</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">The user will be able to login immediately with this new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <PasswordInput id="new-password" label="New Password" value={newPassword} onChange={setNewPassword} required />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
          </div>
          <PasswordInput id="confirm-password" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} required />

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
          {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"><p className="text-sm text-green-600 dark:text-green-400">{success}</p></div>}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing...
                </>
              ) : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordDialog;

