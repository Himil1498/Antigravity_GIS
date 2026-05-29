const { prisma } = require('../../../config/database');
const catalogService = require('./catalog.service');

class FeasibilityService {
  /**
   * Bulk checks feasibility for an array of locations against a specific infrastructure type.
   * @param {Array} locations - Array of { uid, lat, lng, ...otherProps }
   * @param {string} infraType - The infrastructure type string (e.g., POP)
   * @param {Array<number>} regionIds - Array of region IDs to restrict search space
   * @param {number} maxDistanceMeters - Maximum distance to be considered feasible (default 20km)
   */
  async checkBulkFeasibility(locations, infraType, regionIds = [], maxDistanceMeters = 20000, infraFolderId = null) {
    if (!locations || locations.length === 0) return [];

    let fileIdsResult = [];

    // 1. Get all file IDs under this infrastructure type (recursively)
    // Use exact infraFolderId if provided, otherwise fallback to fuzzy search by name
    if (infraFolderId) {
      fileIdsResult = await prisma.$queryRawUnsafe(`
        WITH RECURSIVE folder_tree AS (
          SELECT id FROM network_folders WHERE id = $1 AND deleted_at IS NULL
          UNION
          SELECT f.id FROM network_folders f
          INNER JOIN folder_tree t ON f.parent_id = t.id
          WHERE f.deleted_at IS NULL
        )
        SELECT id FROM network_files 
        WHERE folder_id IN (SELECT id FROM folder_tree) AND deleted_at IS NULL
      `, infraFolderId);
    } else {
      if (!infraType) throw new Error("Infrastructure Type is required.");
      fileIdsResult = await prisma.$queryRawUnsafe(`
        WITH RECURSIVE folder_tree AS (
          SELECT id FROM network_folders WHERE name ILIKE $1 AND deleted_at IS NULL
          UNION
          SELECT f.id FROM network_folders f
          INNER JOIN folder_tree t ON f.parent_id = t.id
          WHERE f.deleted_at IS NULL
        )
        SELECT id FROM network_files 
        WHERE folder_id IN (SELECT id FROM folder_tree) AND deleted_at IS NULL
      `, '%' + infraType + '%');
    }

    const fileIds = fileIdsResult.map(row => row.id);
    if (fileIds.length === 0) {
      // No infrastructure files found for this category
      return locations.map(loc => ({
        ...loc,
        is_feasible: false,
        distance_meters: null,
        nearest_infra: null
      }));
    }

    // 2. Construct the CTE VALUES string for bulk PostGIS query
    // To prevent SQL injection and handle large datasets safely, we parameterize the inputs.
    // However, PostgreSQL limits parameters to ~65,000. 
    // If locations > 10,000, we should chunk them. We'll handle up to 5000 per chunk here.
    const CHUNK_SIZE = 5000;
    let finalResults = [];

    for (let i = 0; i < locations.length; i += CHUNK_SIZE) {
      const chunk = locations.slice(i, i + CHUNK_SIZE);
      const results = await this._processChunk(chunk, fileIds, regionIds, maxDistanceMeters);
      finalResults = finalResults.concat(results);
    }

    return finalResults;
  }

  async _processChunk(chunk, fileIds, regionIds, maxDistanceMeters) {
    const values = [];
    const params = [];
    let paramIndex = 1;

    chunk.forEach(loc => {
      // Ensure lat/lng are numbers
      const lat = parseFloat(loc.lat);
      const lng = parseFloat(loc.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      values.push(`($${paramIndex++}::varchar, ST_SetSRID(ST_MakePoint($${paramIndex++}::float, $${paramIndex++}::float), 4326))`);
      params.push(String(loc.uid), lng, lat);
    });

    if (values.length === 0) return [];

    // 3. Execute LATERAL JOIN geospatial query
    // Uses geographic distance for high accuracy over long ranges
    const fileIdsString = fileIds.join(',');
    
    const regionFilter = regionIds && regionIds.length > 0 
      ? `AND EXISTS (
          SELECT 1 FROM region_boundaries rb 
          WHERE rb.region_id IN (${regionIds.join(',')}) 
          AND rb.is_active = 1 
          AND ST_Intersects(
            (CASE WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom ELSE ST_Transform(nf.geom, 4326) END),
            rb.geom
          )
        )` 
      : '';

    const query = `
      WITH input_points (uid, geom) AS (
        VALUES ${values.join(', ')}
      )
      SELECT 
        p.uid,
        nearest.id as nearest_infra_id,
        nearest.name as nearest_infra_name,
        nearest.dist_meters as distance_meters,
        nearest.lng as nearest_lng,
        nearest.lat as nearest_lat,
        nearest.properties as nearest_properties
      FROM input_points p
      LEFT JOIN LATERAL (
        SELECT 
          nf.id, 
          COALESCE(nf.properties->>'name', nf.properties->>'Name', 'Unknown') as name,
          nf.properties,
          ST_X((CASE WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom ELSE ST_Transform(nf.geom, 4326) END)) as lng,
          ST_Y((CASE WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom ELSE ST_Transform(nf.geom, 4326) END)) as lat,
          ST_Distance(
            p.geom::geography, 
            (CASE WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom ELSE ST_Transform(nf.geom, 4326) END)::geography
          ) as dist_meters
        FROM network_features nf
        WHERE nf.file_id IN (${fileIdsString})
          AND nf.deleted_at IS NULL
          ${regionFilter}
        ORDER BY p.geom::geography <-> (CASE WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom ELSE ST_Transform(nf.geom, 4326) END)::geography
        LIMIT 5
      ) nearest ON true
    `;

    const rawResults = await prisma.$queryRawUnsafe(query, ...params);

    // 4. Map results back to original locations
    const resultMap = new Map();
    rawResults.forEach(r => {
      if (!resultMap.has(r.uid)) {
        resultMap.set(r.uid, []);
      }
      if (r.nearest_infra_id) { // skip if nearest is null (no matches)
        resultMap.get(r.uid).push(r);
      }
    });

    return chunk.map(loc => {
      const resultsForLoc = resultMap.get(String(loc.uid)) || [];
      
      const available_infras = resultsForLoc.map(res => ({
        id: res.nearest_infra_id,
        name: res.nearest_infra_name,
        properties: res.nearest_properties,
        geom: { coordinates: [res.nearest_lng, res.nearest_lat] },
        distance_meters: parseFloat(res.distance_meters)
      }));

      // Find primary nearest that is within maxDistance
      const nearest = available_infras.length > 0 ? available_infras[0] : null;
      const is_feasible = nearest !== null && nearest.distance_meters <= maxDistanceMeters;
      
      let unfeasible_reason = null;
      if (!is_feasible) {
        if (nearest && nearest.distance_meters > maxDistanceMeters) {
          unfeasible_reason = `Distance limit exceeded: Nearest is ${(nearest.distance_meters / 1000).toFixed(2)} km away`;
        } else {
          unfeasible_reason = 'No infrastructure found in the selected regions';
        }
      }

      return {
        ...loc,
        is_feasible: is_feasible,
        unfeasible_reason: unfeasible_reason,
        distance_meters: nearest ? nearest.distance_meters : null,
        nearest_infra: nearest ? {
          id: nearest.id,
          name: nearest.name,
          properties: nearest.properties,
          geom: nearest.geom
        } : null,
        available_infras: available_infras
      };
    });
  }
}

module.exports = new FeasibilityService();
