/**
 * DataHub Query Utils
 */

const { DATA_TYPES } = require('./constants');

/**
 * Validates if the data type is supported
 * @param {string} type - Data type to validate
 * @returns {Object} Validation result { valid: boolean, tableName: string, error: string }
 */
const validateDataType = (type) => {
    const validTypes = Object.values(DATA_TYPES);
    if (!validTypes.includes(type)) {
        return {
            valid: false,
            error: `Invalid data type. Must be one of: ${validTypes.join(', ')}`
        };
    }

    let tableName = '';
    switch (type) {
        case DATA_TYPES.INFRASTRUCTURE: tableName = 'infrastructure_items'; break;
        case DATA_TYPES.MEASUREMENTS: tableName = 'distance_measurements'; break;
        case DATA_TYPES.POLYGONS: tableName = 'polygon_drawings'; break;
        case DATA_TYPES.CIRCLES: tableName = 'circle_drawings'; break;
        case DATA_TYPES.ELEVATIONS: tableName = 'elevation_profiles'; break;
        case DATA_TYPES.SECTORS: tableName = 'sector_rf_data'; break;
        case DATA_TYPES.LAYERS: tableName = 'layer_management'; break;
    }

    return { valid: true, tableName };
};

/**
 * Gets the correct user ID column name for a given data type
 * @param {string} type - Data type
 * @returns {string} Column name ('created_by' or 'user_id')
 */
const getUserIdColumn = (type) => {
    // Sector RF and User Regions use 'user_id', others use 'created_by'
    if (type === DATA_TYPES.SECTORS) {
        return 'user_id';
    }
    return 'created_by';
};

/**
 * Applies table alias to WHERE clause
 */
const applyTableAlias = (condition, alias, userIdCol) => {
    if (!condition) return '';
    return condition.replace(/\b(created_by|user_id)\b/g, `${alias}.${userIdCol}`);
};

/**
 * Transforms distance measurements to include points array
 */
const transformDistanceMeasurements = (measurements) => {
    if (!measurements) return [];
    return measurements.map(m => {
        // If points is already an object/array, use it, otherwise try to parse or construct
        let points = m.points;
        if (typeof points === 'string') {
            try {
                points = JSON.parse(points);
            } catch (e) {
                points = [];
            }
        }
        
        // If no points but start/end lat/lng exist
        if ((!points || points.length === 0) && m.start_lat && m.end_lat) {
             points = [
                { lat: m.start_lat, lng: m.start_lng },
                { lat: m.end_lat, lng: m.end_lng }
            ];
        }

        return {
            ...m,
            points: points || []
        };
    });
};

module.exports = {
    validateDataType,
    getUserIdColumn,
    applyTableAlias,
    transformDistanceMeasurements
};
