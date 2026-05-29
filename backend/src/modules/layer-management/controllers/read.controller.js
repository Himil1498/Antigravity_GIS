/**
 * Layer Management Read Controller
 * Handles fetching layer data
 */

const { pool } = require('../../../config/database');
const { ERRORS } = require('../constants');

/**
 * @route   GET /api/layers
 * @desc    Get all user's layers
 * @access  Private
 */
const getAllLayers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { regionId, layer_type } = req.query;

    let query = `SELECT * FROM layer_management
                 WHERE user_id = ? OR is_public = true`;
    const params = [userId];

    if (regionId) {
      query += ' AND region_id = ?';
      params.push(regionId);
    }
    if (layer_type) {
      query += ' AND type = ?';
      params.push(layer_type);
    }

    query += ' ORDER BY created_at DESC';

    const [layers] = await pool.query(query, params);

    res.json({ success: true, layers });
  } catch (error) {
    console.error('Get layers error:', error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_LAYERS });
  }
};

/**
 * @route   GET /api/layers/:id
 * @desc    Get layer by ID
 * @access  Private
 */
const getLayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [layers] = await pool.query(
      `SELECT * FROM layer_management
       WHERE id = ? AND (user_id = ? OR is_public = true OR shared_with @> ?)`,
      [id, userId, JSON.stringify([userId])]
    );

    if (layers.length === 0) {
      return res.status(404).json({ success: false, error: ERRORS.LAYER_NOT_FOUND });
    }

    res.json({ success: true, layer: layers[0] });
  } catch (error) {
    console.error('Get layer error:', error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_LAYER });
  }
};

module.exports = {
  getAllLayers,
  getLayerById
};
