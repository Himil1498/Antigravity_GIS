const { pool } = require('../../../config/database');
const { DEFAULTS } = require('../constants');

/**
 * Global search across user's data
 */
const globalSearch = async (userId, query) => {
    const searchTerm = `%${query}%`;
    const results = {};

    // Search in infrastructure (Removed)
    results.infrastructure = [];

    // Search in measurements (Removed - Tools are transient now)
    results.measurements = [];

    // Search in bookmarks
    try {
        const [bookmarks] = await pool.query(
            `SELECT id, name, latitude, longitude
           FROM bookmarks
           WHERE user_id = ? AND name LIKE ?
           LIMIT ?`,
            [userId, searchTerm, 5]
        );
        results.bookmarks = bookmarks;
    } catch (e) { throw new Error(`Bookmarks failed: ${e.message}`); }

    // Search in layers
    try {
        const [layers] = await pool.query(
            `SELECT id, name as layer_name, type as layer_type
           FROM layer_management
           WHERE user_id = ? AND name LIKE ?
           LIMIT ?`,
            [userId, searchTerm, 5]
        );
        results.layers = layers;
    } catch (e) { throw new Error(`Layers failed: ${e.message}`); }

    return results;
};

/**
 * Search users (region-filtered)
 */
const searchUsers = async (userId, query, limit = DEFAULTS.LIMIT) => {
    const searchTerm = `%${query}%`;

    // Get user's regions
    const [userRegions] = await pool.query(
        'SELECT region_id FROM user_regions WHERE user_id = ?',
        [userId]
    );

    const regionIds = userRegions.map(r => r.region_id);

    if (regionIds.length === 0) {
        return [];
    }

    // Search users in same regions
    const [users] = await pool.query(
        `SELECT DISTINCT u.id, u.username, u.email, u.full_name, u.role
       FROM users u
       INNER JOIN user_regions ur ON u.id = ur.user_id
       WHERE ur.region_id IN (?) AND (u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)
       AND u.is_active::boolean = true
       LIMIT ?`,
        [regionIds, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    return users;
};

/**
 * Search regions (user's regions only)
 */
const searchRegions = async (userId, query, limit = DEFAULTS.LIMIT) => {
    const searchTerm = `%${query}%`;

    const [regions] = await pool.query(
        `SELECT DISTINCT r.id, r.name, r.code, r.type
       FROM regions r
       INNER JOIN user_regions ur ON r.id = ur.region_id
       WHERE ur.user_id = ? AND (r.name LIKE ? OR r.code LIKE ?)
       LIMIT ?`,
        [userId, searchTerm, searchTerm, parseInt(limit)]
    );

    return regions;
};

/**
 * Search GIS features
 */
const searchFeatures = async (userId, query, limit = DEFAULTS.LIMIT) => {
    const searchTerm = `%${query}%`;

    const [features] = await pool.query(
        `SELECT id, name, feature_type, latitude, longitude
       FROM gis_features
       WHERE created_by = ? AND (name LIKE ? OR description LIKE ?)
       LIMIT ?`,
        [userId, searchTerm, searchTerm, parseInt(limit)]
    );

    return features;
};

/**
 * Search saved GIS data (admin can search by user)
 */
const searchSavedData = async (currentUserId, currentUserRole, query, targetUserId, limit = DEFAULTS.LIMIT) => {
    const searchTerm = `%${query}%`;

    // Determine which user's data to search
    let searchUserId = currentUserId;

    // Admin and manager can search other users' data
    if ((currentUserRole === 'admin' || currentUserRole === 'manager') && targetUserId) {
        searchUserId = parseInt(targetUserId);
    }

    const results = {
        infrastructure: [],
        measurements: [],
        polygons: [],
        circles: [],
        elevations: [],
        sectors: []
    };

    const limitVal = parseInt(limit);

    // Search Infrastructure (Removed)
    results.infrastructure = [];

    // Search Distance Measurements (Removed)
    results.measurements = [];

    // Search Polygon Drawings (Removed)
    results.polygons = [];

    // Search Circle Drawings (Removed)
    results.circles = [];

    // Search Elevation Profiles (Removed)
    results.elevations = [];

    // Search RF Sectors
    const [sectors] = await pool.query(
        `SELECT id, sector_name as name, tower_lat, tower_lng, radius, azimuth, beamwidth,
              stroke_color, fill_color, opacity, created_at
       FROM sector_rf_data
       WHERE user_id = ? AND sector_name LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
        [searchUserId, searchTerm, limitVal]
    );
    results.sectors = sectors.map(s => ({
        ...s,
        center: s.tower_lat && s.tower_lng ? { lat: s.tower_lat, lng: s.tower_lng } : null
    }));

    // Get user info if admin/manager searching another user's data
    let userInfo = null;
    if ((currentUserRole === 'admin' || currentUserRole === 'manager') && searchUserId !== currentUserId) {
        const [users] = await pool.query(
            'SELECT id, username, full_name, email FROM users WHERE id = ?',
            [searchUserId]
        );
        userInfo = users[0] || null;
    }

    return {
        results,
        searchedUser: userInfo,
        totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    };
};

/**
 * Get list of users for admin/manager to filter search
 */
const getUsersList = async () => {
    const [users] = await pool.query(
        `SELECT id, username, full_name, email, role
       FROM users
       WHERE is_active::boolean = true
       ORDER BY full_name, username`
    );
    return users;
};

module.exports = {
    globalSearch,
    searchUsers,
    searchRegions,
    searchFeatures,
    searchSavedData,
    getUsersList
};
