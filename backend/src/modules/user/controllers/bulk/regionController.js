const { pool } = require("../../../../config/database");
const { ERROR_MESSAGES } = require("./constants");
const { sendBulkRegionNotification } = require("./utils");

/**
 * @route   POST /api/users/bulk-assign-regions
 * @desc    Bulk assign regions to multiple users
 * @access  Private (Admin)
 */
const bulkAssignRegions = async (req, res) => {
  try {
    const { user_ids, region_names, action = "assign" } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.USER_IDS_REQUIRED });
    }

    if (
      !region_names ||
      !Array.isArray(region_names) ||
      region_names.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.REGION_NAMES_REQUIRED });
    }

    console.log("=== BULK ASSIGN REGIONS ===");
    console.log("Users:", user_ids);
    console.log("Regions:", region_names);
    console.log("Action:", action);

    const assignedBy = req.user ? req.user.id : null;
    let affectedUsers = 0;

    for (const userId of user_ids) {
      // Get existing regions before changes
      const [existingRegionsBefore] = await pool.query(
        `SELECT r.name FROM regions r
         INNER JOIN user_regions ur ON r.id = ur.region_id
         WHERE ur.user_id = ?`,
        [userId],
      );
      const oldRegionNames = existingRegionsBefore.map((r) => r.name);

      if (action === "replace") {
        await pool.query("DELETE FROM user_regions WHERE user_id = ?", [
          userId,
        ]);
      }

      for (const regionName of region_names) {
        // Find or create region
        let [regions] = await pool.query(
          "SELECT id FROM regions WHERE name = ? AND is_active = true",
          [regionName],
        );

        let regionId;
        if (regions.length > 0) {
          regionId = regions[0].id;
        } else {
          const regionCode = (
            regionName.substring(0, 2) +
            regionName.charAt(regionName.length - 1)
          ).toUpperCase();
          const [newRegion] = await pool.query(
            `INSERT INTO regions (name, code, type, is_active) VALUES (?, ?, 'state', true) RETURNING id`,
            [regionName, regionCode],
          );
          regionId = newRegion[0].id;
        }

        if (action === "assign" || action === "replace") {
          await pool.query(
            `INSERT INTO user_regions (user_id, region_id, access_level, assigned_by)
             VALUES (?, ?, 'read', ?)
             ON CONFLICT (user_id, region_id) DO UPDATE SET assigned_by = ?`,
            [userId, regionId, assignedBy, assignedBy],
          );
        } else if (action === "revoke") {
          await pool.query(
            "DELETE FROM user_regions WHERE user_id = ? AND region_id = ?",
            [userId, regionId],
          );
        }
      }

      // Get new regions after changes
      const [existingRegionsAfter] = await pool.query(
        `SELECT r.name FROM regions r
         INNER JOIN user_regions ur ON r.id = ur.region_id
         WHERE ur.user_id = ?`,
        [userId],
      );
      const newRegionNames = existingRegionsAfter.map((r) => r.name);

      // Send notification using helper
      await sendBulkRegionNotification(
        pool,
        userId,
        action,
        region_names,
        oldRegionNames,
        newRegionNames,
        req.user,
      );

      affectedUsers++;
    }

    res.json({
      success: true,
      message: `Regions ${action}ed for ${affectedUsers} user(s)`,
      affectedUsers,
    });
  } catch (error) {
    console.error("Bulk assign regions error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.BULK_ASSIGN_FAILED });
  }
};

module.exports = { bulkAssignRegions };
