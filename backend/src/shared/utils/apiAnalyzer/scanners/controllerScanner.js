const fs = require('fs');
const path = require('path');

/**
 * Scan backend controller files to analyze methods
 */
const scanBackendControllers = (backendPath) => {
  const controllersDir = path.join(backendPath, 'src', 'controllers');
  if (!fs.existsSync(controllersDir)) {
    console.warn('Controllers directory not found:', controllersDir);
    return new Map();
  }

  const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
  const controllersMap = new Map();

  for (const file of files) {
    const filePath = path.join(controllersDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract controller methods and their logic
    const methods = extractControllerMethods(content, file);
    controllersMap.set(file, methods);
  }

  return controllersMap;
};

/**
 * Extract controller methods and analyze what they do
 */
const extractControllerMethods = (content, fileName) => {
  const methods = [];

  // Pattern: exports.methodName = async (req, res) => { ... }
  const methodPattern = /exports\.([a-zA-Z0-9_]+)\s*=\s*async\s*\([^)]*\)\s*=>\s*{/g;
  let match;

  while ((match = methodPattern.exec(content)) !== null) {
    const methodName = match[1];
    const startPos = match.index;

    // Extract method body (simplified - gets next 1000 chars)
    const methodBody = content.substring(startPos, startPos + 1000);

    methods.push({
      name: methodName,
      file: fileName,
      requestData: analyzeRequestData(methodBody),
      responseData: analyzeResponseData(methodBody),
      databaseQueries: analyzeDatabaseQueries(methodBody),
      validations: analyzeValidations(methodBody)
    });
  }

  return methods;
};

/**
 * Analyze what request data the endpoint expects
 */
const analyzeRequestData = (methodBody) => {
  const requestData = [];

  // req.body
  if (methodBody.includes('req.body')) {
    const bodyPattern = /req\.body\.([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = bodyPattern.exec(methodBody)) !== null) {
      if (!requestData.includes(match[1])) {
        requestData.push(match[1]);
      }
    }
  }

  // req.params
  if (methodBody.includes('req.params')) {
    const paramsPattern = /req\.params\.([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = paramsPattern.exec(methodBody)) !== null) {
      requestData.push(`${match[1]} (param)`);
    }
  }

  // req.query
  if (methodBody.includes('req.query')) {
    const queryPattern = /req\.query\.([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = queryPattern.exec(methodBody)) !== null) {
      requestData.push(`${match[1]} (query)`);
    }
  }

  return requestData.slice(0, 10); // Limit to first 10
};

/**
 * Analyze what response data the endpoint returns
 */
const analyzeResponseData = (methodBody) => {
  const responses = [];

  // res.json({ ... })
  const jsonPattern = /res\.json\s*\(\s*{([^}]+)}/g;
  let match;
  while ((match = jsonPattern.exec(methodBody)) !== null) {
    const keys = match[1]
      .split(',')
      .map(s => s.trim().split(':')[0].trim())
      .filter(k => k && !k.startsWith('//'));
    responses.push(...keys);
  }

  // res.status(200).json(...)
  const statusPattern = /res\.status\s*\(\s*(\d+)\s*\)/g;
  const statusMatches = [...methodBody.matchAll(statusPattern)];
  const statusCodes = statusMatches.map(m => m[1]);

  return {
    data: [...new Set(responses)].slice(0, 10),
    statusCodes: [...new Set(statusCodes)]
  };
};

/**
 * Analyze database queries in the endpoint
 */
const analyzeDatabaseQueries = (methodBody) => {
  const queries = [];

  // db.query or pool.query
  if (methodBody.includes('.query')) {
    const queryPattern = /(SELECT|INSERT|UPDATE|DELETE)\s+/gi;
    const matches = [...methodBody.matchAll(queryPattern)];
    queries.push(...matches.map(m => m[1].toUpperCase()));
  }

  return [...new Set(queries)];
};

/**
 * Analyze validations in the endpoint
 */
const analyzeValidations = (methodBody) => {
  const validations = [];

  if (methodBody.includes('if (!') || methodBody.includes('if(!')) {
    validations.push('Input validation');
  }

  if (methodBody.includes('validate') || methodBody.includes('schema')) {
    validations.push('Schema validation');
  }

  if (methodBody.includes('sanitize')) {
    validations.push('Input sanitization');
  }

  return validations;
};

module.exports = {
  scanBackendControllers
};
