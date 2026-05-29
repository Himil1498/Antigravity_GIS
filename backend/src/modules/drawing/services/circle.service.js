const { pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');
const websocketServer = require('../../../shared/services/websocket');
const { clearCache } = require('../../../shared/middleware/cache');
const { ERRORS, SUCCESS, DEFAULTS, AUDIT_ACTIONS } = require('../constants');

/**
 * Get all circles
 */
const getAllCircles = async (userId, userRole, queryParams) => {
    const { regionId, filter, userId: filterUserId } = queryParams;

    let query = `
      SELECT cd.*, u.username as username
      FROM circle_drawings cd
      LEFT JOIN users u ON cd.user_id = u.id
    `;
    let params = [];
    let whereConditions = [];

    if (filter === 'all' && (userRole === 'admin' || userRole === 'manager')) {
        // Admin viewing all
    } else if (filter === 'user' && (userRole === 'admin' || userRole === 'manager') && filterUserId) {
        whereConditions.push('cd.user_id = ?');
        params.push(parseInt(filterUserId));
    } else {
        whereConditions.push('cd.user_id = ?');
        params.push(userId);
    }

    if (regionId) {
        whereConditions.push('cd.region_id = ?');
        params.push(regionId);
    }

    if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
    }
    query += ' ORDER BY cd.created_at DESC';

    const [circles] = await pool.query(query, params);
    return circles;
};

/**
 * Get circle by ID
 */
const getCircleById = async (id, userId) => {
    const [circles] = await pool.query(
        'SELECT * FROM circle_drawings WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (circles.length === 0) return null;
    return circles[0];
};

/**
 * Create circle
 */
const createCircle = async (circleData, userId, req) => {
    const {
        circle_name,
        center_lat,
        center_lng,
        radius,
        fill_color,
        stroke_color,
        opacity,
        properties,
        region_id,
        notes,
        is_saved
    } = circleData;

    if (!center_lat || !center_lng || !radius) {
         throw new Error('INVALID_CIRCLE_PARAMS');
    }

    // Use RETURNING id for PostgreSQL
    const query = `INSERT INTO circle_drawings
       (created_by, region_id, circle_name, center_lat, center_lng, radius_meters,
        fill_color, stroke_color, opacity, properties, notes, is_saved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`;

    const [rows] = await pool.query(query, [
            userId,
            region_id,
            circle_name,
            center_lat,
            center_lng,
            radius,
            fill_color || DEFAULTS.FILL_COLOR,
            stroke_color || DEFAULTS.STROKE_COLOR,
            opacity || DEFAULTS.OPACITY,
            properties ? JSON.stringify(properties) : null,
            notes,
            (is_saved || DEFAULTS.IS_SAVED) ? 1 : 0 // Cast boolean to integer for PG
        ]
    );

    const newCircleId = rows[0].id;

    // Log audit
    await logAudit(userId, AUDIT_ACTIONS.CREATE, 'circle_drawing', newCircleId, {
        circle_name,
        center_lat,
        center_lng,
        radius
    }, req);

    websocketServer.broadcastGISUpdate('circle', 'create', { id: newCircleId });
    clearCache(['/api/datahub']);

    return {
        id: newCircleId,
        circle_name,
        center_lat,
        center_lng,
        radius
    };
};

/**
 * Update circle
 */
const updateCircle = async (id, userId, updateData, req) => {
    const { circle_name, fill_color, stroke_color, opacity, notes, is_saved } = updateData;

    const updates = [];
    const params = [];

    if (circle_name) {
        updates.push('circle_name = ?');
        params.push(circle_name);
    }
    if (fill_color) {
        updates.push('fill_color = ?');
        params.push(fill_color);
    }
    if (stroke_color) {
        updates.push('stroke_color = ?');
        params.push(stroke_color);
    }
    if (opacity !== undefined) {
        updates.push('opacity = ?');
        params.push(opacity);
    }
    if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
    }
    if (is_saved !== undefined) {
        updates.push('is_saved = ?');
        params.push(is_saved);
    }

    if (updates.length > 0) {
        updates.push('updated_at = NOW()');
        params.push(id, userId);

        // Original code used `created_by` for updates!
        await pool.query(
            `UPDATE circle_drawings SET ${updates.join(', ')} WHERE id = ? AND created_by = ?`,
            params
        );
    } else {
        throw new Error('NO_UPDATES');
    }

    // Log audit
    await logAudit(userId, AUDIT_ACTIONS.UPDATE, 'circle_drawing', id, {
        updated_fields: { circle_name, fill_color, stroke_color, opacity, notes, is_saved }
    }, req);

    websocketServer.broadcastGISUpdate('circle', 'update', { id });
    clearCache(['/api/datahub']);

    return { success: true };
};

/**
 * Delete circle
 */
const deleteCircle = async (id, userId, req) => {
    // Original used `created_by`
    const [circles] = await pool.query(
        'SELECT circle_name, radius_meters FROM circle_drawings WHERE id = ? AND created_by = ?',
        [id, userId]
    );

    await pool.query('DELETE FROM circle_drawings WHERE id = ? AND created_by = ?', [id, userId]);

    if (circles.length > 0) {
        await logAudit(userId, AUDIT_ACTIONS.DELETE, 'circle_drawing', id, {
            circle_name: circles[0].circle_name,
            radius_meters: circles[0].radius_meters
        }, req);
    }

    websocketServer.broadcastGISUpdate('circle', 'delete', { id });
    clearCache(['/api/datahub']);

    return { success: true };
};

module.exports = {
    getAllCircles,
    getCircleById,
    createCircle,
    updateCircle,
    deleteCircle
};
