/**
 * Global Audit Middleware
 * Hooks into the Express response cycle to securely track successes and failures
 * comprehensively across all API routes, without blocking the response.
 */
const { logAudit } = require('../modules/audit/audit.service');

// Fields to mask to protect sensitive user data
const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'token', 'secret', 'access_token', 'refreshToken'];

const maskSensitiveData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const maskedData = { ...data };
  for (const key of Object.keys(maskedData)) {
    if (SENSITIVE_FIELDS.includes(key) || key.toLowerCase().includes('password')) {
      maskedData[key] = '***MASKED***';
    } else if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
      maskedData[key] = maskSensitiveData(maskedData[key]);
    }
  }
  return maskedData;
};

const auditInterceptor = (req, res, next) => {
  // Ignore preflight options and standard reads (GET) to minimize database load
  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return next();
  }

  // Hook into the finish event so we don't block the request lifecycle
  res.on('finish', () => {
    // Only process if the route is part of our API logic
    if (!req.originalUrl.startsWith('/api/')) return;
    
    // Ignore standard auth endpoints to prevent duplicate missing-user logs 
    // since auth.controller already comprehensively handles LOGIN and LOGOUT
    if (req.originalUrl.startsWith('/api/auth')) return;

    // Ignore audit endpoints — logging audit log creation is self-referential noise
    if (req.originalUrl.startsWith('/api/audit')) return;

    // IMPORTANT: If a specific controller manually logged a granular audit event
    // for this request (e.g. FILE_UPLOADED), skip this generic interceptor log
    // so we don't spam the database with generic POST logs.
    if (req._auditLogged) return;

    setImmediate(async () => {
      try {
        const userId = req.user?.id || req.body?.userId || null;
        const sessionId = req.headers['x-session-id'] || null; // Or extracted from JWT if available
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        // Determine outcome status based on HTTP response code
        let status = 'SUCCESS';
        if (res.statusCode >= 500) status = 'ERROR';
        else if (res.statusCode === 401 || res.statusCode === 403) status = 'UNAUTHORIZED';
        else if (res.statusCode >= 400) status = 'FAILURE';

        // Extract and mask payload
        let details = {};
        if (Object.keys(req.body).length > 0) details.body = maskSensitiveData(req.body);
        if (Object.keys(req.query).length > 0) details.query = maskSensitiveData(req.query);
        if (Object.keys(req.params).length > 0) details.params = maskSensitiveData(req.params);

        const action = `${req.method}_${req.originalUrl.split('/')[2]?.toUpperCase() || 'ROOT'}`;
        const resourceType = req.originalUrl.split('/')[2]?.toUpperCase() || 'SYSTEM';

        // Utilize the upgraded logAudit method
        await logAudit(
          userId,
          action,
          resourceType,
          userId || 'system',
          details,
          { ip: ipAddress, headers: { 'user-agent': userAgent, 'x-session-id': sessionId }, status }
        );
      } catch (err) {
        console.error('Audit Interceptor Error [Non-blocking]:', err);
      }
    });
  });

  next();
};

module.exports = auditInterceptor;
