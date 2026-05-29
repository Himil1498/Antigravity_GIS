/**
 * Layer Management Action Controller
 * Handles actions like toggling visibility and sharing
 */

const { pool } = require("../../../config/database");
const { ERRORS, SUCCESS } = require("../constants");

const { logAudit } = require("../../audit/audit.service");

/**
 * @route   PATCH /api/layers/:id/visibility
 * @desc    Toggle layer visibility
 * @access  Private
 */
const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      `UPDATE layer_management
       SET is_visible = NOT is_visible, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [id, userId],
    );

    // Audit
    await logAudit(
      userId,
      "TOGGLE_VISIBILITY",
      "LAYER",
      id,
      { action: "TOGGLE_VISIBILITY" },
      req,
    );

    res.json({ success: true, message: SUCCESS.TOGGLED });
  } catch (error) {
    console.error("Toggle visibility error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_TOGGLE });
  }
};

/**
 * @route   POST /api/layers/:id/share
 * @desc    Share layer with other users
 * @access  Private
 */
const shareLayer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids)) {
      return res.status(400).json({
        success: false,
        error: ERRORS.USER_IDS_ARRAY,
      });
    }

    // Get current shared users
    const [layers] = await pool.query(
      "SELECT shared_with FROM layer_management WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (layers.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.LAYER_NOT_FOUND });
    }

    let sharedWith = layers[0].shared_with
      ? JSON.parse(layers[0].shared_with)
      : [];
    sharedWith = [...new Set([...sharedWith, ...user_ids])]; // Merge and remove duplicates

    await pool.query(
      "UPDATE layer_management SET shared_with = ?, updated_at = NOW() WHERE id = ?",
      [JSON.stringify(sharedWith), id],
    );

    // Audit
    await logAudit(
      userId,
      "SHARE_LAYER",
      "LAYER",
      id,
      { shared_with: user_ids },
      req,
    );

    res.json({
      success: true,
      message: SUCCESS.SHARED,
      shared_with: sharedWith,
    });
  } catch (error) {
    console.error("Share layer error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_SHARE });
  }
};

module.exports = {
  toggleVisibility,
  shareLayer,
};
