/**
 * Feature Query Service - Basic Operations
 * Database operations for basic CRUD
 */

const { pool } = require('../../../config/database');
const { CACHE_TABLES } = require('../constants');
/**
 * Builds query for getting features with filters
 */
function buildFeatureQuery(userId, region_id, feature_type, search) {
  let query = `
    SELECT DISTINCT f.*,
           u.username as created_by_username,
           r.name as region_name
    FROM gis_features f
    INNER JOIN users u ON f.created_by = u.id
    LEFT JOIN regions r ON f.region_id = r.id
    LEFT JOIN user_regions ur ON r.id = ur.region_id
    WHERE (f.created_by = ? OR ur.user_id = ?)
  `;
  const params = [userId, userId];

  if (region_id) {
    query += ' AND f.region_id = ?';
    params.push(region_id);
  }

  if (feature_type) {
    query += ' AND f.feature_type = ?';
    params.push(feature_type);
  }

  if (search) {
    query += ' AND (f.name LIKE ? OR f.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY f.created_at DESC';

  return { query, params };
}

/**
 * Gets all features with filters
 */
async function getAllFeatures(userId, region_id, feature_type, search) {
  const { query, params } = buildFeatureQuery(userId, region_id, feature_type, search);
  const [features] = await pool.query(query, params);
  return features;
}

/**
 * Gets feature by ID
 */
async function getFeatureById(id, userId) {
  const [features] = await pool.query(
    `SELECT f.*,
            u.username as created_by_username,
            u.full_name as created_by_name,
            r.name as region_name,
            r.code as region_code
     FROM gis_features f
     INNER JOIN users u ON f.created_by = u.id
     LEFT JOIN regions r ON f.region_id = r.id
     LEFT JOIN user_regions ur ON r.id = ur.region_id
     WHERE f.id = ? AND (f.created_by = ? OR ur.user_id = ?)`,
    [id, userId, userId]
  );

  return features.length > 0 ? features[0] : null;
}

/**
 * Creates a new feature
 */
async function createFeature(userId, featureData) {
  const {
    name,
    description,
    feature_type,
    geometry,
    latitude,
    longitude,
    properties,
    region_id,
    tags
  } = featureData;

  const [result] = await pool.query(
    `INSERT INTO gis_features
     (name, description, feature_type, geometry, latitude, longitude,
      properties, region_id, tags, created_by)
     VALUES (?, ?, ?, ST_SetSRID(ST_GeomFromGeoJSON(?::text), 4326), ?, ?, ?, ?, ?, ?) RETURNING id`,
    [
      name,
      description,
      feature_type,
      JSON.stringify(geometry),
      latitude,
      longitude,
      properties ? JSON.stringify(properties) : null,
      region_id,
      tags ? JSON.stringify(tags) : null,
      userId
    ]
  );

  return result[0].id;
}

/**
 * Checks if user owns feature or is admin
 */
async function checkFeatureOwnership(id, userId, userRole) {
  const [features] = await pool.query(
    'SELECT created_by FROM gis_features WHERE id = ?',
    [id]
  );

  if (features.length === 0) {
    return { found: false };
  }

  const isOwner = features[0].created_by === userId;
  const isAdmin = userRole === 'admin';

  return {
    found: true,
    canModify: isOwner || isAdmin,
    createdBy: features[0].created_by
  };
}

/**
 * Updates a feature
 */
async function updateFeature(id, updates) {
  const updateFields = [];
  const params = [];

  if (updates.name) {
    updateFields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.description !== undefined) {
    updateFields.push('description = ?');
    params.push(updates.description);
  }
  if (updates.properties !== undefined) {
    updateFields.push('properties = ?');
    params.push(JSON.stringify(updates.properties));
  }
  if (updates.tags !== undefined) {
    updateFields.push('tags = ?');
    params.push(JSON.stringify(updates.tags));
  }

  if (updateFields.length === 0) {
    return { updated: false, error: 'No fields to update' };
  }

  updateFields.push('updated_at = NOW()');
  params.push(id);

  await pool.query(
    `UPDATE gis_features SET ${updateFields.join(', ')} WHERE id = ?`,
    params
  );

  return { updated: true };
}

/**
 * Deletes a feature
 */
async function deleteFeature(id) {
  await pool.query('DELETE FROM gis_features WHERE id = ?', [id]);
}

module.exports = {
  buildFeatureQuery,
  getAllFeatures,
  getFeatureById,
  createFeature,
  checkFeatureOwnership,
  updateFeature,
  deleteFeature
};
