/**
 * Environment Validator Query Service
 * Database operations for environment validations
 */

const { pool } = require('../../../config/database');

/**
 * Gets validation history
 */
async function getValidationHistory() {
  const [validations] = await pool.query(
    `SELECT id, environment, overall_status,
            passed_checks, warning_count, error_count,
            created_at, created_by
     FROM dev_env_validations
     ORDER BY created_at DESC
     LIMIT 50`
  );

  return validations;
}

/**
 * Gets validation by ID
 */
async function getValidationById(validationId) {
  const [validations] = await pool.query(
    'SELECT * FROM dev_env_validations WHERE id = ?',
    [validationId]
  );

  return validations.length > 0 ? validations[0] : null;
}

/**
 * Deletes validation by ID
 */
async function deleteValidationById(validationId) {
  // Check if validation exists
  const [validations] = await pool.query(
    'SELECT * FROM dev_env_validations WHERE id = ?',
    [validationId]
  );

  if (validations.length === 0) {
    return { found: false };
  }

  // Delete the validation
  await pool.query('DELETE FROM dev_env_validations WHERE id = ?', [validationId]);

  return { found: true, deleted: true };
}

/**
 * Saves validation results to database
 */
async function saveValidationResults(userId, validationId, results) {
  await pool.query(
    `INSERT INTO dev_env_validations
     (environment, overall_status, passed_checks, warning_count,
      error_count, results, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      results.environment,
      results.summary.overallStatus,
      results.summary.passedChecks,
      results.summary.warningCount,
      results.summary.errorCount,
      JSON.stringify(results),
      userId
    ]
  );
}

module.exports = {
  getValidationHistory,
  getValidationById,
  deleteValidationById,
  saveValidationResults
};
