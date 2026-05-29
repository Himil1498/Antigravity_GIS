/**
 * Database Validator
 * Validates database connection and schema
 */

const { pool } = require('../../../config/database');
const { CRITICAL_TABLES } = require('../constants');

/**
 * Validates database connection and schema
 */
async function validateDatabaseConnection() {
  const passed = [];
  const warnings = [];
  const errors = [];

  try {
    // Test connection
    await pool.query('SELECT 1');
    passed.push({
      category: 'database',
      check: 'connection',
      status: 'passed',
      message: 'Database connection successful'
    });

    // Check database exists
    const dbName = process.env.DB_NAME;
    const [databases] = await pool.query(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );

    if (databases.length > 0) {
      passed.push({
        category: 'database',
        check: 'database_exists',
        status: 'passed',
        message: `Database '${dbName}' exists`
      });
    } else {
      errors.push({
        category: 'database',
        check: 'database_exists',
        status: 'error',
        message: `Database '${dbName}' not found`,
        recommendation: 'Run DATABASE_SETUP.sql to create the database'
      });
    }

    // Check table count
    const [tables] = await pool.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?',
      [dbName]
    );

    const tableCount = tables[0].count;
    if (tableCount >= 47) {
      passed.push({
        category: 'database',
        check: 'tables',
        status: 'passed',
        message: `${tableCount} tables found (expected 47+)`
      });
    } else if (tableCount > 0) {
      warnings.push({
        category: 'database',
        check: 'tables',
        status: 'warning',
        message: `Only ${tableCount} tables found (expected 47+)`,
        recommendation: 'Some migrations may not have been run'
      });
    } else {
      errors.push({
        category: 'database',
        check: 'tables',
        status: 'error',
        message: 'No tables found in database',
        recommendation: 'Run DATABASE_SETUP.sql to create tables'
      });
    }

    // Check critical tables exist
    for (const tableName of CRITICAL_TABLES) {
      const [tableCheck] = await pool.query(
        `SELECT COUNT(*) as count FROM information_schema.tables
         WHERE table_schema = ? AND table_name = ?`,
        [dbName, tableName]
      );

      if (tableCheck[0].count > 0) {
        passed.push({
          category: 'database',
          check: `table_${tableName}`,
          status: 'passed',
          message: `Table '${tableName}' exists`
        });
      } else {
        errors.push({
          category: 'database',
          check: `table_${tableName}`,
          status: 'error',
          message: `Critical table '${tableName}' not found`,
          recommendation: 'Run database migrations'
        });
      }
    }

  } catch (error) {
    errors.push({
      category: 'database',
      check: 'connection',
      status: 'error',
      message: 'Database connection failed',
      details: error.message,
      recommendation: 'Check database credentials and ensure PostgreSQL is running'
    });
  }

  return { passed, warnings, errors };
}

module.exports = {
  validateDatabaseConnection
};
