/**
 * Database Backup Utilities
 * Helper functions for database backup operations
 */

const fs = require("fs");
const path = require("path");
const { BACKUP_DIR, ERRORS } = require("./constants");

/**
 * Ensure backup directory exists
 */
const ensureBackupDirectory = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

/**
 * Find pg_dump executable
 * @returns {string} pg_dump executable path
 */
const findPgDump = () => {
  const commonPaths = [
    "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe",
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) return `"${p}"`;
  }

  return "pg_dump"; // Default to PATH
};

/**
 * Generate backup filename with timestamp
 * @returns {string} Backup filename
 */
const generateBackupFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `backup_${timestamp}.sql`;
};

/**
 * Get backup filepath
 * @param {string} filename - Backup filename
 * @returns {string} Full filepath
 */
const getBackupFilepath = (filename) => {
  return path.join(BACKUP_DIR, filename);
};

/**
 * Format file size in MB
 * @param {number} sizeBytes - Size in bytes
 * @returns {string} Formatted size in MB
 */
const formatSizeMB = (sizeBytes) => {
  return (sizeBytes / (1024 * 1024)).toFixed(2);
};

/**
 * Check if file exists
 * @param {string} filepath - File path to check
 * @returns {boolean} Whether file exists
 */
const fileExists = (filepath) => {
  return fs.existsSync(filepath);
};

/**
 * Get file stats
 * @param {string} filepath - File path
 * @returns {Object} File stats
 */
const getFileStats = (filepath) => {
  return fs.statSync(filepath);
};

/**
 * Read file content
 * @param {string} filepath - File path
 * @returns {string} File content
 */
const readFileContent = (filepath) => {
  return fs.readFileSync(filepath, "utf-8");
};

/**
 * Delete file
 * @param {string} filepath - File path to delete
 */
const deleteFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

/**
 * Format duration in seconds
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration
 */
const formatDuration = (milliseconds) => {
  return (milliseconds / 1000).toFixed(2);
};

module.exports = {
  ensureBackupDirectory,
  findPgDump,
  generateBackupFilename,
  getBackupFilepath,
  formatSizeMB,
  fileExists,
  getFileStats,
  readFileContent,
  deleteFile,
  formatDuration,
};
