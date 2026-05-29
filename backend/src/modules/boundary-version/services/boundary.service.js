const { pool } = require('../../../config/database');
const fs = require('fs');
const path = require('path');

const getRegionBoundary = async (regionId) => {
    const [boundaries] = await pool.query(
      `SELECT
        bv.id, bv.region_id, bv.boundary_geojson, bv.boundary_type,
        bv.version_number, bv.vertex_count, bv.area_sqkm,
        bv.created_by, bv.created_at, bv.published_at, bv.published_by,
        bv.source, bv.notes, bv.change_reason,
        u1.full_name as created_by_name,
        u2.full_name as published_by_name
      FROM boundary_versions bv
      LEFT JOIN users u1 ON bv.created_by = u1.id
      LEFT JOIN users u2 ON bv.published_by = u2.id
      WHERE bv.region_id = ? AND bv.status = 'published'
      ORDER BY bv.published_at DESC LIMIT 1`,
      [regionId]
    );

    if (boundaries.length > 0 && boundaries[0].boundary_geojson) {
        return boundaries[0];
    } else {
        // Fallback to india.json
        try {
            // Updated path relative to new module location
            const indiaJsonPath = path.join(__dirname, '../../../../public/india.json');
            if (fs.existsSync(indiaJsonPath)) {
                const indiaData = JSON.parse(fs.readFileSync(indiaJsonPath, 'utf8'));
                const [regions] = await pool.query('SELECT id, name FROM regions WHERE id = ?', [regionId]);
                if (regions.length > 0) {
                     const region = regions[0];
                     const feature = indiaData.features.find(
                        (f) =>
                          f.properties.id === parseInt(regionId) ||
                          f.properties.name === region.name ||
                          f.properties.st_nm === region.name
                      );

                      if (feature) {
                          let vertexCount = 0;
                          if (feature.geometry.type === 'Polygon') {
                            feature.geometry.coordinates.forEach(ring => vertexCount += ring.length);
                          } else if (feature.geometry.type === 'MultiPolygon') {
                            feature.geometry.coordinates.forEach(poly => poly.forEach(ring => vertexCount += ring.length));
                          }

                          return {
                            id: null,
                            regionId: parseInt(regionId),
                            boundary_geojson: feature.geometry,
                            boundary_type: feature.geometry.type,
                            version: 1,
                            vertex_count: vertexCount,
                            area_sqkm: 0,
                            source: 'india.json',
                            isFallback: true
                          };
                      }
                }
            }
        } catch (e) {
            console.error('Fallback error', e);
        }
        return null; // No boundary found
    }
};

const updateDirectly = async (regionId, userId, boundaryData) => {
    const { boundaryGeoJSON, changeReason, source, notes } = boundaryData;
    
    // Calculate vertex count
    let vertexCount = 0;
    if (boundaryGeoJSON.type === 'Polygon') {
      boundaryGeoJSON.coordinates.forEach(ring => vertexCount += ring.length);
    } else if (boundaryGeoJSON.type === 'MultiPolygon') {
      boundaryGeoJSON.coordinates.forEach(poly => poly.forEach(ring => vertexCount += ring.length));
    }

    const [latestVersions] = await pool.query(
      'SELECT version_number FROM boundary_versions WHERE region_id = ? ORDER BY version_number DESC LIMIT 1',
      [regionId]
    );
    const nextVersion = (latestVersions.length > 0 ? latestVersions[0].version_number : 0) + 1;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        await connection.query(
            "UPDATE boundary_versions SET status = 'archived' WHERE region_id = ? AND status = 'published'",
            [regionId]
        );

        const [result] = await connection.query(
            `INSERT INTO boundary_versions
             (region_id, boundary_geojson, boundary_type, version_number, vertex_count, 
              created_by, created_at, published_by, published_at, 
              status, source, notes, change_reason, area_sqkm)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 'published', ?, ?, ?, 0) RETURNING id`,
            [
              regionId,
              JSON.stringify(boundaryGeoJSON),
              boundaryGeoJSON.type,
              nextVersion,
              vertexCount,
              userId,
              userId,
              source || 'Manual Edit',
              notes || null,
              changeReason || 'Boundary correction'
            ]
        );

        await connection.commit();
        return {
            id: result[0].id,
            version: nextVersion,
            vertexCount
        };
    } catch(e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
};

module.exports = {
  getRegionBoundary,
  updateDirectly
};
