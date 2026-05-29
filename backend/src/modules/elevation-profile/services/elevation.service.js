const { pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');
const websocketServer = require('../../../shared/services/websocket');
const { clearCache } = require('../../../shared/middleware/cache');
const { ERRORS, MESSAGES } = require('../constants');

/**
 * Get all profiles
 */
const getAllProfiles = async (userId, userRole, queryParams) => {
    const { regionId, filter, userId: filterUserId } = queryParams;

    let query = `
      SELECT ep.*, u.username as username, u.email as user_email
      FROM elevation_profiles ep
      LEFT JOIN users u ON ep.created_by = u.id
    `;
    let params = [];
    let whereConditions = [];

    if (filter === 'all' && (userRole === 'admin' || userRole === 'manager')) {
        // Admin
    } else if (filter === 'user' && (userRole === 'admin' || userRole === 'manager') && filterUserId) {
        whereConditions.push('ep.created_by = ?');
        params.push(parseInt(filterUserId));
    } else {
        whereConditions.push('ep.created_by = ?');
        params.push(userId);
    }

    if (regionId) {
        whereConditions.push('ep.region_id = ?');
        params.push(regionId);
    }

    if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
    }
    query += ' ORDER BY ep.created_at DESC';

    const [profiles] = await pool.query(query, params);
    return profiles;
};

/**
 * Get profile by ID
 */
const getProfileById = async (id, userId) => {
    const [profiles] = await pool.query(
        'SELECT * FROM elevation_profiles WHERE id = ? AND created_by = ?',
        [id, userId]
    );

    if (profiles.length === 0) return null;
    return profiles[0];
};

/**
 * Create profile
 */
const createProfile = async (data, userId, req) => {
    const {
        profile_name,
        start_point,
        end_point,
        elevation_data,
        total_distance,
        min_elevation,
        max_elevation,
        elevation_gain,
        los_analysis,
        points,
        building_data,
        notes
    } = data;

    if (!start_point || !end_point) {
        throw new Error('START_END_REQUIRED');
    }

    const path_coordinates = points
        ? JSON.stringify(points.map(p => ({ lat: p.lat, lng: p.lng })))
        : elevation_data
            ? JSON.stringify(elevation_data.map(p => ({ lat: p.location.lat, lng: p.location.lng })))
            : JSON.stringify([start_point, end_point]);

    const [rows] = await pool.query(
        `INSERT INTO elevation_profiles
       (created_by, profile_name, notes, path_coordinates, elevation_data, total_distance, min_elevation, max_elevation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [
            userId,
            profile_name || null,
            notes || null,
            path_coordinates,
            elevation_data ? JSON.stringify(elevation_data) : null,
            total_distance,
            min_elevation,
            max_elevation
        ]
    );

    const newProfileId = rows[0].id;

    // Log audit
    await logAudit(userId, 'CREATE', 'elevation_profile', newProfileId, {
        profile_name,
        total_distance,
        min_elevation,
        max_elevation,
        elevation_gain,
        has_los_analysis: !!los_analysis
    }, req);

    websocketServer.broadcastGISUpdate('elevation', 'create', { id: newProfileId });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return {
        id: newProfileId,
        profile_name,
        total_distance,
        elevation_gain,
        los_analysis: los_analysis ? {
            isClear: los_analysis.isClear,
            clearancePercentage: los_analysis.clearancePercentage
        } : null
    };
};

/**
 * Update profile
 */
const updateProfile = async (id, userId, updates, req) => {
    const { profile_name, notes } = updates;

    const updateFields = [];
    const params = [];

    if (profile_name !== undefined) {
        updateFields.push('profile_name = ?');
        params.push(profile_name);
    }
    if (notes !== undefined) {
        updateFields.push('notes = ?');
        params.push(notes);
    }

    if (updateFields.length === 0) {
        throw new Error('NO_FIELDS_TO_UPDATE');
    }

    params.push(id, userId);

    await pool.query(
        `UPDATE elevation_profiles SET ${updateFields.join(', ')} WHERE id = ? AND created_by = ?`,
        params
    );

    // Log audit
    await logAudit(userId, 'UPDATE', 'elevation_profile', id, {
        updated_fields: { profile_name, notes }
    }, req);

    websocketServer.broadcastGISUpdate('elevation', 'update', { id });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return { success: true };
};

/**
 * Delete profile
 */
const deleteProfile = async (id, userId, req) => {
    const [profiles] = await pool.query(
        'SELECT total_distance FROM elevation_profiles WHERE id = ? AND created_by = ?',
        [id, userId]
    );

    await pool.query('DELETE FROM elevation_profiles WHERE id = ? AND created_by = ?', [id, userId]);

    if (profiles.length > 0) {
        await logAudit(userId, 'DELETE', 'elevation_profile', id, {
            total_distance: profiles[0].total_distance
        }, req);
    }

    websocketServer.broadcastGISUpdate('elevation', 'delete', { id });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return { success: true };
};

/**
 * Calculate elevation (Logic placeholder from original)
 */
const calculateElevation = async (data) => {
    const { start_point, end_point } = data;
    if (!start_point || !end_point) throw new Error('START_END_REQUIRED');

    // Placeholder data matching original controller
    return {
        points: [
            { distance: 0, elevation: 100 },
            { distance: 500, elevation: 150 },
            { distance: 1000, elevation: 120 }
        ],
        total_distance: 1000,
        min_elevation: 100,
        max_elevation: 150,
        elevation_gain: 50,
        elevation_loss: 30
    };
};

module.exports = {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile,
    calculateElevation
};
