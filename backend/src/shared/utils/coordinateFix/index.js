/**
 * Coordinate Fix Utilities
 * 
 * Provides functions to identify, report, and suggest fixes for invalid coordinates
 * in the infrastructure database
 */

const { scanInvalidCoordinates } = require('./scanner');
const { generateDeleteScript, generateCSVReport } = require('./generator');
const { analyzeBySource, suggestCorrection, generateFixReport } = require('./analyzer');

module.exports = {
  scanInvalidCoordinates,
  generateDeleteScript,
  generateCSVReport,
  analyzeBySource,
  suggestCorrection,
  generateFixReport
};
