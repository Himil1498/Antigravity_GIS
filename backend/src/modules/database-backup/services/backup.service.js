/**
 * Backup Service
 * Business logic for backup file operations
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const { pool } = require("../../../config/database");
const { sendDevToolsNotification } = require("../../../shared/services/email");
const { TIMEOUTS, BACKUP_TYPES, ERRORS } = require("../constants");
const {
  ensureBackupDirectory,
  generateBackupFilename,
  getBackupFilepath,
  formatSizeMB,
  formatDuration,
  findPgDump,
} = require("../utils");

const execPromise = util.promisify(exec);

/**
 * Get database configuration from environment
 * @returns {Object} Database configuration
 */
const getDbConfig = () => ({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "opticonnectgis_db",
  port: process.env.DB_PORT || 5432,
});

/**
 * Build pg_dump command
 * @param {Object} options - Backup options
 * @param {string} filepath - Output file path
 * @returns {string} pg_dump command
 */
const buildPgDumpCommand = (options, filepath) => {
  const { includeData, tables } = options;
  const dbConfig = getDbConfig();
  const pgDumpExe = findPgDump();

  // Basic command
  // Note: PGPASSWORD is passed via env, so we don't include it in command string for security
  let cmd = `${pgDumpExe} -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user}`;

  // Critical options for proper backup
  // --format=p: Plain text SQL (explicit)
  // --no-owner --no-acl: Ensures portability across environments (removes role dependencies)
  // --clean --if-exists: Adds DROP commands to clean target DB before creation
  // --column-inserts: Uses INSERT INTO ... (col1, col2) VALUES ... instead of COPY.
  //   - Much more portable (works in DBeaver/pgAdmin Query Tool).
  //   - Slower for huge data, but safer for user portability needs.
  // --encoding=UTF8: Enforce standard encoding.
  cmd +=
    " --format=p --no-owner --no-acl --clean --if-exists --column-inserts --encoding=UTF8";

  if (!includeData) {
    cmd += " --schema-only";
  }

  // Specific tables
  if (tables && tables.length > 0) {
    tables.forEach((t) => (cmd += ` -t "${t}"`));
  }

  // Database name and output file
  cmd += ` -f "${filepath}" ${dbConfig.database}`;

  return cmd;
};

/**
 * Execute backup command
 * @param {string} command - pg_dump command
 * @param {string} password - DB password
 * @returns {Promise<void>}
 */
const executeBackupCommand = async (command, password) => {
  try {
    const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
    // Pass password safely via Environment Variable
    await execPromise(command, {
      timeout: TIMEOUTS.BACKUP,
      shell: shell,
      env: { ...process.env, PGPASSWORD: password },
    });
  } catch (execError) {
    if (execError.message.includes("not recognized")) {
      throw new Error(
        "pg_dump not found. Ensure PostgreSQL tools are in system PATH.",
      );
    }
    throw execError;
  }
};

/**
 * Count tables in database
 * @param {Array<string>} tables - Specific tables (if provided)
 * @returns {Promise<number>} Table count
 */
const countTables = async (tables) => {
  if (tables && tables.length > 0) {
    return tables.length;
  }

  // PostgreSQL Query
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'",
  );

  return parseInt(rows[0].count);
};

/**
 * Save backup metadata to database
 * @param {Object} backupData - Backup metadata
 * @returns {Promise<number>} Backup ID
 */
const saveBackupMetadata = async (backupData) => {
  const {
    filename,
    filepath,
    sizeBytes,
    tableCount,
    includeData,
    description,
    userId,
    tables,
  } = backupData;

  const [result] = await pool.query(
    `INSERT INTO dev_backups
     (filename, filepath, size_bytes, backup_type, tables_count,
      include_data, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [
      filename,
      filepath,
      sizeBytes,
      tables && tables.length > 0 ? BACKUP_TYPES.PARTIAL : BACKUP_TYPES.FULL,
      tableCount,
      includeData ? 1 : 0,
      description,
      userId,
    ],
  );

  return result[0].id;
};

/**
 * Create database backup
 * @param {Object} options - Backup options
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Backup result
 */
const createBackup = async (options, userId) => {
  ensureBackupDirectory();

  const { description = "", includeData = true, tables = [] } = options;
  const filename = generateBackupFilename();
  const filepath = getBackupFilepath(filename);
  const dbConfig = getDbConfig();

  console.log(`Creating PostgreSQL backup: ${filename}`);

  // Build and execute backup command
  const pgDumpCmd = buildPgDumpCommand({ includeData, tables }, filepath);
  const startTime = Date.now();

  await executeBackupCommand(pgDumpCmd, dbConfig.password);

  // Post-process to remove invalid PostgreSQL 18+ artifacts (e.g. \restrict, \unrestrict)
  try {
    const content = fs.readFileSync(filepath, "utf8");
    if (content.includes("\\restrict") || content.includes("\\unrestrict")) {
      const cleanContent = content
        .split("\n")
        .filter(
          (line) =>
            !line.trim().startsWith("\\restrict") &&
            !line.trim().startsWith("\\unrestrict"),
        )
        .join("\n");
      fs.writeFileSync(filepath, cleanContent, "utf8");
    }
  } catch (err) {
    console.error("Failed to sanitize backup file:", err);
  }

  const duration = Date.now() - startTime;

  // Get file size
  const stats = fs.statSync(filepath);
  const sizeBytes = stats.size;
  const sizeMB = formatSizeMB(sizeBytes);

  // Count tables
  const tableCount = await countTables(tables);

  // Save metadata
  const backupId = await saveBackupMetadata({
    filename,
    filepath,
    sizeBytes,
    tableCount,
    includeData,
    description,
    userId,
    tables,
  });

  console.log(`✅ Backup created successfully: ${filename} (${sizeMB} MB)`);

  return {
    id: backupId,
    filename,
    filepath,
    sizeBytes,
    sizeMB,
    tableCount,
    duration: formatDuration(duration),
    createdAt: new Date().toISOString(),
  };
};

module.exports = {
  createBackup,
  getDbConfig,
};
