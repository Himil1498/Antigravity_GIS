/**
 * API Performance Analyzer - Orchestrator
 * Analyzes API endpoints and their usage by scanning paths
 */

const { scanBackendRoutes } = require('./scanners/routeScanner');
const { scanBackendControllers } = require('./scanners/controllerScanner');
const { scanFrontendServices } = require('./scanners/frontendScanner');
const { buildAPIMap, generateReport } = require('./reportBuilder');

class APIAnalyzer {
  constructor(backendPath, frontendPath) {
    this.backendPath = backendPath;
    this.frontendPath = frontendPath;
    this.routes = [];
    this.controllers = new Map();
    this.services = new Map();
    this.apiMap = new Map();
  }

  /**
   * Main analysis function
   */
  async analyze() {
    const startTime = Date.now();

    // 1. Scan backend routes
    this.routes = scanBackendRoutes(this.backendPath);

    // 2. Scan backend controllers
    this.controllers = scanBackendControllers(this.backendPath);

    // 3. Scan frontend services
    this.services = scanFrontendServices(this.frontendPath);

    // 4. Build API map (connect frontend to backend)
    this.apiMap = buildAPIMap(this.routes, this.services, this.controllers);

    const duration = Date.now() - startTime;

    return generateReport(this.apiMap, this.routes, this.services, duration);
  }
}

/**
 * Run API analysis
 */
async function analyzeAPIs(backendPath, frontendPath) {
  const analyzer = new APIAnalyzer(backendPath, frontendPath);
  return await analyzer.analyze();
}

module.exports = { analyzeAPIs, APIAnalyzer };
