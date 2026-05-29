/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    code: err.code, // Added to capture PG error codes
    detail: err.detail, // Added to capture PG error details
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  require('fs').appendFileSync('c:/Optimal_Telemedia_Main/OptiConnect_GIS/backend/debug_error.log', JSON.stringify({ message: err.message, code: err.code, stack: err.stack }) + '\\n');

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // PostgreSQL duplicate entry (unique_violation)
  if (err.code === "23505" || err.code === "ER_DUP_ENTRY") {
    statusCode = 400;
    message = "Duplicate entry. This record already exists.";
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503" || err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Referenced record does not exist.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
