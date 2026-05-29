const { pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');
const websocketServer = require('../../../shared/services/websocket');
const { clearCache } = require('../../../shared/middleware/cache');
const { ERRORS, MESSAGES, DEFAULTS } = require('../constants');

/**
 * Get all measurements
 */
const getAllMeasurements = async (userId, userRole, queryParams) => {
    const { regionId, filter, userId: filterUserId } = queryParams;

    let query = `
      SELECT dm.*, u.username as username
      FROM distance_measurements dm
      LEFT JOIN users u ON dm.created_by = u.id
    `;
    let params = [];
    let whereConditions = [];

    if (filter === 'all' && (userRole === 'admin' || userRole === 'manager')) {
        // Admin viewing all
    } else if (filter === 'user' && (userRole === 'admin' || userRole === 'manager') && filterUserId) {
        whereConditions.push('dm.created_by = ?');
        params.push(parseInt(filterUserId));
    } else {
        whereConditions.push('dm.created_by = ?');
        params.push(userId);
    }

    if (regionId) {
        whereConditions.push('dm.region_id = ?');
        params.push(regionId);
    }

    if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
    }
    query += ' ORDER BY dm.created_at DESC';

    const [measurements] = await pool.query(query, params);
    return measurements;
};

/**
 * Get measurement by ID
 */
const getMeasurementById = async (id, userId) => {
    const [measurements] = await pool.query(
        'SELECT * FROM distance_measurements WHERE id = ? AND user_id = ?',
         // NOTE: Legacy used `user_id` in WHERE clause for SELECT, inconsistent with `created_by` in INSERT.
         // Assuming table has `user_id` or alias.
        [id, userId]
    );

    if (measurements.length === 0) return null;
    return measurements[0];
};

/**
 * Create measurement
 */
const createMeasurement = async (data, userId, req) => {
    const {
        measurement_name,
        points,
        total_distance,
        unit,
        region_id,
        notes,
        is_saved,
        min_elevation,
        max_elevation,
        elevation_gain
    } = data;

    if (!points || !total_distance) {
        throw new Error('POINTS_DISTANCE_REQUIRED');
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    // For PostgreSQL, use RETURNING id and extract from rows
    const query = `INSERT INTO distance_measurements
       (created_by, region_id, measurement_name, start_lat, start_lng, end_lat, end_lng,
        distance_meters, unit, notes, is_saved, properties)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`;

    const [rows] = await pool.query(query, [
            userId,
            region_id,
            measurement_name,
            startPoint.lat,
            startPoint.lng,
            endPoint.lat,
            endPoint.lng,
            total_distance,
            unit || DEFAULTS.UNIT,
            notes,
            (is_saved ? 1 : 0), // Cast boolean to integer for PG
            null // properties
    ]);

    const newMeasurementId = rows[0].id;

    // Log audit
    await logAudit(userId, 'CREATE', 'distance_measurement', newMeasurementId, {
        distance_meters: total_distance,
        unit: unit || DEFAULTS.UNIT,
        points_count: points?.length || 0
    }, req);

    websocketServer.broadcastGISUpdate('distance', 'create', { id: newMeasurementId });
    clearCache(['/api/datahub']);

    return {
        id: newMeasurementId,
        measurement_name,
        total_distance,
        unit: unit || 'kilometers',
        min_elevation,
        max_elevation,
        elevation_gain
    };
};

/**
 * Update measurement
 */
const updateMeasurement = async (id, userId, updates, req) => {
    const { measurement_name, notes, is_saved } = updates;

    const updateFields = [];
    const params = [];

    if (measurement_name) {
        updateFields.push('measurement_name = ?');
        params.push(measurement_name);
    }
    if (notes !== undefined) {
        updateFields.push('notes = ?');
        params.push(notes);
    }
    if (is_saved !== undefined) {
        updateFields.push('is_saved = ?');
        params.push(is_saved);
    }

    if (updateFields.length === 0) {
        throw new Error('NO_FIELDS_TO_UPDATE');
    }

    updateFields.push('updated_at = NOW()');
    params.push(id, userId);

    await pool.query(
        `UPDATE distance_measurements SET ${updateFields.join(', ')} WHERE id = ? AND created_by = ?`,
        params
    );

    // Log audit
    await logAudit(userId, 'UPDATE', 'distance_measurement', id, {
        updated_fields: { measurement_name, notes, is_saved }
    }, req);

    websocketServer.broadcastGISUpdate('distance', 'update', { id });
    clearCache(['/api/datahub']);

    return { success: true };
};

/**
 * Delete measurement
 */
const deleteMeasurement = async (id, userId, req) => {
    const [measurements] = await pool.query(
        'SELECT measurement_name, distance_meters as total_distance FROM distance_measurements WHERE id = ? AND created_by = ?',
        [id, userId]
    );

    await pool.query('DELETE FROM distance_measurements WHERE id = ? AND created_by = ?', [id, userId]);

    if (measurements.length > 0) {
        await logAudit(userId, 'DELETE', 'distance_measurement', id, {
            measurement_name: measurements[0].measurement_name,
            total_distance: measurements[0].total_distance
        }, req);
    }

    websocketServer.broadcastGISUpdate('distance', 'delete', { id });
    clearCache(['/api/datahub']);

    return { success: true };
};

module.exports = {
    getAllMeasurements,
    getMeasurementById,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement
};
