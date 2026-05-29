const { createNotification } = require('../../../notification/services/notification.service');
const { AUDIT_ACTIONS } = require('./constants');

/**
 * Send notification to user about bulk region changes
 * @param {Object} pool - Database pool
 * @param {number} userId - User ID to notify
 * @param {string} action - Action performed (assign, replace, revoke)
 * @param {Array} regionNames - Regions involved in the action
 * @param {Array} oldRegionNames - Regions before change
 * @param {Array} newRegionNames - Regions after change
 * @param {Object} adminUser - Admin user performing the action
 */
const sendBulkRegionNotification = async (pool, userId, action, regionNames, oldRegionNames, newRegionNames, adminUser) => {
  try {
    const [userInfo] = await pool.query(
      "SELECT username, full_name FROM users WHERE id = ?",
      [userId]
    );
    const userName = userInfo[0]?.full_name || userInfo[0]?.username || "User";

    let notificationTitle = "";
    let notificationMessage = "";

    if (action === "assign") {
      const addedRegions = regionNames.filter(
        (r) => !oldRegionNames.includes(r)
      );
      if (addedRegions.length > 0) {
        notificationTitle = "🗺️ Regions Assigned (Bulk)";
        notificationMessage = `New regions have been assigned to you by an administrator.\n\n`;
        notificationMessage += `✅ Added: ${addedRegions.join(", ")}\n`;
        notificationMessage += `\nTotal regions: ${newRegionNames.join(", ")}`;
      }
    } else if (action === "replace") {
      notificationTitle = "🗺️ Regions Replaced (Bulk)";
      notificationMessage = `Your regions have been replaced by an administrator.\n\n`;
      notificationMessage += `❌ Previous: ${
        oldRegionNames.length > 0 ? oldRegionNames.join(", ") : "None"
      }\n`;
      notificationMessage += `✅ New: ${
        newRegionNames.length > 0 ? newRegionNames.join(", ") : "None"
      }`;
    } else if (action === "revoke") {
      const removedRegions = regionNames.filter((r) =>
        oldRegionNames.includes(r)
      );
      if (removedRegions.length > 0) {
        notificationTitle = "🗺️ Regions Revoked (Bulk)";
        notificationMessage = `Some regions have been revoked by an administrator.\n\n`;
        notificationMessage += `❌ Removed: ${removedRegions.join(", ")}\n`;
        notificationMessage += `\nRemaining regions: ${
          newRegionNames.length > 0 ? newRegionNames.join(", ") : "None"
        }`;
      }
    }

    if (notificationMessage) {
      await createNotification(
        userId,
        AUDIT_ACTIONS.REGION_REQUEST,
        notificationTitle,
        notificationMessage,
        {
          data: {
            action,
            regions: regionNames,
            oldRegions: oldRegionNames,
            newRegions: newRegionNames,
            bulkOperation: true,
            updatedBy: adminUser?.full_name || adminUser?.username,
          },
          priority: "medium",
          action_url: "/map",
          action_label: "View Map",
        }
      );
      console.log(
        `📧 User ${userName} notified about bulk region ${action}`
      );
    }
  } catch (notifError) {
    console.error(
      `Failed to send bulk region notification to user ${userId}:`,
      notifError
    );
  }
};

module.exports = {
  sendBulkRegionNotification
};
