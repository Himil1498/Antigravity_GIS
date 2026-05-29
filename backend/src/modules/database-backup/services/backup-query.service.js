/**
 * Backup Query Service
 * Business logic for querying backup information
 */

const { pool } = require('../../../config/database');
const { DEFAULTS } = require('../constants');
const { getBackupFilepath, fileExists } = require('../utils');

/**
 * Get all backups
 * @returns {Promise<Array>} Array of backup records
 */
const getAllBackups = async () => {
  const [backups] = await pool.query(
    `SELECT
      b.id,
      b.filename,
      b.size_bytes,
      ROUND(b.size_bytes / (1024 * 1024), 2) as size_mb,
      b.backup_type,
      b.tables_count,
      b.include_data,
      b.description,
      b.created_at,
      b.created_by,
      u.username as created_by_name,
      b.restored_at,
      b.restored_by,
      u2.username as restored_by_name,
      b.filepath
    FROM dev_backups b
    LEFT JOIN users u ON b.created_by = u.id
    LEFT JOIN users u2 ON b.restored_by = u2.id
    ORDER BY b.created_at DESC
    LIMIT ?`,
    [DEFAULTS.BACKUP_LIMIT]
  );

  // Check if files still exist and format data
  const backupsWithStatus = backups.map((backup) => {
    const filepath = backup.filepath || getBackupFilepath(backup.filename);
    const exists = fileExists(filepath);

    return {
      ...backup,
      size_mb: Number(backup.size_mb) || 0,
      fileExists: exists,
      canRestore: exists && backup.include_data
    };
  });

  return backupsWithStatus;
};

/**
 * Get backup by ID
 * @param {number} backupId - Backup ID
 * @returns {Promise<Object|null>} Backup record or null
 */
const getBackupById = async (backupId) => {
  const [backups] = await pool.query(
    'SELECT * FROM dev_backups WHERE id = ?',
    [backupId]
  );

  return backups.length > 0 ? backups[0] : null;
};

/**
 * Get backup statistics
 * @returns {Promise<Object>} Statistics object
 */
const getBackupStatistics = async () => {
  const [stats] = await pool.query(`
    SELECT
      COUNT(*) as total_backups,
      SUM(size_bytes) as total_size_bytes,
      ROUND(SUM(size_bytes) / (1024 * 1024), 2) as total_size_mb,
      ROUND(AVG(size_bytes) / (1024 * 1024), 2) as avg_size_mb,
      MAX(created_at) as last_backup_at,
      COUNT(CASE WHEN restored_at IS NOT NULL THEN 1 END) as restored_count
    FROM dev_backups
  `);

  const [recentBackups] = await pool.query(`
    SELECT id, filename, created_at,
           ROUND(size_bytes / (1024 * 1024), 2) as size_mb
    FROM dev_backups
    ORDER BY created_at DESC
    LIMIT ?
  `, [DEFAULTS.STATS_LIMIT]);

  // Convert string numbers to actual numbers
  const statsData = stats[0];
  const formattedStats = {
    total_backups: Number(statsData.total_backups) || 0,
    total_size_bytes: Number(statsData.total_size_bytes) || 0,
    total_size_mb: Number(statsData.total_size_mb) || 0,
    avg_size_mb: Number(statsData.avg_size_mb) || 0,
    last_backup_at: statsData.last_backup_at,
    restored_count: Number(statsData.restored_count) || 0
  };

  const formattedRecentBackups = recentBackups.map((backup) => ({
    ...backup,
    size_mb: Number(backup.size_mb) || 0
  }));

  return {
    stats: formattedStats,
    recentBackups: formattedRecentBackups
  };
};

/**
 * Delete backup record from database
 * @param {number} backupId - Backup ID
 * @returns {Promise<void>}
 */
const deleteBackupRecord = async (backupId) => {
  await pool.query('DELETE FROM dev_backups WHERE id = ?', [backupId]);
};

/**
 * Update backup restore metadata
 * @param {number} backupId - Backup ID
 * @param {number} userId - User ID who restored
 * @returns {Promise<void>}
 */
const updateRestoreMetadata = async (backupId, userId) => {
  await pool.query(
    'UPDATE dev_backups SET restored_at = NOW(), restored_by = ? WHERE id = ?',
    [userId, backupId]
  );
};

module.exports = {
  getAllBackups,
  getBackupById,
  getBackupStatistics,
  deleteBackupRecord,
  updateRestoreMetadata
};






