/**
 * Sector RF Constants
 */

const ERRORS = {
    GET_SECTORS_FAILED: 'Failed to get sectors',
    SECTOR_NOT_FOUND: 'Sector not found',
    GET_SECTOR_FAILED: 'Failed to get sector',
    MISSING_FIELDS: 'Tower coordinates and azimuth required',
    CREATE_FAILED: 'Failed to create sector',
    NO_UPDATES: 'No fields to update',
    UPDATE_FAILED: 'Failed to update sector',
    DELETE_FAILED: 'Failed to delete sector',
    CALCULATE_FAILED: 'Failed to calculate coverage'
};

const DEFAULTS = {
    BEAMWIDTH: 65,
    RADIUS: 1000,
    FILL_COLOR: '#ff6b6b',
    STROKE_COLOR: '#ff6b6b',
    OPACITY: 0.4
};

module.exports = { ERRORS, DEFAULTS };
