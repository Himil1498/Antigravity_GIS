const { rawPool: pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');

/**
 * Get user's map preferences
 * GET /api/preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT map_preferences FROM users WHERE id = $1',
      [userId]
    );

    const defaultPreferences = {
      default_map_type: 'satellite',
      default_zoom: 10,
      default_center: null,
      default_region_id: null,
      theme: 'auto',
      measurement_unit: 'metric',
      show_coordinates: true,
      show_scale: true,
      auto_save_enabled: true,
      notifications_enabled: true,
      preferences: {}
    };

    // rawPool returns { rows: [...] }
    let userPrefs = (result.rows.length > 0 && result.rows[0].map_preferences)
      ? result.rows[0].map_preferences
      : {};

    // If stored as string, parse it
    if (typeof userPrefs === 'string') {
      try { userPrefs = JSON.parse(userPrefs); } catch (e) { userPrefs = {}; }
    }

    // Merge defaults with user prefs
    const finalPreferences = { ...defaultPreferences, ...userPrefs };

    res.json({
      success: true,
      preferences: finalPreferences
    });
  } catch (error) {
    console.error('Error fetching user map preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch map preferences',
      error: error.message
    });
  }
};

/**
 * Save or update user's map preferences
 * POST /api/preferences
 */
exports.saveUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      default_map_type,
      default_zoom,
      default_center,
      default_region_id,
      theme,
      measurement_unit,
      show_coordinates,
      show_scale,
      auto_save_enabled,
      notifications_enabled,
      preferences
    } = req.body;

    const newPrefs = {
      default_map_type,
      default_zoom,
      default_center,
      default_region_id,
      theme,
      measurement_unit,
      show_coordinates,
      show_scale,
      auto_save_enabled,
      notifications_enabled,
      preferences
    };

    // Remove undefined keys to avoid overwriting with null/undefined if not intended
    Object.keys(newPrefs).forEach(key => newPrefs[key] === undefined && delete newPrefs[key]);

    // Use PostgreSQL JSONB concatenation to merge new prefs with existing ones
    // coalesce ensures we treat null column as empty object
    await pool.query(
      `UPDATE users 
       SET map_preferences = COALESCE(map_preferences, '{}'::jsonb) || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(newPrefs), userId]
    );

    // Fetch the updated preferences to return to frontend
    const updatedResult = await pool.query(
      'SELECT map_preferences FROM users WHERE id = $1',
      [userId]
    );
    
    const finalPrefs = updatedResult.rows.length > 0 ? updatedResult.rows[0].map_preferences : {};

    // Log audit
    await logAudit(
      userId,
      'UPDATE_PREFERENCES',
      'USER_PREFERENCES',
      userId,
      newPrefs,
      req
    );

    res.json({
      success: true,
      message: 'Map preferences saved successfully',
      preferences: finalPrefs
    });
  } catch (error) {
    console.error('Error saving user map preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save map preferences',
      error: error.message
    });
  }
};

/**
 * Reset user's map preferences to default
 * DELETE /api/preferences
 */
exports.resetUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Reset to empty object, effectively using defaults in getUserPreferences
    await pool.query(
      "UPDATE users SET map_preferences = '{}'::jsonb WHERE id = $1",
      [userId]
    );

    // Log audit
    await logAudit(
      userId,
      'RESET_PREFERENCES',
      'USER_PREFERENCES',
      userId,
      {},
      req
    );

    res.json({
      success: true,
      message: 'Map preferences reset to default'
    });
  } catch (error) {
    console.error('Error resetting user map preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset map preferences',
      error: error.message
    });
  }
};
