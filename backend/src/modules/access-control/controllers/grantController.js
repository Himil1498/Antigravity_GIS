/**
 * Grant Temporary Access Controller
 * Handles granting temporary access to regions
 */

const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");
const {
  createNotification,
} = require("../../notification/services/notification.service");
const { ERRORS } = require("../constants");

/**
 * @route   POST /api/temporary-access
 * @desc    Grant temporary access to region (manager+)
 * @access  Private (Manager/Admin)
 */
const grantTemporaryAccess = async (req, res) => {
  try {
    const granterId = req.user.id;
    const granterRole = req.user.role?.toLowerCase(); // Case-insensitive role check

    // Permission check is now handled by middleware (checkPermission('admin:temp_access'))


    const { user_id, region_name, access_level, expires_at, reason } = req.body;

    // Log the request body for debugging
    console.log("📨 Grant temporary access request:", {
      user_id,
      region_name,
      expires_at,
      access_level,
      reason,
    });

    if (!user_id || !region_name || !expires_at) {
      console.log("❌ Validation failed:", {
        hasUserId: !!user_id,
        hasRegionName: !!region_name,
        hasExpiresAt: !!expires_at,
      });
      return res.status(400).json({
        success: false,
        error: ERRORS.MISSING_FIELDS,
      });
    }

    // Verify user exists
    const [users] = await pool.query(
      "SELECT id, full_name, email FROM users WHERE id = ?",
      [user_id],
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    // Find region by name
    const [regions] = await pool.query(
      "SELECT id FROM regions WHERE name = ? AND is_active = true",
      [region_name],
    );
    if (regions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.REGION_NOT_FOUND });
    }

    const regionId = regions[0].id;

    // Check if active temporary access already exists
    const [existingTemp] = await pool.query(
      `SELECT id FROM temporary_access_log
       WHERE user_id = ? AND region_id = ?
       AND status != 'revoked' AND end_time > NOW()`,
      [user_id, regionId],
    );

    if (existingTemp.length > 0) {
      return res.status(400).json({
        success: false,
        error: ERRORS.ALREADY_EXISTS,
      });
    }

    // Convert to UTC for consistent storage
    const expiresDate = new Date(expires_at);

    const [result] = await pool.query(
      `INSERT INTO temporary_access_log
       (user_id, region_id, reason, granted_by, end_time)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
      [user_id, regionId, reason, granterId, expiresDate],
    );

    // Also add temporary access to user_regions table for actual region access
    await pool.query(
      `INSERT INTO user_regions (user_id, region_id, access_level, assigned_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, region_id) DO UPDATE SET access_level = ?, assigned_by = ?`,
      [
        user_id,
        regionId,
        access_level || "read",
        granterId,
        access_level || "read",
        granterId,
      ],
    );

    // Log audit event for granting temporary access
    try {
      await logAudit(
        granterId,
        `Granted temporary access to ${region_name} for ${users[0].full_name}`,
        "REGION_ASSIGNED",
        null,
        {
          severity: "info",
          resource_name: region_name,
          target_user_id: user_id,
          target_user_name: users[0].full_name,
          target_user_email: users[0].email,
          access_level: access_level || "read",
          expires_at: expires_at,
          reason: reason,
          grant_id: result[0].id,
          granted_by_role: granterRole,
          success: true,
        },
        req,
      );
    } catch (auditError) {
      console.error("Failed to create audit log for grant:", auditError);
    }

    // Notify the user about temporary access granted
    try {
      const expiryDate = new Date(expires_at);
      const expiryDisplay = expiryDate.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      await createNotification(
        user_id,
        "region_request",
        "🔓 Temporary Access Granted",
        `You have been granted temporary ${access_level || "read"} access to ${region_name} until ${expiryDisplay}`,
        {
          data: {
            grantId: result[0].id,
            regionId,
            regionName: region_name,
            accessLevel: access_level || "read",
            expiresAt: expires_at,
            reason,
          },
          priority: "high",
          action_url: "/map",
          action_label: "View Map",
          expires_at: expiryDisplay,
        },
      );
    } catch (notifError) {
      console.error("Failed to send notification to user:", notifError);
    }

    res.status(201).json({
      success: true,
      grant: {
        id: result[0].id,
        user_id,
        user_name: users[0].full_name,
        user_email: users[0].email,
        region_name,
        resource_id: regionId,
        access_level: access_level || "read",
        granted_at: new Date(),
        expires_at,
        reason,
        granted_by: granterId,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Grant temporary access error:", error);
    res.status(500).json({ success: false, error: ERRORS.GRANT_FAILED });
  }
};

module.exports = { grantTemporaryAccess };
