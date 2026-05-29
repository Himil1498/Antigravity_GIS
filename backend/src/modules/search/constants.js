/**
 * Search Constants
 */

const SEARCH_TYPES = {
    GLOBAL: 'global',
    USER: 'user',
    REGION: 'region',
    FEATURE: 'feature',
    SAVED_DATA: 'saved-data',
    ADDRESS: 'address',
    COORDINATES: 'coordinates'
};

const DEFAULTS = {
    LIMIT: 20,
    OFFSET: 0,
    RECENT_LIMIT: 10
};

module.exports = {
    SEARCH_TYPES,
    DEFAULTS
};
