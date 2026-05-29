/**
 * Layer Management Write Controller
 * Handles creating, updating, and deleting layers
 */

const { pool } = require("../../../config/database");
const { ERRORS, SUCCESS } = require("../constants");
const { logAudit } = require("../../audit/audit.service");
const { notifyAllAdmins } = require("../../notification/services/notification.service");

/**
 * @route   POST /api/layers
 * @desc    Save/create layer
 * @access  Private
 */
const createLayer = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      layer_name,
      layer_type,
      layer_data,
      is_visible,
      is_public,
      description,
      tags,
      region_id,
    } = req.body;

    if (!layer_name || !layer_type || !layer_data) {
      return res.status(400).json({
        success: false,
        error: ERRORS.REQUIRED_FIELDS,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO layer_management
       (user_id, name, type, layer_data, is_visible,
        is_public, description, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        userId,
        layer_name,
        layer_type,
        JSON.stringify(layer_data),
        (is_visible !== undefined ? is_visible : true) ? 1 : 0,
        is_public || false ? 1 : 0,
        description,
        tags ? JSON.stringify(tags) : null,
      ],
    );

    res.status(201).json({
      success: true,
      layer: {
        id: result[0].id,
        layer_name,
        layer_type,
      },
    });

    try {
      await logAudit(
        userId,
        "Created GIS layer",
        "LAYER_CREATE",
        result[0].id,
        { layer_name, layer_type, is_public },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'layer_create',
        'New Map Layer Created',
        `GIS Layer "${layer_name}" (${layer_type}) was added by User ID: ${userId}.`,
        { related_entity_id: result[0].id, related_entity_type: 'layer' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }
  } catch (error) {
    console.error("Create layer error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @route   PUT /api/layers/:id
 * @desc    Update layer
 * @access  Private
 */
const updateLayer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { layer_name, layer_data, is_public, description, tags } = req.body;

    const updates = [];
    const params = [];

    if (layer_name) {
      updates.push("layer_name = ?");
      params.push(layer_name);
    }
    if (layer_data) {
      updates.push("layer_data = ?");
      params.push(JSON.stringify(layer_data));
    }
    if (is_public !== undefined) {
      updates.push("is_public = ?");
      params.push(!!is_public);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (tags) {
      updates.push("tags = ?");
      params.push(JSON.stringify(tags));
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NO_FIELDS_TO_UPDATE });
    }

    // updates.push('updated_at = NOW()'); // Column does not exist
    params.push(id, userId);

    await pool.query(
      `UPDATE layer_management SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      params,
    );

    try {
      await logAudit(
        userId,
        "Updated GIS layer",
        "LAYER_UPDATE",
        id,
        { layer_name, description, is_public },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'layer_update',
        'Map Layer Updated',
        `GIS Layer ID ${id} was updated by User ID: ${userId}.`,
        { related_entity_id: id, related_entity_type: 'layer' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({ success: true, message: SUCCESS.UPDATED });
  } catch (error) {
    console.error("Update layer error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_UPDATE });
  }
};

/**
 * @route   DELETE /api/layers/:id
 * @desc    Delete layer
 * @access  Private
 */
const deleteLayer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM layer_management WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    try {
      await logAudit(
        userId,
        "Deleted GIS layer",
        "LAYER_DELETE",
        id,
        { action: "DELETE" },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'layer_delete',
        'Map Layer Deleted',
        `GIS Layer ID ${id} was deleted by User ID: ${userId}.`,
        { related_entity_id: id, related_entity_type: 'layer' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({ success: true, message: SUCCESS.DELETED });
  } catch (error) {
    console.error("Delete layer error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

module.exports = {
  createLayer,
  updateLayer,
  deleteLayer,
};
