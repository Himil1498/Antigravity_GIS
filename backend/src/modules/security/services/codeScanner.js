/**
 * Code Security Scanner
 * Scans code for security vulnerabilities using patterns
 */

const fs = require('fs');
const path = require('path');
const { SECURITY_PATTERNS } = require('../constants');

// Scan individual file
function scanFile(filePath, baseDir, results, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(baseDir, filePath);

    results.summary.filesScanned++;

    patterns.forEach(pattern => {
      const matches = [];
      let lineNumber = 1;

      lines.forEach(line => {
        if (pattern.pattern.test(line)) {
          matches.push({
            line: lineNumber,
            code: line.trim()
          });
        }
        lineNumber++;
      });

      if (matches.length > 0) {
        results.summary.issuesFound += matches.length;

        if (!results.summary.categories[pattern.name]) {
          results.summary.categories[pattern.name] = 0;
        }
        results.summary.categories[pattern.name] += matches.length;

        const issue = {
          type: 'code_vulnerability',
          severity: pattern.severity,
          category: pattern.name,
          description: pattern.description,
          recommendation: pattern.recommendation,
          file: relativePath,
          matches: matches,
          matchCount: matches.length
        };

        if (pattern.severity === 'critical' || pattern.severity === 'high') {
          results.vulnerabilities.push(issue);
        } else {
          results.warnings.push(issue);
        }
      }
    });

  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

// Recursive directory scanner
async function scanDirectoryRecursive(dir, baseDir, results, patterns) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', 'build', 'dist', '.git', 'coverage'].includes(file)) {
        await scanDirectoryRecursive(filePath, baseDir, results, patterns);
      }
    } else if (stat.isFile()) {
      // Scan code files
      const ext = path.extname(file);
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        scanFile(filePath, baseDir, results, patterns);
      }
    }
  }
}

// Main scan code security function
async function scanCodeSecurity() {
  const results = {
    vulnerabilities: [],
    warnings: [],
    passed: [],
    summary: {
      filesScanned: 0,
      issuesFound: 0,
      categories: {}
    }
  };

  try {
    const scanDirs = [
      path.join(process.cwd(), 'src'),
      path.join(process.cwd(), '..', 'Frontend', 'src')
    ];

    for (const dir of scanDirs) {
      if (!fs.existsSync(dir)) continue;

      await scanDirectoryRecursive(dir, dir, results, SECURITY_PATTERNS);
    }

    // Add passed checks
    SECURITY_PATTERNS.forEach(pattern => {
      if (!results.summary.categories[pattern.name]) {
        results.passed.push({
          check: pattern.name,
          status: 'passed',
          message: `No ${pattern.name} vulnerabilities detected`
        });
      }
    });

  } catch (error) {
    console.error('Code security scan error:', error);
    results.warnings.push({
      type: 'scan_error',
      severity: 'moderate',
      message: 'Failed to complete code security scan',
      details: error.message
    });
  }

  return results;
}

module.exports = { scanCodeSecurity };
