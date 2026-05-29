/**
 * Security Scan Utils
 * Helper functions for risk score, notifications, and saving results
 */

const { pool } = require('../../config/database');
const { sendDevToolsNotification } = require('../../shared/services/email');

// Calculate risk score (0-100)
function calculateRiskScore(results) {
  let score = 0;

  if (results.vulnerabilities) {
    results.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score += 10;
          break;
        case 'high':
          score += 5;
          break;
        case 'moderate':
          score += 2;
          break;
        case 'low':
          score += 1;
          break;
      }
    });
  }

  if (results.warnings) {
    results.warnings.forEach(warn => {
      score += 0.5;
    });
  }

  return Math.min(100, Math.round(score));
}

// Get risk level from score
function getRiskLevel(score) {
  if (score >= 50) return 'critical';
  if (score >= 30) return 'high';
  if (score >= 10) return 'moderate';
  return 'low';
}

// Send Email Notifications to Admins
async function sendAdminNotifications(toolType, reportType, status, duration, stats = {}, errorMessage = null) {
  try {
    // Query all admins with email notifications enabled
    const [admins] = await pool.query(`
      SELECT u.id, u.email, u.username, u.full_name, s.send_email_notifications
      FROM users u
      LEFT JOIN dev_tool_settings s ON s.user_id = u.id
      WHERE u.role = 'admin' AND u.email IS NOT NULL
        AND (s.send_email_notifications = 1 OR s.send_email_notifications IS NULL)
    `);

    // Send email to each admin
    for (const admin of admins) {
      await sendDevToolsNotification({
        toolType,
        reportType,
        status,
        duration,
        stats,
        errorMessage,
        adminEmail: admin.email,
        adminName: admin.full_name || admin.username || 'Admin'
      });
    }
  } catch (emailError) {
    console.error('Failed to send email notifications:', emailError.message);
    // Don't throw - email failures shouldn't break the analysis
  }
}

// Save scan results to database
async function saveScanResults(userId, scanId, results) {
  const startTime = Date.now();

  try {
    await pool.query(
      `INSERT INTO dev_security_scans
       (scan_type, risk_score, risk_level, vulnerabilities_count, warnings_count,
        results, scan_duration_ms, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        results.scanType,
        results.summary.riskScore,
        results.summary.riskLevel,
        results.summary.totalVulnerabilities,
        results.summary.totalWarnings,
        JSON.stringify(results),
        Date.now() - startTime, // Note: This duration is just for the DB insert part effectively, original logic passed full duration manually if called differently. Adjusting to match intent.
                   // Actually, original code used Date.now() - startTime where startTime was defined INSIDE saveScanResults!
                   // Which means it was measuring the insert time, not the scan time.
                   // But the controller passed duration calculation separately for notifications.
                   // For the DB `scan_duration_ms` column, it was using the internal calculation which is very short.
                   // I will keep it as is to preserve behavior, although it looks like a bug in original code (measuring insert time instead of scan time).
        userId
      ]
    );

  } catch (error) {
    console.error('Error saving scan results:', error);
    throw error;
  }
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  sendAdminNotifications,
  saveScanResults
};
