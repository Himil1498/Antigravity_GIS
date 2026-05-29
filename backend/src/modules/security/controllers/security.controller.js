/**
 * Scan Controller
 * Main entry point for running security scans
 */

const {
  calculateRiskScore,
  getRiskLevel,
  sendAdminNotifications,
  saveScanResults,
} = require("../utils");
const { logAudit } = require("../../audit/audit.service");
const { scanDependencies } = require("../services/dependencyScanner");
const { scanCodeSecurity } = require("../services/codeScanner");
const { scanConfiguration } = require("../services/configScanner");
const { ERRORS } = require("../constants");

/**
 * Run comprehensive security scan
 */
const runSecurityScan = async (req, res) => {
  const userId = req.user.id;
  const { scanType = "full" } = req.body; // 'dependencies', 'code', 'config', 'full'
  const startTime = Date.now();

  try {
    const scanId = Date.now();
    const results = {
      scanId,
      scanType,
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      warnings: [],
      passed: [],
      summary: {},
    };

    // 1. Dependency Vulnerability Scan (npm audit)
    if (scanType === "dependencies" || scanType === "full") {
      console.log("Running dependency scan...");
      const depResults = await scanDependencies();
      results.vulnerabilities.push(...depResults.vulnerabilities);
      results.warnings.push(...depResults.warnings);
      results.summary.dependencies = depResults.summary;
    }

    // 2. Code Security Scan (SQL Injection, XSS, etc.)
    if (scanType === "code" || scanType === "full") {
      console.log("Running code security scan...");
      const codeResults = await scanCodeSecurity();
      results.vulnerabilities.push(...codeResults.vulnerabilities);
      results.warnings.push(...codeResults.warnings);
      results.passed.push(...codeResults.passed);
      results.summary.code = codeResults.summary;
    }

    // 3. Configuration Security Scan
    if (scanType === "config" || scanType === "full") {
      console.log("Running configuration scan...");
      const configResults = await scanConfiguration();
      results.vulnerabilities.push(...configResults.vulnerabilities);
      results.warnings.push(...configResults.warnings);
      results.passed.push(...configResults.passed);
      results.summary.config = configResults.summary;
    }

    // Calculate overall risk score
    results.summary.totalVulnerabilities = results.vulnerabilities.length;
    results.summary.totalWarnings = results.warnings.length;
    results.summary.riskScore = calculateRiskScore(results);
    results.summary.riskLevel = getRiskLevel(results.summary.riskScore);

    // Save scan results to database
    await saveScanResults(userId, scanId, results);

    try {
      await logAudit(
        userId,
        "Ran security scan",
        "SECURITY_SCAN",
        scanId,
        {
          scanType,
          riskScore: results.summary.riskScore,
          riskLevel: results.summary.riskLevel,
        },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Send email notification
    await sendAdminNotifications(
      "security_scan",
      scanType,
      "completed",
      duration,
      {
        vulnerabilities_count: results.summary.totalVulnerabilities,
        warnings_count: results.summary.totalWarnings,
        risk_level: results.summary.riskLevel,
        risk_score: results.summary.riskScore,
      },
    );

    res.json({
      success: true,
      message: "Security scan completed",
      data: results,
    });
  } catch (error) {
    console.error("Security scan error:", error);

    // Send failure email notification
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    await sendAdminNotifications(
      "security_scan",
      scanType,
      "failed",
      duration,
      {},
      error.message,
    );

    res.status(500).json({
      success: false,
      message: ERRORS.SCAN_FAILED,
      error: error.message,
    });
  }
};

module.exports = { runSecurityScan };
