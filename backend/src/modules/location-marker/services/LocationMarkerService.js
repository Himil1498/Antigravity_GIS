const pool = require('../../../config/database').pool;

class LocationMarkerService {
  async getAllMarkers(userId, onlyFeasibility = false) {
    const query = `
      SELECT id, name, notes AS remarks, lat, lng, created_by, created_at, updated_at, 
             feasibility_data, is_feasibility, linked_file_id
      FROM marked_locations
      WHERE created_by = $1 ${onlyFeasibility ? 'AND is_feasibility = TRUE' : ''}
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  async getMarkerById(id, userId) {
    const query = `
      SELECT id, name, notes, lat, lng, created_by, created_at, updated_at,
             feasibility_data, is_feasibility, linked_file_id
      FROM marked_locations
      WHERE id = $1 AND created_by = $2
    `;
    const [rows] = await pool.query(query, [id, userId]);
    return rows[0];
  }

  async createMarker(userId, markerData) {
    const { name, notes, remarks, lat, lng, is_feasibility = false, feasibility_data = null } = markerData;
    const notesValue = notes || remarks || null;
    const query = `
      INSERT INTO marked_locations (name, notes, lat, lng, created_by, created_at, updated_at, is_feasibility, feasibility_data)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6, $7)
      RETURNING *
    `;
    const values = [name, notesValue, lat, lng, userId, is_feasibility, feasibility_data];
    const [rows] = await pool.query(query, values);
    return rows[0];
  }

  async updateMarkerFeasibility(id, userId, feasibilityData, linkedFileId = null) {
      const query = `
        UPDATE marked_locations
        SET feasibility_data = $1, 
            linked_file_id = COALESCE($2, linked_file_id),
            is_feasibility = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND created_by = $4
        RETURNING *
      `;
      const [rows] = await pool.query(query, [feasibilityData, linkedFileId, id, userId]);
      return rows[0];
  }

  async updateMarkerBaseFields(id, userId, markerData) {
    const { name, notes } = markerData;
    const query = `
      UPDATE marked_locations
      SET name = $1, 
          notes = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND created_by = $4
      RETURNING *
    `;
    const [rows] = await pool.query(query, [name, notes, id, userId]);
    return rows[0];
  }

  async deleteMarker(id, userId) {
    const query = `
      DELETE FROM marked_locations
      WHERE id = $1 AND created_by = $2
      RETURNING id
    `;
    const [rows] = await pool.query(query, [id, userId]);
    return rows[0];
  }

  async deleteBulkMarkers(userId, ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return 0;
    const query = `
      DELETE FROM marked_locations
      WHERE created_by = $1 AND id = ANY($2::int[])
    `;
    const [rows] = await pool.query(query, [userId, ids]);
    return rows.affectedRows || 0;
  }

  async createBulkMarkers(userId, markers) {
    if (!markers || markers.length === 0) return [];
    
    const values = [];
    const placeholders = [];
    let paramIndex = 1;
    
    for (const m of markers) {
      const notesValue = m.notes || m.remarks || null;
      placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $${paramIndex++}, $${paramIndex++})`);
      values.push(m.name, notesValue, m.lat, m.lng, userId, m.is_feasibility || false, m.feasibility_data || null);
    }
    
    const query = `
      INSERT INTO marked_locations (name, notes, lat, lng, created_by, created_at, updated_at, is_feasibility, feasibility_data)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    
    const [rows] = await pool.query(query, values);
    return rows;
  }
}

module.exports = new LocationMarkerService();
