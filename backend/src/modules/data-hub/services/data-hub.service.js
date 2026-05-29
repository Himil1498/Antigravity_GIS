const { pool } = require('../../../config/database');
const { applyTableAlias } = require('../utils');

/**
 * Fetches all user data from multiple tables in parallel
 */
async function fetchAllUserData(whereCondition, whereParams, limit = 100) {
    const paramsWithLimit = [...whereParams, parseInt(limit)];
    
    try {
        const [
            distancesResult,
            polygonsResult,
            circlesResult,
            elevationsResult,
            sectorsResult
        ] = await Promise.all([
            pool.query(
                `SELECT d.*, u.username as username FROM distance_measurements d
       LEFT JOIN users u ON d.created_by = u.id
       ${applyTableAlias(whereCondition, 'd', 'created_by')}
       ORDER BY d.created_at DESC
       LIMIT ?`,
                paramsWithLimit
            ),
            pool.query(
                `SELECT p.*, u.username as username FROM polygon_drawings p
       LEFT JOIN users u ON p.created_by = u.id
       ${applyTableAlias(whereCondition, 'p', 'created_by')}
       ORDER BY p.created_at DESC
       LIMIT ?`,
                paramsWithLimit
            ),
            pool.query(
                `SELECT c.*, u.username as username FROM circle_drawings c
       LEFT JOIN users u ON c.created_by = u.id
       ${applyTableAlias(whereCondition, 'c', 'created_by')}
       ORDER BY c.created_at DESC
       LIMIT ?`,
                paramsWithLimit
            ),
            pool.query(
                `SELECT e.*, u.username as username FROM elevation_profiles e
       LEFT JOIN users u ON e.created_by = u.id
       ${applyTableAlias(whereCondition, 'e', 'created_by')}
       ORDER BY e.created_at DESC
       LIMIT ?`,
                paramsWithLimit
            ),
            pool.query(
                `SELECT s.*, u.username as username FROM sector_rf_data s
       LEFT JOIN users u ON s.user_id = u.id
       ${applyTableAlias(whereCondition, 's', 'user_id')}
       ORDER BY s.created_at DESC
       LIMIT ?`,
                paramsWithLimit
            )
        ]);

        return {
            distancesRaw: distancesResult[0] || [],
            polygons: polygonsResult[0] || [],
            circles: circlesResult[0] || [],
            elevations: elevationsResult[0] || [],
            infrastructures: [], // Empty array since table is removed
            sectors: sectorsResult[0] || []
        };
    } catch (error) {
        console.error('fetchAllUserData error:', error);
        throw error;
    }
}

/**
 * Checks if an item exists and returns its owner ID
 */
async function checkItemOwnership(tableName, itemId, userIdColumn) {
    const [items] = await pool.query(
        `SELECT ${userIdColumn} as owner_id FROM ${tableName} WHERE id = ?`,
        [itemId]
    );

    if (items.length === 0) {
        return { exists: false, ownerId: null };
    }

    return { exists: true, ownerId: items[0].owner_id };
}

/**
 * Gets count of items that will be deleted
 */
async function getDeleteCount(tableName, whereCondition, whereParams) {
    const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereCondition}`;
    const [countResult] = await pool.query(countQuery, whereParams);
    return countResult[0].count;
}

/**
 * Deletes a single item
 */
async function deleteSingleItem(tableName, itemId) {
    await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [itemId]);
}

/**
 * Deletes multiple items
 */
async function deleteBulkItems(tableName, whereCondition, whereParams) {
    const deleteQuery = `DELETE FROM ${tableName} ${whereCondition}`;
    await pool.query(deleteQuery, whereParams);
}

/**
 * Fetches export history
 */
async function fetchExportHistory(userId, limit, offset) {
    const [exports] = await pool.query(
        `SELECT * FROM data_hub_exports
     WHERE user_id = ?
     AND (expires_at IS NULL OR end_time > NOW())
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
    );
    return exports;
}

/**
 * Fetches a specific export
 */
async function fetchExportById(exportId, userId) {
    const [exports] = await pool.query(
        `SELECT * FROM data_hub_exports
     WHERE id = ? AND user_id = ?
     AND export_status = 'completed'
     AND (expires_at IS NULL OR end_time > NOW())`,
        [exportId, userId]
    );
    return exports.length > 0 ? exports[0] : null;
}

/**
 * Creates a new export record
 */
async function createExportRecord(userId, exportData) {
    const { region_id, export_type, export_scope, fileName, fileUrl, export_settings } = exportData;

    const [result] = await pool.query(
        `INSERT INTO data_hub_exports
     (user_id, region_id, export_type, export_scope, file_name, file_url,
      export_status, export_settings, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW() + INTERVAL '7 days')
     RETURNING id`,
        [
            userId,
            region_id,
            export_type,
            export_scope,
            fileName,
            fileUrl,
            export_settings ? JSON.stringify(export_settings) : null
        ]
    );

    return result[0].id;
}

/**
 * Updates export status
 */
async function updateExportStatus(exportId, recordsExported = 0) {
    await pool.query(
        `UPDATE data_hub_exports
     SET export_status = 'completed', records_exported = ?, completed_at = NOW()
     WHERE id = ?`,
        [recordsExported, exportId]
    );
}

module.exports = {
    fetchAllUserData,
    checkItemOwnership,
    getDeleteCount,
    deleteSingleItem,
    deleteBulkItems,
    fetchExportHistory,
    fetchExportById,
    createExportRecord,
    updateExportStatus
};
