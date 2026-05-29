/**
 * Environment Variable Validator
 * Validates environment variables
 */

const { REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS, INSECURE_DEFAULTS } = require('../constants');

/**
 * Validates all environment variables
 */
function validateEnvironmentVariables() {
  const passed = [];
  const warnings = [];
  const errors = [];

  // Check each required variable
  REQUIRED_ENV_VARS.forEach(varInfo => {
    const value = process.env[varInfo.name];

    if (!value) {
      errors.push({
        category: 'environment_variables',
        check: varInfo.name,
        status: 'error',
        message: `Missing required environment variable: ${varInfo.name}`,
        description: varInfo.description,
        recommendation: `Set ${varInfo.name} in .env file`
      });
    } else if (value.trim() === '') {
      errors.push({
        category: 'environment_variables',
        check: varInfo.name,
        status: 'error',
        message: `Empty value for ${varInfo.name}`,
        description: varInfo.description,
        recommendation: `Provide a valid value for ${varInfo.name}`
      });
    } else {
      // Check for default/insecure values
      const isInsecure = INSECURE_DEFAULTS.some(def => value.toLowerCase().includes(def));

      if (varInfo.name.includes('SECRET') || varInfo.name.includes('PASSWORD')) {
        if (isInsecure) {
          warnings.push({
            category: 'environment_variables',
            check: varInfo.name,
            status: 'warning',
            message: `${varInfo.name} appears to use a default/insecure value`,
            recommendation: 'Generate a strong random secret'
          });
        } else {
          passed.push({
            category: 'environment_variables',
            check: varInfo.name,
            status: 'passed',
            message: `${varInfo.name} is properly configured`
          });
        }
      } else {
        passed.push({
          category: 'environment_variables',
          check: varInfo.name,
          status: 'passed',
          message: `${varInfo.name} is set`,
          value: varInfo.name === 'DB_PASSWORD' ? '***' : value
        });
      }
    }
  });

  // Optional but recommended variables
  OPTIONAL_ENV_VARS.forEach(varInfo => {
    const value = process.env[varInfo.name];
    if (!value) {
      warnings.push({
        category: 'environment_variables',
        check: varInfo.name,
        status: 'warning',
        message: `Optional environment variable not set: ${varInfo.name}`,
        description: varInfo.description,
        recommendation: 'Set this variable if email functionality is needed'
      });
    }
  });

  return { passed, warnings, errors };
}

module.exports = {
  validateEnvironmentVariables
};
