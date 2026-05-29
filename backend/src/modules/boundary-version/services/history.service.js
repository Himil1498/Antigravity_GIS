const { pool } = require('../../../config/database');

const getBoundaryHistory = async (regionId, limit = 10, offset = 0) => {
    const [history] = await pool.query(
      `SELECT
        bv.id, 
        bv.region_id as "regionId",
        bv.version_number as "versionNumber", 
        bv.status,
        bv.vertex_count as "vertexCount",
        bv.area_sqkm as "areaSqKm",
        bv.published_at as "publishedAt", 
        bv.published_by as "publishedBy",
        bv.created_at as "createdAt",
        bv.created_by as "createdBy",
        bv.change_reason as "changeReason", 
        bv.source, 
        bv.notes,
        u.full_name as "publishedByName",
        c.full_name as "createdByName"
       FROM boundary_versions bv
       LEFT JOIN users u ON bv.published_by = u.id
       LEFT JOIN users c ON bv.created_by = c.id
       WHERE bv.region_id = ? AND (bv.status = 'published' OR bv.status = 'archived' OR bv.status = 'draft')
       ORDER BY bv.version_number DESC
       LIMIT ? OFFSET ?`,
      [regionId, parseInt(limit), parseInt(offset)]
    );
    
    // We can also fetch the count separately if total_versions column subquery approach is slow, 
    // but for limits like 10 it's fine. 
    // Wait, the subquery runs for every row? Yes. 
    // Better to do a separate count query.
    
    const [countResult] = await pool.query(
        "SELECT COUNT(*) as total FROM boundary_versions WHERE region_id = ? AND (status = 'published' OR status = 'archived' OR status = 'draft')",
        [regionId]
    );

    return {
        history,
        total: countResult[0].total
    };
};

const revertToVersion = async (regionId, versionId, userId, reason) => {
     // Get target version
     const [versions] = await pool.query('SELECT * FROM boundary_versions WHERE id = ?', [versionId]);
     if (versions.length === 0) throw new Error('Version not found');
     const targetVersion = versions[0];
     
     // This logic mirrors updateDirectly but uses existing geometry
     const connection = await pool.getConnection();
     await connection.beginTransaction();
     try {
         // Get next version number
         const [latest] = await connection.query('SELECT MAX(version_number) as v FROM boundary_versions WHERE region_id = ?', [regionId]);
         const nextVersion = (latest[0].v || 0) + 1;

         // Archive current
         await connection.query("UPDATE boundary_versions SET status = 'archived' WHERE region_id = ? AND status = 'published'", [regionId]);

         // Insert new published version based on old one
         await connection.query(
            `INSERT INTO boundary_versions
             (region_id, boundary_geojson, boundary_type, version_number, vertex_count, 
              created_by, created_at, published_by, published_at, 
              status, source, notes, change_reason, area_sqkm)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 'published', ?, ?, ?, ?)`,
             [
                 regionId,
                 JSON.stringify(targetVersion.boundary_geojson),
                 targetVersion.boundary_type,
                 nextVersion,
                 targetVersion.vertex_count,
                 userId,
                 userId,
                 'System Restore',
                 `Reverted to version ${targetVersion.version_number}. ${reason || ''}`,
                 `Revert: ${reason || 'restored prev version'}`,
                 targetVersion.area_sqkm
             ]
         );
         
         await connection.commit();
     } catch(e) {
         await connection.rollback();
         throw e;
     } finally {
         connection.release();
     }
};

const getBoundaryChangeHistory = async (regionId, limit = 50, offset = 0) => {
    const [changes] = await pool.query(
      `SELECT
        bch.*, u.full_name as changed_by_name, u.username as changed_by_username
      FROM boundary_change_history bch
      LEFT JOIN users u ON bch.changed_by = u.id
      WHERE bch.region_id = ?
      ORDER BY bch.changed_at DESC LIMIT ? OFFSET ?`,
      [regionId, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM boundary_change_history WHERE region_id = ?',
      [regionId]
    );

    return {
        changes: changes.map(ch => ({
            id: ch.id,
            regionId: ch.region_id,
            boundaryId: ch.boundary_id,
            oldVersion: ch.old_version,
            newVersion: ch.new_version,
            changeType: ch.change_type,
            changeReason: ch.change_reason,
            verticesAdded: ch.vertices_added,
            verticesRemoved: ch.vertices_removed,
            verticesMoved: ch.vertices_moved,
            changedBy: ch.changed_by,
            changedByName: ch.changed_by_name,
            changedByUsername: ch.changed_by_username,
            changedAt: ch.changed_at,
            ipAddress: ch.ip_address
        })),
        total: countResult[0].total
    };
};

module.exports = {
  getBoundaryHistory,
  revertToVersion,
  getBoundaryChangeHistory
};
