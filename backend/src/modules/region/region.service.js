const { pool } = require('../../config/database');
const { hasPermission } = require('../../shared/middleware/checkPermission');

/**
 * Get all regions with filters
 * @param {string} type - Region type filter
 * @param {number} parentId - Parent region ID filter
 * @param {number} userId - Current user ID
 * @param {string} userRole - Current user role
 * @returns {Promise<Array>} Array of regions
 */
const getAllRegions = async (type, parentId, userId, userRole) => {
  let query = `
    SELECT 
      r.id, 
      r.name, 
      r.code, 
      r.type, 
      r.parent_id as "parentId", 
      r.is_active as "isActive", 
      r.created_at as "createdAt", 
      r.updated_at as "updatedAt",
      EXISTS (
        SELECT 1 FROM boundary_versions bv 
        WHERE bv.region_id = r.id AND bv.status = 'published'
      ) as "hasBoundary"
    FROM regions r
  `;

  const params = [];

  // Admin or Manager see all regions
  const hasAdminView = 
    ['admin', 'manager'].includes((userRole || '').toLowerCase()) || 
    (await hasPermission(userId, 'admin:region_boundaries')); // Also allow granular permission

  if (!hasAdminView) {
    query += ` WHERE r.id IN (SELECT region_id FROM user_regions WHERE user_id = ?)`;
    params.push(userId);
  } else {
    query += ' WHERE 1=1';
  }

  // Type filter
  if (type) {
    query += ' AND r.type = ?';
    params.push(type);
  }

  // Parent filter
  if (parentId) {
    query += ' AND r.parent_id = ?';
    params.push(parentId);
  }

  query += ' ORDER BY r.name';

  const [regions] = await pool.query(query, params);
  return regions;
};

/**
 * Get region by ID
 * @param {number} id - Region ID
 * @returns {Promise<Object|null>} Region object or null
 */
const getRegionById = async (id) => {
  const [regions] = await pool.query(
    `SELECT 
       id, 
       name, 
       code, 
       type, 
       parent_id as "parentId", 
       is_active as "isActive", 
       created_at as "createdAt", 
       updated_at as "updatedAt"
     FROM regions WHERE id = ?`,
    [id]
  );
  return regions.length > 0 ? regions[0] : null;
};

/**
 * Get child regions
 * @param {number} parentId - Parent Region ID
 * @returns {Promise<Array>} Array of child regions
 */
const getChildRegions = async (parentId) => {
  const [regions] = await pool.query(
    `SELECT 
       id, 
       name, 
       code, 
       type, 
       parent_id as "parentId", 
       is_active as "isActive", 
       created_at as "createdAt", 
       updated_at as "updatedAt"
     FROM regions 
     WHERE parent_region_id = ? AND is_active::boolean = true 
     ORDER BY name`,
    [parentId]
  );
  return regions;
};

/**
 * Get region hierarchy tree
 * @param {number} userId - Current user ID
 * @param {string} userRole - Current user role
 * @returns {Promise<Array>} Hierarchy tree
 */
const getRegionHierarchy = async (userId, userRole) => {
  let query = `
    SELECT 
      id, 
      name, 
      code, 
      type, 
      parent_id as "parentId", 
      is_active as "isActive", 
      created_at as "createdAt", 
      updated_at as "updatedAt"
    FROM regions 
    WHERE is_active::boolean = true
  `;
  const params = [];

  // Non-admin users see only their regions unless they have specific permission
  const hasFullAccess = userRole === 'admin' || (await hasPermission(userId, 'admin:region_boundaries'));

  if (!hasFullAccess) {
    query = `
      SELECT 
        id, 
        name, 
        code, 
        type, 
        parent_id as "parentId", 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM regions
      WHERE is_active::boolean = true AND id IN (SELECT region_id FROM user_regions WHERE user_id = ?)
    `;
    params.push(userId);
  }

  const [regions] = await pool.query(query, params);

  // Build hierarchy tree
  const buildTree = (parentId = null) => {
    return regions
      .filter(r => r.parent_id === parentId)
      .map(r => ({
        ...r,
        children: buildTree(r.id)
      }));
  };

  return buildTree();
};

/**
 * Get users in region
 * @param {number} regionId - Region ID
 * @returns {Promise<Array>} List of users
 */
const getRegionUsers = async (regionId) => {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, ur.access_level
       FROM users u
       INNER JOIN user_regions ur ON u.id = ur.user_id
       WHERE ur.region_id = ? AND u.is_active::boolean = true`,
      [regionId]
    );
    return users;
};

/**
 * Create region
 * @param {Object} data - Region data
 * @returns {Promise<Object>} Created region object
 */
const createRegion = async (data) => {
  const { name, code, type, parentRegionId, latitude, longitude, description } = data;

  const [rows] = await pool.query(
    `INSERT INTO regions (name, code, type, parent_id, latitude, longitude, description)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    [name, code, type, parentRegionId, latitude, longitude, description]
  );

  return {
    id: rows[0].id,
    name,
    code,
    type
  };
};

/**
 * Update region
 * @param {number} id - Region ID
 * @param {Object} data - Update data
 * @returns {Promise<boolean>} True if updated
 */
const updateRegion = async (id, data) => {
  const { name, description, latitude, longitude } = data;
  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (description) {
    updates.push('description = ?');
    params.push(description);
  }
  if (latitude) {
    updates.push('latitude = ?');
    params.push(latitude);
  }
  if (longitude) {
    updates.push('longitude = ?');
    params.push(longitude);
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = NOW()');
  params.push(id);

  await pool.query(
    `UPDATE regions SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
  
  return true;
};

/**
 * Delete region
 * @param {number} id - Region ID
 * @returns {Promise<void>}
 */
const deleteRegion = async (id) => {
  await pool.query('DELETE FROM regions WHERE id = ?', [id]);
};

module.exports = {
  getAllRegions,
  getRegionById,
  getChildRegions,
  getRegionHierarchy,
  getRegionUsers,
  createRegion,
  updateRegion,
  deleteRegion
};
