const { pool } = require("../../config/database");
const { notifyAllUsers } = require("../notification/services/notification.service");
const websocketService = require("../../shared/services/websocketService");

/**
 * Get published updates for normal users (Paginated)
 */
const getPublishedUpdates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [updates] = await pool.query(
      `SELECT id, title, content, type, version_tag, is_automated, created_at 
       FROM system_updates 
       WHERE is_published = TRUE 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as count FROM system_updates WHERE is_published = TRUE`
    );
    const total = parseInt(countRows[0].count);

    res.json({
      success: true,
      data: updates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching published updates:", error);
    res.status(500).json({ success: false, message: "Failed to fetch updates." });
  }
};

/**
 * Get the single latest published update for public facing pages (like Login)
 */
const getLatestPublicUpdate = async (req, res) => {
  try {
    const [updates] = await pool.query(
      `SELECT id, title, content, type, version_tag, created_at 
       FROM system_updates 
       WHERE is_published = TRUE 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    res.json({
      success: true,
      data: updates.length > 0 ? updates[0] : null
    });
  } catch (error) {
    console.error("Error fetching public update:", error);
    res.status(500).json({ success: false, message: "Failed to fetch update." });
  }
};

/**
 * Get all updates for Admin (Including drafts)
 */
const getAllUpdatesAdmin = async (req, res) => {
  try {
    const [updates] = await pool.query(
      `SELECT u.id, u.title, u.content, u.type, u.version_tag, u.is_published, 
              u.is_automated, u.created_at, u.updated_at,
              admin.username as created_by_name
       FROM system_updates u
       LEFT JOIN users admin ON u.created_by = admin.id
       ORDER BY u.created_at DESC`
    );

    res.json({ success: true, data: updates });
  } catch (error) {
    console.error("Error fetching admin updates:", error);
    res.status(500).json({ success: false, message: "Failed to fetch updates." });
  }
};

/**
 * Create a new manual update draft
 */
const createUpdate = async (req, res) => {
  try {
    const { title, content, type, version_tag, is_published } = req.body;
    const adminId = req.user.userId; // Provided by auth middleware

    const [result] = await pool.query(
      `INSERT INTO system_updates 
        (title, content, type, version_tag, is_published, is_automated, created_by)
       VALUES ($1, $2, $3, $4, $5, FALSE, $6)
       RETURNING *`,
      [title, content, type, version_tag || null, is_published || false, adminId]
    );

    const newUpdate = result[0];

    // If instantly published, notify users
    if (newUpdate.is_published) {
      await notifyAllUsers(
        "system_update",
        `System Update: ${newUpdate.title}`,
        "A new system update has been released.",
        { related_entity_type: "system_update" }
      );
      // Try to broadcast via websocket
      if (websocketService && websocketService.broadcast) {
         websocketService.broadcast('notification', {
             type: 'system_update',
             title: `System Update: ${newUpdate.title}`,
             message: "A new system update has been released."
         });
      }
    }
    res.status(201).json({ success: true, data: newUpdate });
  } catch (error) {
    console.error("Error creating update:", error);
    res.status(500).json({ success: false, message: "Failed to create update." });
  }
};

/**
 * Update and optionally publish an existing update (Admin)
 */
const updateSystemUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, version_tag, is_published } = req.body;

    // Check if it was already published previously
    const [existing] = await pool.query(`SELECT is_published FROM system_updates WHERE id = $1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Update not found." });
    }

    const wasPublished = existing[0].is_published;

    const [result] = await pool.query(
      `UPDATE system_updates 
       SET title = $1, content = $2, type = $3, version_tag = $4, is_published = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, content, type, version_tag || null, is_published, id]
    );

    const updatedUpdate = result[0];

    // If newly published (was draft before), notify users
    if (is_published && !wasPublished) {
      await notifyAllUsers(
        "system_update",
        `System Update: ${updatedUpdate.title}`,
        "A new system update has been released.",
        { related_entity_type: "system_update" }
      );
      if (websocketService && websocketService.broadcast) {
         websocketService.broadcast('notification', {
             type: 'system_update',
             title: `System Update: ${updatedUpdate.title}`,
             message: "A new system update has been released."
         });
      }
    }
    res.json({ success: true, data: updatedUpdate });
  } catch (error) {
    console.error("Error updating system update:", error);
    res.status(500).json({ success: false, message: "Failed to update." });
  }
};

/**
 * Delete an update (Admin)
 */
const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM system_updates WHERE id = $1`, [id]);
    res.json({ success: true, message: "Update deleted successfully." });
  } catch (error) {
    console.error("Error deleting update:", error);
    res.status(500).json({ success: false, message: "Failed to delete update." });
  }
};

module.exports = {
  getPublishedUpdates,
  getLatestPublicUpdate,
  getAllUpdatesAdmin,
  createUpdate,
  updateSystemUpdate,
  deleteUpdate
};
