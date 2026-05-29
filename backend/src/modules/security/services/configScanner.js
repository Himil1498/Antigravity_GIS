/**
 * Configuration Security Scanner
 * Scans environment and configuration for security issues
 */

function checkJWTSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return {
      passed: false,
      message: 'JWT_SECRET is not set',
      recommendation: 'Set a strong JWT_SECRET in environment variables (min 32 characters)'
    };
  }

  if (jwtSecret.length < 32) {
    return {
      passed: false,
      message: `JWT_SECRET is too short (${jwtSecret.length} characters)`,
      recommendation: 'Use a JWT_SECRET with at least 32 characters'
    };
  }

  if (jwtSecret === 'your-secret-key' || jwtSecret === 'secret') {
    return {
      passed: false,
      message: 'JWT_SECRET is using a default/weak value',
      recommendation: 'Generate a strong random secret key'
    };
  }

  return {
    passed: true,
    message: 'JWT_SECRET is properly configured'
  };
}

function checkDatabasePassword() {
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbPassword) {
    return {
      passed: false,
      message: 'DB_PASSWORD is not set',
      recommendation: 'Set a strong database password'
    };
  }

  // Check password strength
  const hasUpper = /[A-Z]/.test(dbPassword);
  const hasLower = /[a-z]/.test(dbPassword);
  const hasNumber = /[0-9]/.test(dbPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(dbPassword);
  const isLongEnough = dbPassword.length >= 8;

  const strengthChecks = [hasUpper, hasLower, hasNumber, hasSpecial, isLongEnough];
  const strengthScore = strengthChecks.filter(Boolean).length;

  if (strengthScore < 4) {
    return {
      passed: false,
      message: `Weak database password (strength: ${strengthScore}/5)`,
      recommendation: 'Use a password with uppercase, lowercase, numbers, special characters, and min 8 characters'
    };
  }

  return {
    passed: true,
    message: 'Database password meets strength requirements'
  };
}

function checkCORSConfig() {
  // This is a simplified check - in real implementation, check actual CORS middleware config
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    return {
      passed: false,
      message: 'FRONTEND_URL not configured for CORS',
      recommendation: 'Set FRONTEND_URL in environment variables'
    };
  }

  if (frontendUrl === '*') {
    return {
      passed: false,
      message: 'CORS is configured to allow all origins',
      recommendation: 'Restrict CORS to specific domains'
    };
  }

  return {
    passed: true,
    message: 'CORS configuration is properly restricted'
  };
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET', 'PORT', 'NODE_ENV'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
      recommendation: 'Set all required environment variables in .env file'
    };
  }

  return {
    passed: true,
    message: 'All required environment variables are set'
  };
}

function checkSSLConfig() {
  const nodeEnv = process.env.NODE_ENV;
  const frontendUrl = process.env.FRONTEND_URL;

  if (nodeEnv === 'production' && frontendUrl && frontendUrl.startsWith('http://')) {
    return {
      passed: false,
      message: 'Production environment is using HTTP instead of HTTPS',
      recommendation: 'Use HTTPS in production for secure communication'
    };
  }

  return {
    passed: true,
    message: 'SSL/TLS configuration is appropriate for environment'
  };
}

async function scanConfiguration() {
  const results = {
    vulnerabilities: [],
    warnings: [],
    passed: [],
    summary: {
      checksPerformed: 0,
      issuesFound: 0
    }
  };

  const checks = [
    {
      name: 'JWT Secret Strength',
      check: checkJWTSecret,
      severity: 'critical'
    },
    {
      name: 'Database Password Strength',
      check: checkDatabasePassword,
      severity: 'high'
    },
    {
      name: 'CORS Configuration',
      check: checkCORSConfig,
      severity: 'moderate'
    },
    {
      name: 'Environment Variables',
      check: checkEnvironmentVariables,
      severity: 'moderate'
    },
    {
      name: 'SSL/TLS Configuration',
      check: checkSSLConfig,
      severity: 'high'
    }
  ];

  for (const checkItem of checks) {
    results.summary.checksPerformed++;
    try {
      // Checks are synchronous but using await for consistency if any become async
      const result = await checkItem.check();

      if (result.passed) {
        results.passed.push({
          check: checkItem.name,
          status: 'passed',
          message: result.message
        });
      } else {
        results.summary.issuesFound++;
        const issue = {
          type: 'configuration',
          severity: checkItem.severity,
          check: checkItem.name,
          description: result.message,
          recommendation: result.recommendation
        };

        if (checkItem.severity === 'critical' || checkItem.severity === 'high') {
          results.vulnerabilities.push(issue);
        } else {
          results.warnings.push(issue);
        }
      }
    } catch (error) {
      console.error(`Error in check ${checkItem.name}:`, error.message);
    }
  }

  return results;
}

module.exports = { scanConfiguration };
