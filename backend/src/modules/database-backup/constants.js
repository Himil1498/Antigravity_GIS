/**
 * Database Backup Constants
 * Route paths and configuration constants
 */

const path = require("path");

module.exports = {
  // Backup directory
  BACKUP_DIR: path.join(process.cwd(), "..", "database_backups"),

  // Route paths
  ROUTES: {
    CREATE: "/api/developer-tools/backup/create",
    LIST: "/api/developer-tools/backup/list",
    DOWNLOAD: "/api/developer-tools/backup/:backupId/download",
    RESTORE: "/api/developer-tools/backup/:backupId/restore",
    DELETE: "/api/developer-tools/backup/:backupId",
    SCHEDULE: "/api/developer-tools/backup/schedule",
    STATS: "/api/developer-tools/backup/stats",
    VERIFY: "/api/developer-tools/backup/:backupId/verify",
  },

  // PostgreSQL executable paths (Windows & Linux)
  PG_PATHS: {
    PG_DUMP: [
      "pg_dump",
      "/usr/bin/pg_dump",
      "/usr/local/bin/pg_dump",
      "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe",
      "C:\\Program Files (x86)\\PostgreSQL\\16\\bin\\pg_dump.exe",
    ],
    PSQL: [
      "psql",
      "/usr/bin/psql",
      "/usr/local/bin/psql",
      "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
      "C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe",
      "C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe",
      "C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe",
    ],
  },

  // Timeouts
  TIMEOUTS: {
    BACKUP: 300000, // 5 minutes
    RESTORE: 300000, // 5 minutes
  },

  // Default values
  DEFAULTS: {
    INCLUDE_DATA: true,
    DELETE_FILE: true,
    BACKUP_LIMIT: 100,
    STATS_LIMIT: 5,
  },

  // Error Messages
  ERRORS: {
    PGDUMP_NOT_FOUND:
      "pg_dump command not found. Please ensure PostgreSQL is installed and available in the system PATH.",
    PSQL_NOT_FOUND:
      "psql command not found. Please ensure PostgreSQL is installed and available in the system PATH.",
    BACKUP_NOT_FOUND: "Backup not found",
    FILE_NOT_FOUND: "Backup file not found on disk",
    RESTORE_CONFIRMATION_REQUIRED: "Restore confirmation required",
    FAILED_TO_CREATE: "Failed to create backup",
    FAILED_TO_GET: "Failed to retrieve backups",
    FAILED_TO_DOWNLOAD: "Failed to download backup",
    FAILED_TO_RESTORE: "Failed to restore database",
    FAILED_TO_DELETE: "Failed to delete backup",
    FAILED_TO_SCHEDULE: "Failed to schedule backup",
    FAILED_TO_GET_STATS: "Failed to retrieve backup statistics",
    FAILED_TO_VERIFY: "Failed to verify backup",
  },

  // Success Messages
  MESSAGES: {
    BACKUP_CREATED: "Backup created successfully with FK support",
    BACKUP_DELETED: "Backup deleted successfully",
    RESTORE_SUCCESS:
      "Database restored successfully with all FK relationships intact",
    SCHEDULE_PLACEHOLDER:
      "Backup scheduling feature - to be implemented with node-cron",
  },

  // Backup types
  BACKUP_TYPES: {
    FULL: "full",
    PARTIAL: "partial",
  },
};
