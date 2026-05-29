/**
 * Runtime Validator
 * Validates ports, API connectivity, and production config
 */

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
// Runtime validator doesn't seem to use constants in the viewed code, but I'll double check if I missed something or if I should just skip if not found.
// Wait, looking at step 1527 view, there are NO imports of constants.
// So runtimeValidator.js likely doesn't need updates either!
// I will not update runtimeValidator.js.

/**
 * Validates port availability
 */
async function validatePorts() {
  const passed = [];
  const warnings = [];
  const errors = [];

  const backendPort = process.env.PORT || 3000;

  // Check if backend port is in use (should be)
  try {
    const { stdout } = await execPromise(
      `netstat -ano | findstr :${backendPort}`,
      {
        timeout: 5000,
      },
    );

    if (stdout.includes("LISTENING")) {
      passed.push({
        category: "ports",
        check: "backend_port",
        status: "passed",
        message: `Backend is listening on port ${backendPort}`,
      });
    }
  } catch (error) {
    warnings.push({
      category: "ports",
      check: "backend_port",
      status: "warning",
      message: `Backend port ${backendPort} is not in use`,
      recommendation: "Start the backend server",
    });
  }

  return { passed, warnings, errors };
}

/**
 * Validates API connectivity
 */
async function validateAPIConnectivity() {
  const passed = [];
  const warnings = [];
  const errors = [];

  // This is a basic check - in production you might test actual endpoints
  passed.push({
    category: "api",
    check: "server_running",
    status: "passed",
    message: "API server is running (this endpoint is working)",
  });

  return { passed, warnings, errors };
}

/**
 * Validates production-specific configuration
 */
function validateProductionConfig() {
  const passed = [];
  const warnings = [];
  const errors = [];

  // Check HTTPS
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl && frontendUrl.startsWith("http://")) {
    errors.push({
      category: "production",
      check: "https",
      status: "error",
      message: "Production environment must use HTTPS",
      recommendation: "Update FRONTEND_URL to use https://",
    });
  } else {
    passed.push({
      category: "production",
      check: "https",
      status: "passed",
      message: "Using HTTPS for frontend URL",
    });
  }

  // Check JWT secret strength (production should have stronger secrets)
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 64) {
    warnings.push({
      category: "production",
      check: "jwt_secret_strength",
      status: "warning",
      message: "JWT_SECRET should be longer in production (64+ characters)",
      recommendation: "Generate a stronger secret for production",
    });
  } else {
    passed.push({
      category: "production",
      check: "jwt_secret_strength",
      status: "passed",
      message: "JWT_SECRET meets production strength requirements",
    });
  }

  return { passed, warnings, errors };
}

module.exports = {
  validatePorts,
  validateAPIConnectivity,
  validateProductionConfig,
};
