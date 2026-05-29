const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Optimal@123', 
  database: 'opticonnect_gis_db',
  port: 5433,
});

async function optimizeV2() {
  console.log("Starting Phase 2 Optimization (Pre-transform 3857)...");
  try {
    // 1. Check if geom_3857 column exists
    const checkRes = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='region_boundaries' AND column_name='geom_3857'
    `);

    if (checkRes.rows.length === 0) {
        console.log("Adding 'geom_3857' column...");
        await pool.query("ALTER TABLE region_boundaries ADD COLUMN geom_3857 geometry(MultiPolygon, 3857)");
    } else {
        console.log("'geom_3857' column already exists.");
    }

    // 2. Populate geom_3857 from geom
    console.log("Populating 'geom_3857' from 'geom'...");
    // We simplify slightly (resolution 10m) to reduce complexity for even faster intersection
    // ST_SimplifyPreserveTopology ensures valid polygons.
    await pool.query(`
        UPDATE region_boundaries 
        SET geom_3857 = ST_Multi(ST_SimplifyPreserveTopology(ST_Transform(geom, 3857), 10))
        WHERE geom_3857 IS NULL OR ST_IsEmpty(geom_3857)
    `);

    // 3. Create Index
    console.log("Creating Spatial Index on 'geom_3857'...");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_region_boundaries_geom_3857 ON region_boundaries USING GIST (geom_3857)");

    console.log("Optimization Phase 2 Complete.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

optimizeV2();
