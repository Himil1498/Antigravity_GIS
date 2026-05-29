const { pool } = require('../../../config/database');
const { DEFAULTS, SEARCH_TYPES } = require('../constants');

/**
 * Get user's search history
 */
const getSearchHistory = async (userId, limit = DEFAULTS.LIMIT, offset = DEFAULTS.OFFSET) => {
    const [history] = await pool.query(
        `SELECT * FROM search_history
       WHERE user_id = ?
       ORDER BY searched_at DESC
       LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM search_history WHERE user_id = ?',
        [userId]
    );

    return {
        history,
        total: countResult[0].total
    };
};

/**
 * Get recent unique search queries
 */
const getRecentSearches = async (userId, limit = DEFAULTS.RECENT_LIMIT) => {
    const [searches] = await pool.query(
        `SELECT DISTINCT search_query, search_type, MAX(searched_at) as last_searched
       FROM search_history
       WHERE user_id = ?
       GROUP BY search_query, search_type
       ORDER BY last_searched DESC
       LIMIT ?`,
        [userId, parseInt(limit)]
    );

    return searches;
};

/**
 * Add search to history
 */
const addSearchToHistory = async (userId, query, type, resultCount = 0) => {
    // Validate search_type
    const validTypes = Object.values(SEARCH_TYPES);
    if (!validTypes.includes(type)) {
        throw new Error(`Invalid search_type. Must be one of: ${validTypes.join(', ')}`);
    }

    await pool.query(
        `INSERT INTO search_history (user_id, search_query, search_type, result_count, searched_at)
       VALUES (?, ?, ?, ?, NOW())`,
        [userId, query, type, resultCount]
    );
};

/**
 * Clear user's search history
 */
const clearSearchHistory = async (userId) => {
    await pool.query(
        'DELETE FROM search_history WHERE user_id = ?',
        [userId]
    );
};

/**
 * Delete a specific search from history
 */
const deleteSearch = async (searchId, userId) => {
    const [result] = await pool.query(
        'DELETE FROM search_history WHERE id = ? AND user_id = ?',
        [searchId, userId]
    );
    return result.affectedRows > 0;
};

/**
 * Get search statistics
 */
const getSearchStats = async (userId) => {
    // Get stats by search type
    const [typeStats] = await pool.query(
        `SELECT search_type, COUNT(*) as count
       FROM search_history
       WHERE user_id = ?
       GROUP BY search_type`,
        [userId]
    );

    // Get total searches
    const [totalResult] = await pool.query(
        'SELECT COUNT(*) as total FROM search_history WHERE user_id = ?',
        [userId]
    );

    // Get most searched queries
    const [topQueries] = await pool.query(
        `SELECT search_query, search_type, COUNT(*) as frequency
       FROM search_history
       WHERE user_id = ?
       GROUP BY search_query, search_type
       ORDER BY frequency DESC
       LIMIT 5`,
        [userId]
    );

    return {
        total: totalResult[0].total,
        by_type: typeStats,
        top_queries: topQueries
    };
};

module.exports = {
    getSearchHistory,
    getRecentSearches,
    addSearchToHistory,
    clearSearchHistory,
    deleteSearch,
    getSearchStats
};
