/**
 * History Controller
 * Handles retrieving and deleting scan history
 */

const { pool } = require('../../../config/database');
const { ERRORS } = require('../constants');

/**
 * Get scan history
 */
const getScanHistory = async (req, res) => {
  try {
    const [scans] = await pool.query(
      `SELECT id, scan_type, risk_score, risk_level,
              vulnerabilities_count, warnings_count,
              scan_duration_ms, created_at, created_by
       FROM dev_security_scans
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      data: scans
    });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.HISTORY_FAILED,
      error: error.message
    });
  }
};

/**
 * Get detailed scan results
 */
const getScanDetails = async (req, res) => {
  const { scanId } = req.params;

  try {
    const [scans] = await pool.query(
      'SELECT * FROM dev_security_scans WHERE id = ?',
      [scanId]
    );

    if (scans.length === 0) {
      return res.status(404).json({
        success: false,
        message: ERRORS.SCAN_NOT_FOUND
      });
    }

    const scan = scans[0];
    const results = JSON.parse(scan.results);

    // Merge database fields with results for frontend compatibility
    const combinedData = {
      ...results,
      id: scan.id,
      dbScanType: scan.scan_type,
      dbRiskScore: scan.risk_score,
      dbRiskLevel: scan.risk_level,
      dbVulnerabilitiesCount: scan.vulnerabilities_count,
      dbWarningsCount: scan.warnings_count,
      scanDurationMs: scan.scan_duration_ms,
      createdBy: scan.created_by,
      createdAt: scan.created_at
    };

    res.json({
      success: true,
      data: combinedData
    });

  } catch (error) {
    console.error('Get scan details error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.DETAILS_FAILED,
      error: error.message
    });
  }
};

/**
 * Delete security scan
 */
const deleteScan = async (req, res) => {
  const { scanId } = req.params;

  try {
    const [scans] = await pool.query(
      'SELECT * FROM dev_security_scans WHERE id = ?',
      [scanId]
    );

    if (scans.length === 0) {
      return res.status(404).json({
        success: false,
        message: ERRORS.SCAN_NOT_FOUND
      });
    }

    await pool.query(
      'DELETE FROM dev_security_scans WHERE id = ?',
      [scanId]
    );

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      message: ERRORS.DELETE_FAILED,
      error: error.message
    });
  }
};

module.exports = {
  getScanHistory,
  getScanDetails,
  deleteScanHistory: deleteScan
};
