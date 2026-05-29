/**
 * Environment Validator Module
 * Barrel export for all environment validator controllers
 */

const envValidatorController = require('./envValidatorController');

// Re-export all controller functions for backward compatibility
module.exports = {
  validateEnvironment: envValidatorController.validateEnvironment,
  getValidationHistory: envValidatorController.getValidationHistory,
  getValidationDetails: envValidatorController.getValidationDetails,
  deleteValidation: envValidatorController.deleteValidation
};
