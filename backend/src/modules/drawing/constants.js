/**
 * Drawing Constants
 */

const ERRORS = {
    // Polygon
    GET_POLYGONS_FAILED: 'Failed to get polygons',
    POLYGON_NOT_FOUND: 'Polygon not found',
    GET_POLYGON_FAILED: 'Failed to get polygon',
    INVALID_POLYGON_COORDS: 'Valid coordinates array required',
    CREATE_POLYGON_FAILED: 'Failed to create polygon',
    UPDATE_POLYGON_FAILED: 'Failed to update polygon',
    DELETE_POLYGON_FAILED: 'Failed to delete polygon',

    // Circle
    GET_CIRCLES_FAILED: 'Failed to get circles',
    CIRCLE_NOT_FOUND: 'Circle not found',
    GET_CIRCLE_FAILED: 'Failed to get circle',
    INVALID_CIRCLE_PARAMS: 'Center coordinates and radius required',
    CREATE_CIRCLE_FAILED: 'Failed to create circle',
    UPDATE_CIRCLE_FAILED: 'Failed to update circle',
    DELETE_CIRCLE_FAILED: 'Failed to delete circle',

    // Shared
    NO_UPDATES: 'No fields to update',
    ACCESS_DENIED: 'Access denied'
};

const SUCCESS = {
    POLYGON_UPDATED: 'Polygon updated successfully',
    POLYGON_DELETED: 'Polygon deleted successfully',
    CIRCLE_UPDATED: 'Circle updated successfully',
    CIRCLE_DELETED: 'Circle deleted successfully'
};

const DEFAULTS = {
    FILL_COLOR: '#3388ff',
    STROKE_COLOR: '#3388ff',
    OPACITY: 0.5,
    IS_SAVED: false
};

const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
};

module.exports = {
    ERRORS,
    SUCCESS,
    DEFAULTS,
    AUDIT_ACTIONS
};
