const { pool } = require("../../config/database");
const fs = require("fs");
const path = require("path");


const ERRORS = {
  FAILED_TO_FETCH: "Failed to fetch published boundaries",
};



// --- Service Methods ---

/**
 * Get published boundaries based on user role
 * @param {number} userId - User ID
 * @param {string} userRole - User Role
 * @returns {Promise<Array>} Array of boundary objects
 */
const getPublishedBoundaries = async (userId, userRole) => {
  if (userRole === "admin") {
    const [boundaries] = await pool.query(
      `SELECT
        bv.id,
        bv.region_id as regionId,
        bv.boundary_geojson as boundaryGeoJSON,
        bv.boundary_type as boundaryType,
        bv.vertex_count as vertexCount,
        bv.area_sqkm as areaSqKm,
        bv.version_number as versionNumber,
        bv.published_at as publishedAt,
        bv.published_by as publishedBy,
        r.name as regionName,
        r.code as regionCode,
        r.type as regionType
      FROM boundary_versions bv
      JOIN regions r ON bv.region_id = r.id
      WHERE bv.status = 'published'
      ORDER BY r.name ASC`,
      [],
    );
    return boundaries;
  } else {
    const [boundaries] = await pool.query(
      `SELECT
        bv.id,
        bv.region_id as regionId,
        bv.boundary_geojson as boundaryGeoJSON,
        bv.boundary_type as boundaryType,
        bv.vertex_count as vertexCount,
        bv.area_sqkm as areaSqKm,
        bv.version_number as versionNumber,
        bv.published_at as publishedAt,
        bv.published_by as publishedBy,
        r.name as regionName,
        r.code as regionCode,
        r.type as regionType
      FROM boundary_versions bv
      JOIN regions r ON bv.region_id = r.id
      INNER JOIN user_regions ur ON ur.region_id = bv.region_id
      WHERE bv.status = 'published'
        AND ur.user_id = ?
      ORDER BY r.name ASC`,
      [userId],
    );
    return boundaries;
  }
};

module.exports = {
  getPublishedBoundaries,
  ERRORS,
};
