/**
 * Environment Validator Constants
 */

const ERRORS = {
  VALIDATION_NOT_FOUND: "Validation not found",
  FAILED_TO_VALIDATE: "Failed to validate environment",
  FAILED_TO_GET_HISTORY: "Failed to retrieve validation history",
  FAILED_TO_GET_DETAILS: "Failed to retrieve validation details",
  FAILED_TO_DELETE: "Failed to delete validation",
};

const MESSAGES = {
  VALIDATION_COMPLETED: "Environment validation completed",
  VALIDATION_DELETED: "Validation deleted successfully",
};

const REQUIRED_ENV_VARS = [
  { name: "DB_HOST", description: "Database host" },
  { name: "DB_USER", description: "Database user" },
  { name: "DB_PASSWORD", description: "Database password" },
  { name: "DB_NAME", description: "Database name" },
  { name: "DB_PORT", description: "Database port" },
  { name: "JWT_SECRET", description: "JWT secret key" },
  { name: "PORT", description: "Server port" },
  { name: "NODE_ENV", description: "Node environment" },
  { name: "FRONTEND_URL", description: "Frontend URL" },
];

const OPTIONAL_ENV_VARS = [
  { name: "EMAIL_HOST", description: "Email server host" },
  { name: "EMAIL_USER", description: "Email user" },
  { name: "EMAIL_PASSWORD", description: "Email password" },
];

const CRITICAL_TABLES = [
  "users",
  "regions",
  "infrastructure_items",
  "boundary_versions",
  "groups",
  "permissions",
];

const CRITICAL_PACKAGES = ["express", "pg", "jsonwebtoken", "bcryptjs", "ws"];

const INSECURE_DEFAULTS = [
  "your-secret-key",
  "secret",
  "password",
  "123456",
  "admin",
];

module.exports = {
  ERRORS,
  MESSAGES,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
  CRITICAL_TABLES,
  CRITICAL_PACKAGES,
  INSECURE_DEFAULTS,
};
