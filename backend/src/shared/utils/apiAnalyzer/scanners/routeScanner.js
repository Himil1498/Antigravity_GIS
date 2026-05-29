const fs = require('fs');
const path = require('path');

/**
 * Scan backend route files to extract endpoints
 */
const scanBackendRoutes = (backendPath) => {
  const routesDir = path.join(backendPath, 'src', 'routes');
  if (!fs.existsSync(routesDir)) {
    console.warn('Routes directory not found:', routesDir);
    return [];
  }

  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  const allEndpoints = [];

  for (const file of files) {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract route definitions
    const endpoints = extractEndpoints(content, file);
    allEndpoints.push(...endpoints);
  }

  return allEndpoints;
};

/**
 * Extract API endpoints from route file content
 */
const extractEndpoints = (content, fileName) => {
  const endpoints = [];
  const lines = content.split('\n');

  lines.forEach((line, lineNumber) => {
    // Match: router.get('/path', middleware, controller.method)
    const routePattern = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:.*?,)?\s*([a-zA-Z0-9_.]+)\s*\)/;
    const match = routePattern.exec(line);

    if (match) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const handler = match[3];

      // Extract middleware (checkPermission, authenticate, etc.)
      const middlewareMatch = /checkPermission\(['"`]([^'"`]+)['"`]\)/.exec(line);
      const permission = middlewareMatch ? middlewareMatch[1] : null;

      const authenticateMatch = /authenticate/.test(line);

      endpoints.push({
        method,
        path,
        handler,
        permission,
        requiresAuth: authenticateMatch,
        file: fileName,
        line: lineNumber + 1
      });
    }
  });

  return endpoints;
};

module.exports = {
  scanBackendRoutes
};
