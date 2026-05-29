import React, { useState, useEffect } from "react";
import { showToast } from "../../../../utils/toastUtils";
import * as adminUserService from "../../../../services/adminUserService";
import { UserDetailModalProps } from "../../types/UserDetailModalTypes";
import UserDetailModalHeader from "./UserDetailModalHeader";
import UserDetailModalContent from "./UserDetailModalContent";

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<adminUserService.SessionStats | null>(
    null,
  );
  const [activities, setActivities] = useState<
    adminUserService.RecentActivity[]
  >([]);

  // Message Dialog State
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [messagePriority, setMessagePriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [sending, setSending] = useState(false);

  // Force Logout State
  const [showForceLogoutConfirm, setShowForceLogoutConfirm] = useState(false);

  // Load user data
  useEffect(() => {
    loadUserData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadUserData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadUserData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        adminUserService.getUserSessionStats(user.id),
        adminUserService.getUserRecentActivity(user.id, 10),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error: any) {
      console.error("Error loading user data:", error);
      showToast.error(`Failed to load user data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async () => {
    try {
      const result = await adminUserService.forceLogoutUser(user.id);
      showToast.success(result.message);
      setShowForceLogoutConfirm(false);
      onClose(); // Close the entire user details modal
    } catch (error: any) {
      showToast.error(`Failed to logout user: ${error.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      showToast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const result = await adminUserService.sendAdminMessage({
        userId: user.id,
        message: message.trim(),
        priority: messagePriority,
      });
      showToast.success(result);
      setShowMessageDialog(false);
      setMessage("");
      setMessagePriority("medium");
    } catch (error: any) {
      showToast.error(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <UserDetailModalHeader user={user} onClose={onClose} />

          <UserDetailModalContent
            user={user}
            loading={loading}
            stats={stats}
            activities={activities}
            onShowMessageDialog={() => setShowMessageDialog(true)}
            onShowForceLogoutConfirm={() => setShowForceLogoutConfirm(true)}
            onRefreshData={loadUserData}
          />
        </div>
      </div>

      {/* Message Dialog */}
      {showMessageDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowMessageDialog(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Send Message to {user.name}
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
            />
            <div className="mt-4">
              <label
                htmlFor="message-priority"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
              >
                Priority
              </label>
              <select
                id="message-priority"
                value={messagePriority}
                onChange={(e) => setMessagePriority(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowMessageDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Logout Confirmation */}
      {showForceLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowForceLogoutConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Force Logout User?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will immediately logout <strong>{user.name}</strong> from all
              active sessions. They will need to log in again to continue using
              the system.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForceLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForceLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Force Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetailModal;
