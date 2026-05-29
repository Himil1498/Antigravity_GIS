/**
 * Security Scan Module
 * Barrel export for security scan controllers
 */

const scanController = require('./scanController');
const historyController = require('./historyController');

module.exports = {
  runSecurityScan: scanController.runSecurityScan,
  getScanHistory: historyController.getScanHistory,
  getScanDetails: historyController.getScanDetails,
  deleteScan: historyController.deleteScan
};
