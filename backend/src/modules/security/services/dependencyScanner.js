/**
 * Dependency Scanner
 * Scans NPM dependencies for vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function scanDependencies() {
  const results = {
    vulnerabilities: [],
    warnings: [],
    summary: {
      total: 0,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0
    }
  };

  try {
    // Check both Frontend and Backend
    const dirs = ['Frontend', 'Backend'];

    for (const dir of dirs) {
      const packagePath = path.join(process.cwd(), '..', dir, 'package.json');

      if (!fs.existsSync(packagePath)) continue;

      try {
        // Run npm audit --json
        const { stdout } = await execPromise(`cd ..\\${dir} && npm audit --json`, {
          timeout: 30000
        });

        const auditData = JSON.parse(stdout);

        // Parse npm audit results
        if (auditData.vulnerabilities) {
          Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
            const severity = vuln.severity;
            results.summary.total++;
            results.summary[severity]++;

            const vulnData = {
              type: 'dependency',
              severity: severity,
              package: pkg,
              currentVersion: vuln.range || 'unknown',
              vulnerableVersions: vuln.via?.map(v => v.range).join(', ') || '',
              recommendation: vuln.fixAvailable ? `Update to ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}` : 'No fix available',
              location: `${dir}/package.json`,
              cwe: vuln.via?.[0]?.cwe || [],
              cvss: vuln.via?.[0]?.cvss || null
            };

            if (severity === 'critical' || severity === 'high') {
              results.vulnerabilities.push(vulnData);
            } else {
              results.warnings.push(vulnData);
            }
          });
        }

      } catch (auditError) {
        // npm audit returns non-zero exit code if vulnerabilities found
        if (auditError.stdout) {
          try {
            const auditData = JSON.parse(auditError.stdout);
            // Process as above - reusing logic would be better but keeping simple copy for now or abstracting?
            // Let's copy the logic block to avoid complexity in this file for now, 
            // or better, extract parsing logic.
            if (auditData.vulnerabilities) {
               Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
                const severity = vuln.severity;
                results.summary.total++;
                results.summary[severity]++;
    
                const vulnData = {
                  type: 'dependency',
                  severity: severity,
                  package: pkg,
                  currentVersion: vuln.range || 'unknown',
                  vulnerableVersions: vuln.via?.map(v => v.range).join(', ') || '',
                  recommendation: vuln.fixAvailable ? `Update to ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}` : 'No fix available',
                  location: `${dir}/package.json`,
                  cwe: vuln.via?.[0]?.cwe || [],
                  cvss: vuln.via?.[0]?.cvss || null
                };
    
                if (severity === 'critical' || severity === 'high') {
                  results.vulnerabilities.push(vulnData);
                } else {
                  results.warnings.push(vulnData);
                }
              });
            }
          } catch (parseError) {
            console.error(`Failed to parse npm audit for ${dir}:`, parseError.message);
          }
        }
      }
    }

  } catch (error) {
    console.error('Dependency scan error:', error);
    results.warnings.push({
      type: 'scan_error',
      severity: 'moderate',
      message: 'Failed to complete dependency scan',
      details: error.message
    });
  }

  return results;
}

module.exports = { scanDependencies };
