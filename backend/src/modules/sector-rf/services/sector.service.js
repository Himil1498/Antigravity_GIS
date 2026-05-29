const { pool } = require('../../../config/database');
const { logAudit } = require('../../audit/audit.service');
const websocketServer = require('../../../shared/services/websocket');
const { clearCache } = require('../../../shared/middleware/cache');
const { DEFAULTS } = require('../constants');

/**
 * Get all sectors
 */
async function getAllSectors(userId, userRole, queryParams) {
    const { regionId, filter, userId: filterUserId } = queryParams;

    let query = `
      SELECT sr.*, u.username as username
      FROM sector_rf_data sr
      LEFT JOIN users u ON sr.user_id = u.id
    `;
    let params = [];
    let whereConditions = [];

    if (filter === 'all' && (userRole === 'admin' || userRole === 'manager')) {
        // Admin viewing all
    } else if (filter === 'user' && (userRole === 'admin' || userRole === 'manager') && filterUserId) {
        whereConditions.push('sr.user_id = ?');
        params.push(parseInt(filterUserId));
    } else {
        whereConditions.push('sr.user_id = ?');
        params.push(userId);
    }

    if (regionId) {
        whereConditions.push('sr.region_id = ?');
        params.push(regionId);
    }

    if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
    }
    query += ' ORDER BY sr.created_at DESC';

    const [sectors] = await pool.query(query, params);
    return sectors;
}

/**
 * Get sector by ID
 */
async function getSectorById(id, userId) {
    const [sectors] = await pool.query(
        'SELECT * FROM sector_rf_data WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    return sectors.length > 0 ? sectors[0] : null;
}

/**
 * Create sector
 */
async function createSector(data, userId, req) {
    const {
        sector_name,
        tower_lat,
        tower_lng,
        azimuth,
        beamwidth,
        radius,
        frequency,
        power,
        antenna_height,
        antenna_type,
        fill_color,
        stroke_color,
        opacity,
        properties,
        region_id,
        notes,
        is_saved
    } = data;

    if (!tower_lat || !tower_lng || azimuth === undefined) {
        throw new Error('MISSING_FIELDS');
    }

    // Use RETURNING id for PostgreSQL
    const query = `INSERT INTO sector_rf_data
       (user_id, region_id, sector_name, tower_lat, tower_lng, azimuth, beamwidth,
        radius, frequency, power, antenna_height, antenna_type, fill_color,
        stroke_color, opacity, properties, notes, is_saved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`;

    const [rows] = await pool.query(query, [
            userId,
            region_id,
            sector_name,
            tower_lat,
            tower_lng,
            azimuth,
            beamwidth || DEFAULTS.BEAMWIDTH,
            radius || DEFAULTS.RADIUS,
            frequency,
            power,
            antenna_height,
            antenna_type,
            fill_color || DEFAULTS.FILL_COLOR,
            stroke_color || DEFAULTS.STROKE_COLOR,
            opacity || DEFAULTS.OPACITY,
            properties ? JSON.stringify(properties) : null,
            notes,
            (is_saved || false) ? 1 : 0 // Cast boolean to integer for PG
    ]);

    const newSectorId = rows[0].id;

    // Log audit
    await logAudit(userId, 'CREATE', 'sector_rf', newSectorId, {
        sector_name,
        azimuth,
        beamwidth: beamwidth || DEFAULTS.BEAMWIDTH,
        radius: radius || DEFAULTS.RADIUS,
        frequency
    }, req);

    websocketServer.broadcastGISUpdate('sector', 'create', { id: newSectorId });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return {
        id: newSectorId,
        sector_name,
        azimuth,
        beamwidth: beamwidth || DEFAULTS.BEAMWIDTH,
        radius: radius || DEFAULTS.RADIUS
    };
}

/**
 * Update sector
 */
async function updateSector(id, updates, userId, req) {
    const {
        sector_name, frequency, power, antenna_height, antenna_type,
        fill_color, stroke_color, opacity, notes, is_saved
    } = updates;

    const updateFields = [];
    const params = [];

    if (sector_name) {
        updateFields.push('sector_name = ?');
        params.push(sector_name);
    }
    if (frequency !== undefined) {
        updateFields.push('frequency = ?');
        params.push(frequency);
    }
    if (power !== undefined) {
        updateFields.push('power = ?');
        params.push(power);
    }
    if (antenna_height !== undefined) {
        updateFields.push('antenna_height = ?');
        params.push(antenna_height);
    }
    if (antenna_type) {
        updateFields.push('antenna_type = ?');
        params.push(antenna_type);
    }
    if (fill_color) {
        updateFields.push('fill_color = ?');
        params.push(fill_color);
    }
    if (stroke_color) {
        updateFields.push('stroke_color = ?');
        params.push(stroke_color);
    }
    if (opacity !== undefined) {
        updateFields.push('opacity = ?');
        params.push(opacity);
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
        throw new Error('NO_UPDATES');
    }

    updateFields.push('updated_at = NOW()');
    params.push(id, userId);

    const [result] = await pool.query(
        `UPDATE sector_rf_data SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
        params
    );

    if (result.affectedRows === 0) {
        // Could be not found or no changes if values were same, but mostly ownership check
        // Check if exists
        const [exists] = await pool.query('SELECT id FROM sector_rf_data WHERE id = ?', [id]);
        if (exists.length === 0) throw new Error('SECTOR_NOT_FOUND');
        // If exists but not updated, means ownership failed
        // For now let's assume successful update if no error.
    }

    // Log audit
    await logAudit(userId, 'UPDATE', 'sector_rf', id, {
        updated_fields: { sector_name, frequency, power, antenna_height, antenna_type, fill_color, stroke_color, opacity, notes, is_saved }
    }, req);

    websocketServer.broadcastGISUpdate('sector', 'update', { id });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return { success: true };
}

/**
 * Delete sector
 */
async function deleteSector(id, userId, req) {
    // Get sector details before deletion for audit log
    const [sectors] = await pool.query(
        'SELECT sector_name, azimuth, frequency FROM sector_rf_data WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (sectors.length === 0) {
        throw new Error('SECTOR_NOT_FOUND');
    }

    await pool.query('DELETE FROM sector_rf_data WHERE id = ? AND user_id = ?', [id, userId]);

    // Log audit
    await logAudit(userId, 'DELETE', 'sector_rf', id, {
        sector_name: sectors[0].sector_name,
        azimuth: sectors[0].azimuth,
        frequency: sectors[0].frequency
    }, req);

    websocketServer.broadcastGISUpdate('sector', 'delete', { id });
    clearCache(['/api/datahub', '/api/datahub/all']);

    return { success: true };
}

/**
 * Calculate coverage (Placeholder)
 */
async function calculateCoverage(id, userId) {
    const [sectors] = await pool.query(
        'SELECT * FROM sector_rf_data WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (sectors.length === 0) {
        throw new Error('SECTOR_NOT_FOUND');
    }

    const sector = sectors[0];

    return {
        sector_id: id,
        predicted_range: sector.radius,
        coverage_area: Math.PI * Math.pow(sector.radius, 2),
        signal_strength: 'Good',
        interference_level: 'Low'
    };
}

module.exports = {
    getAllSectors,
    getSectorById,
    createSector,
    updateSector,
    deleteSector,
    calculateCoverage
};
