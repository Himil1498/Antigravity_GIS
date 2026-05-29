const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Optimal@123', 
  database: 'opticonnect_gis_db',
  port: 5433,
});

async function optimize() {
  console.log("Optimizing region_boundaries schema...");
  try {
    // 1. Check if geom column exists
    const checkRes = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='region_boundaries' AND column_name='geom'
    `);

    if (checkRes.rows.length === 0) {
        console.log("Adding 'geom' column...");
        await pool.query("ALTER TABLE region_boundaries ADD COLUMN geom geometry(MultiPolygon, 4326)");
    } else {
        console.log("'geom' column already exists.");
    }

    // 2. Populate geom from boundary_geojson
    console.log("Populating 'geom' from 'boundary_geojson'...");
    await pool.query(`
        UPDATE region_boundaries 
        SET geom = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(boundary_geojson::text), 4326))
        WHERE geom IS NULL OR ST_IsEmpty(geom)
    `);

    // 3. Create Index
    console.log("Creating Spatial Index on 'geom'...");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_region_boundaries_geom ON region_boundaries USING GIST (geom)");

    console.log("Optimization Complete.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

optimize();
