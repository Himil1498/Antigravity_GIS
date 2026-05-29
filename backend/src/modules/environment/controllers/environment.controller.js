/**
 * Environment Validator Controller
 * HTTP controllers for environment validation
 */

const { ERRORS, MESSAGES } = require('../constants');
const { sendAdminNotifications } = require('../services/notificationService');
const { validateEnvironmentVariables } = require('../services/envVarValidator');
const { validateDatabaseConnection } = require('../services/databaseValidator');
const {
  validateFileSystem,
  validateNodeModules,
  validatePorts,
  validateAPIConnectivity,
  validateProductionConfig
} = require('../services/systemValidator');
const {
  getValidationHistory: fetchValidationHistory,
  getValidationById: fetchValidationById,
  deleteValidationById,
  saveValidationResults
} = require('../services/envValidatorQueryService');
const { logAudit } = require('../../audit/audit.service');

/**
 * @route   POST /api/dev-tools/env/validate
 * @desc    Validate environment configuration
 * @access  Private
 */
const validateEnvironment = async (req, res) => {
  const userId = req.user.id;
  const startTime = Date.now();

  try {
    const validationId = Date.now();
    const results = {
      validationId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      passed: [],
      warnings: [],
      errors: [],
      summary: {}
    };

    // Run validation checks
    console.log('Running environment validation...');

    // 1. Environment Variables Check
    const envVarsResult = validateEnvironmentVariables();
    results.passed.push(...envVarsResult.passed);
    results.warnings.push(...envVarsResult.warnings);
    results.errors.push(...envVarsResult.errors);

    // 2. Database Connection Check
    const dbResult = await validateDatabaseConnection();
    results.passed.push(...dbResult.passed);
    results.warnings.push(...dbResult.warnings);
    results.errors.push(...dbResult.errors);

    // 3. File System Check
    const fsResult = validateFileSystem();
    results.passed.push(...fsResult.passed);
    results.warnings.push(...fsResult.warnings);
    results.errors.push(...fsResult.errors);

    // 4. Node Modules Check
    const modulesResult = await validateNodeModules();
    results.passed.push(...modulesResult.passed);
    results.warnings.push(...modulesResult.warnings);
    results.errors.push(...modulesResult.errors);

    // 5. Port Availability Check
    const portsResult = await validatePorts();
    results.passed.push(...portsResult.passed);
    results.warnings.push(...portsResult.warnings);
    results.errors.push(...portsResult.errors);

    // 6. API Connectivity Check
    const apiResult = await validateAPIConnectivity();
    results.passed.push(...apiResult.passed);
    results.warnings.push(...apiResult.warnings);
    results.errors.push(...apiResult.errors);

    // 7. Production-specific checks
    if (process.env.NODE_ENV === 'production') {
      const prodResult = validateProductionConfig();
      results.passed.push(...prodResult.passed);
      results.warnings.push(...prodResult.warnings);
      results.errors.push(...prodResult.errors);
    }

    // Calculate summary
    results.summary = {
      totalChecks: results.passed.length + results.warnings.length + results.errors.length,
      passedChecks: results.passed.length,
      warningCount: results.warnings.length,
      errorCount: results.errors.length,
      overallStatus: results.errors.length === 0
        ? (results.warnings.length === 0 ? 'healthy' : 'warning')
        : 'error'
    };

    // Save validation results
    await saveValidationResults(userId, validationId, results);

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Send email notification
    await sendAdminNotifications('environment_validation', 'validate', 'completed', duration, {
      passed_checks: results.summary.passedChecks,
      warning_count: results.summary.warningCount,
      error_count: results.summary.errorCount,
      overall_status: results.summary.overallStatus,
      environment: results.environment
    });

    await logAudit(
      userId,
      'VALIDATE_ENVIRONMENT',
      'ENVIRONMENT',
      String(validationId),
      { overallStatus: results.summary.overallStatus },
      req
    );

    res.json({
      success: true,
      message: MESSAGES.VALIDATION_COMPLETED,
      data: results
    });

  } catch (error) {
    console.error('Environment validation error:', error);

    // Send failure email notification
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    await sendAdminNotifications('environment_validation', 'validate', 'failed', duration, {}, error.message);

    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_VALIDATE,
      error: error.message
    });
  }
};

/**
 * @route   GET /api/dev-tools/env/history
 * @desc    Get validation history
 * @access  Private
 */
const getValidationHistory = async (req, res) => {
  try {
    const validations = await fetchValidationHistory();

    res.json({
      success: true,
      data: validations
    });

  } catch (error) {
    console.error('Get validation history error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_GET_HISTORY,
      error: error.message
    });
  }
};

/**
 * @route   GET /api/dev-tools/env/:validationId
 * @desc    Get validation details
 * @access  Private
 */
const getValidationDetails = async (req, res) => {
  const { validationId } = req.params;

  try {
    const validation = await fetchValidationById(validationId);

    if (!validation) {
      return res.status(404).json({
        success: false,
        message: ERRORS.VALIDATION_NOT_FOUND
      });
    }

    const results = JSON.parse(validation.results);

    // Merge database fields with results for frontend compatibility
    const combinedData = {
      ...results,
      id: validation.id,
      dbEnvironment: validation.environment,
      dbOverallStatus: validation.overall_status,
      dbPassedChecks: validation.passed_checks,
      dbWarningCount: validation.warning_count,
      dbErrorCount: validation.error_count,
      createdBy: validation.created_by,
      createdAt: validation.created_at
    };

    res.json({
      success: true,
      data: combinedData
    });

  } catch (error) {
    console.error('Get validation details error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_GET_DETAILS,
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/dev-tools/env/:validationId
 * @desc    Delete validation
 * @access  Private
 */
const deleteValidation = async (req, res) => {
  const { validationId } = req.params;

  try {
    const result = await deleteValidationById(validationId);

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: ERRORS.VALIDATION_NOT_FOUND
      });
    }

    await logAudit(
      req.user.id,
      'DELETE_VALIDATION',
      'ENVIRONMENT',
      validationId,
      {},
      req
    );

    res.json({
      success: true,
      message: MESSAGES.VALIDATION_DELETED
    });

  } catch (error) {
    console.error('Delete validation error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_DELETE,
      error: error.message
    });
  }
};

module.exports = {
  validateEnvironment,
  getValidationHistory,
  getValidationDetails,
  deleteValidation
};
