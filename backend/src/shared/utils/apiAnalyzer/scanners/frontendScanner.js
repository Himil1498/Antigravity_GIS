const fs = require('fs');
const path = require('path');

/**
 * Scan frontend service files to extract API calls
 */
const scanFrontendServices = (frontendPath) => {
  const servicesDir = path.join(frontendPath, 'src', 'services');
  if (!fs.existsSync(servicesDir)) {
    console.warn('Services directory not found:', servicesDir);
    return new Map();
  }

  const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const servicesMap = new Map();

  for (const file of files) {
    const filePath = path.join(servicesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract API calls from service
    const apiCalls = extractFrontendAPICalls(content, file);
    servicesMap.set(file, apiCalls);
  }

  return servicesMap;
};

/**
 * Extract API calls from frontend service content
 */
const extractFrontendAPICalls = (content, fileName) => {
  const apiCalls = [];

  // Pattern 1: axios.get('/api/path')
  const axiosPattern = /axios\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = axiosPattern.exec(content)) !== null) {
    apiCalls.push({
      method: match[1].toUpperCase(),
      path: match[2],
      file: fileName,
      type: 'axios'
    });
  }

  // Pattern 2: apiClient.get('/path')
  const apiClientPattern = /apiClient\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = apiClientPattern.exec(content)) !== null) {
    apiCalls.push({
      method: match[1].toUpperCase(),
      path: match[2],
      file: fileName,
      type: 'apiClient'
    });
  }

  return apiCalls;
};

module.exports = {
  scanFrontendServices
};
