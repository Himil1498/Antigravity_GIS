/**
 * Build API map connecting frontend to backend
 */
const buildAPIMap = (routes, services, controllers) => {
  const apiMap = new Map();

  // Match frontend service calls to backend routes
  services.forEach((apiCalls, serviceFile) => {
    apiCalls.forEach(call => {
      // Find matching backend route
      const matchingRoute = routes.find(route => {
        // Normalize paths for comparison
        const routePath = route.path.replace(/:\w+/g, '[param]');
        const callPath = call.path.replace(/\$\{[^}]+\}/g, '[param]').replace(/\d+/g, '[param]');

        return route.method === call.method &&
               (routePath === callPath || route.path.includes(call.path) || call.path.includes(route.path));
      });

      if (matchingRoute) {
        const key = `${matchingRoute.method} ${matchingRoute.path}`;

        if (!apiMap.has(key)) {
          apiMap.set(key, {
            backend: matchingRoute,
            frontend: [],
            controllerData: null
          });
        }

        apiMap.get(key).frontend.push({
          service: serviceFile,
          ...call
        });

        // Add controller data if available
        const controllerFile = matchingRoute.handler.split('.')[0] + 'Controller.js';
        const controllerMethods = controllers.get(controllerFile);
        if (controllerMethods) {
          const methodName = matchingRoute.handler.split('.')[1];
          const method = controllerMethods.find(m => m.name === methodName);
          if (method) {
            apiMap.get(key).controllerData = method;
          }
        }
      }
    });
  });

  return apiMap;
};

/**
 * Generate analysis report
 */
const generateReport = (apiMap, routes, services, duration) => {
  const endpoints = Array.from(apiMap.entries()).map(([key, data]) => {
    const [method, path] = key.split(' ', 2);

    return {
      method,
      path,
      handler: data.backend.handler,
      permission: data.backend.permission,
      requiresAuth: data.backend.requiresAuth,
      backendFile: data.backend.file,
      frontendServices: data.frontend.map(f => f.service),
      usageCount: data.frontend.length,
      requestData: data.controllerData?.requestData || [],
      responseData: data.controllerData?.responseData || { data: [], statusCodes: [] },
      databaseQueries: data.controllerData?.databaseQueries || [],
      validations: data.controllerData?.validations || []
    };
  });

  // Calculate statistics
  const totalEndpoints = endpoints.length;
  const totalBackendRoutes = routes.length;
  const totalFrontendCalls = Array.from(services.values()).reduce((sum, calls) => sum + calls.length, 0);
  const authRequired = endpoints.filter(e => e.requiresAuth).length;
  const withPermissions = endpoints.filter(e => e.permission).length;

  // Group by HTTP method
  const byMethod = {};
  endpoints.forEach(e => {
    byMethod[e.method] = (byMethod[e.method] || 0) + 1;
  });

  // Most used endpoints
  const mostUsed = [...endpoints]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 20);

  // Unused backend routes
  const usedPaths = new Set(endpoints.map(e => e.path));
  const unusedRoutes = routes.filter(r => !usedPaths.has(r.path));

  return {
    summary: {
      totalEndpoints,
      totalBackendRoutes,
      totalFrontendCalls,
      mappedEndpoints: endpoints.length,
      unmappedRoutes: unusedRoutes.length,
      authRequired,
      withPermissions,
      byMethod,
      analysisDuration: `${duration}ms`
    },
    endpoints: endpoints.sort((a, b) => a.path.localeCompare(b.path)),
    mostUsedEndpoints: mostUsed,
    unusedRoutes: unusedRoutes.slice(0, 20),
    serviceFiles: Array.from(services.keys()),
    routeFiles: [...new Set(routes.map(r => r.file))]
  };
};

module.exports = {
  buildAPIMap,
  generateReport
};
