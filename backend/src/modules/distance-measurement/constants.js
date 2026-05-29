/**
 * Distance Measurement Constants
 */

const ERRORS = {
    MEASUREMENT_NOT_FOUND: 'Measurement not found',
    POINTS_DISTANCE_REQUIRED: 'Points and distance required',
    NO_FIELDS_TO_UPDATE: 'No fields to update',
    FAILED_TO_GET: 'Failed to get measurements',
    FAILED_TO_GET_MEASUREMENT: 'Failed to get measurement',
    FAILED_TO_CREATE: 'Failed to create measurement',
    FAILED_TO_UPDATE: 'Failed to update measurement',
    FAILED_TO_DELETE: 'Failed to delete measurement'
};

const MESSAGES = {
    MEASUREMENT_UPDATED: 'Measurement updated successfully',
    MEASUREMENT_DELETED: 'Measurement deleted successfully'
};

const DEFAULTS = {
    UNIT: 'meters'
};

module.exports = {
    ERRORS,
    MESSAGES,
    DEFAULTS
};
