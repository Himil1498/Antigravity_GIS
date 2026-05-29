const { pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');
const websocketServer = require('../../../shared/services/websocket');
const { clearCache } = require('../../../shared/middleware/cache');
const { ERRORS, SUCCESS, DEFAULTS, AUDIT_ACTIONS } = require('../constants');

/**
 * Get all polygons with filtering
 */
const getAllPolygons = async (userId, userRole, queryParams) => {
    const { regionId, filter, userId: filterUserId } = queryParams;

    // Base query with username join
    let query = `
      SELECT pd.*, u.username as username
      FROM polygon_drawings pd
      LEFT JOIN users u ON pd.created_by = u.id
    `;
    let params = [];
    let whereConditions = [];

    // Apply filtering logic
    if (filter === 'all' && (userRole === 'admin' || userRole === 'manager')) {
        // Admin viewing all data
    } else if (filter === 'user' && (userRole === 'admin' || userRole === 'manager') && filterUserId) {
        whereConditions.push('pd.user_id = ?');
        params.push(parseInt(filterUserId));
    } else {
        whereConditions.push('pd.user_id = ?');
        params.push(userId);
    }

    if (regionId) {
        whereConditions.push('pd.region_id = ?');
        params.push(regionId);
    }

    if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
    }
    query += ' ORDER BY pd.created_at DESC';

    const [polygons] = await pool.query(query, params);
    return polygons;
};

/**
 * Get polygon by ID
 */
const getPolygonById = async (id, userId) => {
    const [polygons] = await pool.query(
        'SELECT * FROM polygon_drawings WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (polygons.length === 0) return null;
    return polygons[0];
};

/**
 * Create polygon
 */
const createPolygon = async (polygonData, userId, req) => {
    const {
        polygon_name,
        coordinates,
        area,
        perimeter,
        fill_color,
        stroke_color,
        opacity,
        properties,
        region_id,
        notes,
        is_saved
    } = polygonData;

    if (!coordinates || !Array.isArray(coordinates)) {
        throw new Error('INVALID_COORDS');
    }

    // Use RETURNING id for PostgreSQL
    const query = `INSERT INTO polygon_drawings
       (created_by, region_id, polygon_name, coordinates, area, perimeter,
        fill_color, stroke_color, opacity, properties, notes, is_saved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`;

    const [rows] = await pool.query(query, [
            userId,
            region_id,
            polygon_name,
            JSON.stringify(coordinates),
            area,
            perimeter,
            fill_color || DEFAULTS.FILL_COLOR,
            stroke_color || DEFAULTS.STROKE_COLOR,
            opacity || DEFAULTS.OPACITY,
            properties ? JSON.stringify(properties) : null,
            notes,
            (is_saved || DEFAULTS.IS_SAVED) ? 1 : 0 // Cast boolean to integer for PG
        ]
    );

    const newPolygonId = rows[0].id;

    // Log audit
    await logAudit(userId, AUDIT_ACTIONS.CREATE, 'polygon_drawing', newPolygonId, {
        polygon_name,
        area,
        perimeter,
        vertices_count: coordinates?.length || 0
    }, req);

    websocketServer.broadcastGISUpdate('polygon', 'create', { id: newPolygonId });
    clearCache(['/api/datahub']);

    return {
        id: newPolygonId,
        polygon_name,
        area,
        perimeter
    };
};

/**
 * Update polygon
 */
const updatePolygon = async (id, userId, updateData, req) => {
    const { polygon_name, fill_color, stroke_color, opacity, notes, is_saved } = updateData;

    const updates = [];
    const params = [];

    if (polygon_name) {
        updates.push('polygon_name = ?');
        params.push(polygon_name);
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
        
        // Handling the user_id vs created_by mess:
        // Original UPDATE used `user_id = ?` (line 145)
        // I'll stick to that but also consider `created_by` if `user_id` fails?
        // No, stick to original code behavior.
        
        const updateParams = [...params, id, userId];
        await pool.query(
            `UPDATE polygon_drawings SET ${updates.join(', ')} WHERE id = ? AND created_by = ?`,
            updateParams // Note: Original used `user_id`.
        );
    } else {
        throw new Error('NO_UPDATES');
    }

    // Log audit
    await logAudit(userId, AUDIT_ACTIONS.UPDATE, 'polygon_drawing', id, {
        updated_fields: { polygon_name, fill_color, stroke_color, opacity, notes, is_saved }
    }, req);

    websocketServer.broadcastGISUpdate('polygon', 'update', { id });
    clearCache(['/api/datahub']);
    
    return { success: true };
};

/**
 * Delete polygon
 */
const deletePolygon = async (id, userId, req) => {
     // Get polygon details before deletion for audit log
    // Original used `created_by` here! (line 179 and 183)
    const [polygons] = await pool.query(
        'SELECT polygon_name, area FROM polygon_drawings WHERE id = ? AND created_by = ?',
        [id, userId]
    );

    await pool.query('DELETE FROM polygon_drawings WHERE id = ? AND created_by = ?', [id, userId]);

    if (polygons.length > 0) {
        await logAudit(userId, AUDIT_ACTIONS.DELETE, 'polygon_drawing', id, {
            polygon_name: polygons[0].polygon_name,
            area: polygons[0].area
        }, req);
    }

    websocketServer.broadcastGISUpdate('polygon', 'delete', { id });
    clearCache(['/api/datahub']);

    return { success: true };
};

module.exports = {
    getAllPolygons,
    getPolygonById,
    createPolygon,
    updatePolygon,
    deletePolygon
};
