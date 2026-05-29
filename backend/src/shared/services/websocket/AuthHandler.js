const jwt = require('jsonwebtoken');
const { ERRORS, ERROR_MESSAGES } = require('./constants');

/**
 * Verify WebSocket connection request
 * @param {http.IncomingMessage} req 
 * @returns {Object} { userId, username, error, code }
 */
const verifyConnection = (req) => {
  // Extract token from query parameters
  // Note: req.url is just the path + query (e.g., /ws?token=...)
  // We need a base URL to use the URL constructor, but it doesn't matter what it is as we only want params
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `${protocol}://${host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    return {
      error: ERROR_MESSAGES.AUTH_REQUIRED,
      code: ERRORS.AUTH_REQUIRED
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      userId: decoded.id,
      username: decoded.username,
      isValid: true
    };
  } catch (error) {
    return {
      error: ERROR_MESSAGES.INVALID_TOKEN + ': ' + error.message,
      code: ERRORS.INVALID_TOKEN
    };
  }
};

module.exports = {
  verifyConnection
};
