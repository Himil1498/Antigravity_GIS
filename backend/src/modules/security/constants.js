/**
 * Security Scan Constants
 */

const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low'
};

const SCAN_TYPES = {
  FULL: 'full',
  DEPENDENCIES: 'dependencies',
  CODE: 'code',
  CONFIG: 'config'
};

const ERRORS = {
  SCAN_FAILED: 'Failed to run security scan',
  HISTORY_FAILED: 'Failed to retrieve scan history',
  DETAILS_FAILED: 'Failed to retrieve scan details',
  DELETE_FAILED: 'Failed to delete scan',
  SCAN_NOT_FOUND: 'Scan not found',
  DEPENDENCY_SCAN_FAILED: 'Failed to complete dependency scan',
  CODE_SCAN_FAILED: 'Failed to complete code security scan'
};

const SECURITY_PATTERNS = [
  {
    name: 'SQL Injection',
    pattern: /query\s*\([^?]*\$\{|query\s*\([^?]*\+\s*['"`]/gi,
    severity: SEVERITY.CRITICAL,
    description: 'Potential SQL injection vulnerability - using string concatenation in queries',
    recommendation: 'Use parameterized queries with ? placeholders'
  },
  {
    name: 'XSS Vulnerability',
    pattern: /dangerouslySetInnerHTML|innerHTML\s*=/gi,
    severity: SEVERITY.HIGH,
    description: 'Potential XSS vulnerability - using dangerouslySetInnerHTML or innerHTML',
    recommendation: 'Use safe React rendering or sanitize HTML with DOMPurify'
  },
  {
    name: 'Hardcoded Secrets',
    pattern: /(password|secret|api[_-]?key|token|jwt[_-]?secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    severity: SEVERITY.CRITICAL,
    description: 'Hardcoded credentials or secrets found in code',
    recommendation: 'Move secrets to environment variables'
  },
  {
    name: 'Weak Crypto',
    pattern: /crypto\.createHash\(['"]md5['"]|crypto\.createHash\(['"]sha1['"]|Math\.random\(\)/gi,
    severity: SEVERITY.HIGH,
    description: 'Weak cryptographic function usage',
    recommendation: 'Use SHA-256 or stronger, avoid Math.random() for security'
  },
  {
    name: 'Command Injection',
    pattern: /exec\([^)]*\$\{|exec\([^)]*\+\s*['"`]|spawn\([^)]*\$\{/gi,
    severity: SEVERITY.CRITICAL,
    description: 'Potential command injection vulnerability',
    recommendation: 'Validate and sanitize all user inputs, use parameterized commands'
  },
  {
    name: 'Path Traversal',
    pattern: /readFile\([^)]*\$\{|readFileSync\([^)]*\$\{|path\.join\([^)]*req\./gi,
    severity: SEVERITY.HIGH,
    description: 'Potential path traversal vulnerability',
    recommendation: 'Validate file paths and use path.resolve with whitelist'
  },
  {
    name: 'Insecure HTTP',
    pattern: /http:\/\/(?!localhost)/gi,
    severity: SEVERITY.MODERATE,
    description: 'Using HTTP instead of HTTPS for external resources',
    recommendation: 'Use HTTPS for all external communications'
  },
  {
    name: 'Console Logging Sensitive Data',
    pattern: /console\.(log|info|debug)\([^)]*password[^)]*\)|console\.(log|info|debug)\([^)]*token[^)]*\)/gi,
    severity: SEVERITY.MODERATE,
    description: 'Logging potentially sensitive information',
    recommendation: 'Remove console.log statements with sensitive data in production'
  }
];

module.exports = {
  SEVERITY,
  SCAN_TYPES,
  ERRORS,
  SECURITY_PATTERNS
};
