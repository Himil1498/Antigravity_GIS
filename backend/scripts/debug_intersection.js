const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Optimal@123', 
  database: 'opticonnect_gis_db',
  port: 5433,
});

async function debug() {
  try {
    console.log("Debugging Spatial Intersection for Gujarat...");

    // 1. Get Gujarat Boundary Details
    const boundaryRes = await pool.query(`
        SELECT 
            id, 
            ST_AsText(ST_SetSRID(ST_GeomFromGeoJSON(boundary_geojson::text), 4326)) as wkt,
            ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON(boundary_geojson::text), 4326)) as is_valid,
            ST_SRID(ST_SetSRID(ST_GeomFromGeoJSON(boundary_geojson::text), 4326)) as srid
        FROM region_boundaries 
        WHERE region_id = (SELECT id FROM regions WHERE name ILIKE 'Gujarat') AND is_active = 1
    `);

    if (boundaryRes.rows.length === 0) {
        console.error("Gujarat Boundary NOT FOUND in DB!");
        return;
    }

    const bound = boundaryRes.rows[0];
    console.log(`Boundary Found: ID=${bound.id}, Valid=${bound.is_valid}, SRID=${bound.srid}`);
    // console.log("Boundary WKT (snippet):", bound.wkt.substring(0, 100));

    // 2. Find a point that SHOULD be inside (e.g. inside the bounding box of the boundary)
    // Gujarat roughly: 68E-74E, 20N-24.7N
    const pointRes = await pool.query(`
        SELECT 
            id, 
            ST_AsText(geom) as wkt,
            ST_SRID(geom) as srid,
            ST_X(geom) as lon,
            ST_Y(geom) as lat
        FROM network_features 
        WHERE 
            file_id IN (SELECT id FROM network_files) -- Ensure active files
            AND ST_X(geom) BETWEEN 70 AND 72 
            AND ST_Y(geom) BETWEEN 21 AND 23
        LIMIT 1
    `);

    if (pointRes.rows.length === 0) {
        console.error("No test points found in Gujarat bounding box (70-72, 21-23). Data might be missing or coordinates flipped?");
        
        // Try global search to see where points are
        const sample = await pool.query("SELECT ST_AsText(geom) as wkt FROM network_features LIMIT 1");
        console.log("Random Point WKT:", sample.rows[0]?.wkt);
        return;
    }

    const point = pointRes.rows[0];
    console.log(`Test Point Found: ID=${point.id}, SRID=${point.srid}, Lon=${point.lon}, Lat=${point.lat}`);

    // 3. Test Intersection
    const intersectRes = await pool.query(`
        SELECT ST_Intersects(
            (SELECT geom FROM network_features WHERE id = $1),
            ST_SetSRID(ST_GeomFromGeoJSON((SELECT boundary_geojson FROM region_boundaries WHERE id = $2)::text), 4326)
        ) as intersects
    `, [point.id, bound.id]);

    console.log("ST_Intersects Result:", intersectRes.rows[0].intersects);

    // 4. Test with MakeValid
    const validRes = await pool.query(`
        SELECT ST_Intersects(
            (SELECT geom FROM network_features WHERE id = $1),
            ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON((SELECT boundary_geojson FROM region_boundaries WHERE id = $2)::text), 4326))
        ) as intersects_valid
    `, [point.id, bound.id]);
    
    console.log("ST_Intersects (with ST_MakeValid) Result:", validRes.rows[0].intersects_valid);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

debug();
