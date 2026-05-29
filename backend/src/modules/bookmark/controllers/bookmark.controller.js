const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");

/**
 * @route   GET /api/bookmarks
 * @desc    Get all user's bookmarks
 * @access  Private
 */
const getAllBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookmarks] = await pool.query(
      "SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    res.json({ success: true, bookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ success: false, error: "Failed to get bookmarks" });
  }
};

/**
 * @route   POST /api/bookmarks
 * @desc    Create bookmark
 * @access  Private
 */
const createBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, latitude, longitude, zoom_level, description, category } =
      req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Name, latitude, and longitude required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO bookmarks (user_id, name, latitude, longitude, zoom_level, description)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [userId, name, latitude, longitude, zoom_level || 12, description],
    );

    res.status(201).json({
      success: true,
      bookmark: {
        id: result[0].id,
        name,
        latitude,
        longitude,
        zoom_level: zoom_level || 12,
      },
    });

    try {
      await logAudit(
        userId,
        "Created bookmark",
        "BOOKMARK_CREATE",
        result[0].id,
        { name, category, latitude, longitude },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
  } catch (error) {
    console.error("Create bookmark error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @route   PUT /api/bookmarks/:id
 * @desc    Update bookmark
 * @access  Private
 */
const updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, zoom_level, description, category } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (zoom_level !== undefined) {
      updates.push("zoom_level = ?");
      params.push(zoom_level);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    updates.push("updated_at = NOW()");
    params.push(id, userId);

    await pool.query(
      `UPDATE bookmarks SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      params,
    );

    try {
      await logAudit(
        userId,
        "Updated bookmark",
        "BOOKMARK_UPDATE",
        id,
        { name, category, description },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: "Bookmark updated successfully" });
  } catch (error) {
    console.error("Update bookmark error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update bookmark" });
  }
};

/**
 * @route   DELETE /api/bookmarks/:id
 * @desc    Delete bookmark
 * @access  Private
 */
const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query("DELETE FROM bookmarks WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    try {
      await logAudit(
        userId,
        "Deleted bookmark",
        "BOOKMARK_DELETE",
        id,
        { action: "DELETE" },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete bookmark" });
  }
};

module.exports = {
  getAllBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};
