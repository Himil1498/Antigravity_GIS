/**
 * Reports Constants
 */

const REPORT_TYPES = {
    REGION_USAGE: 'region-usage',
    USER_ACTIVITY: 'user-activity',
    ACCESS_DENIALS: 'access-denials',
    AUDIT_LOGS: 'audit-logs',
    TEMPORARY_ACCESS: 'temporary-access',
    REGION_REQUESTS: 'region-requests',
    ZONE_ASSIGNMENTS: 'zone-assignments',
    COMPREHENSIVE: 'comprehensive'
};

const EXPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    XLSX: 'xlsx'
};

const DEFAULTS = {
    LIMIT: 100,
    OFFSET: 0,
    FORMAT: 'json'
};

module.exports = {
    REPORT_TYPES,
    EXPORT_FORMATS,
    DEFAULTS
};
