const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Optimal@123', 
  database: 'opticonnect_gis_db',
  port: 5433,
});

async function seedV3() {
  console.log("Starting Seed V3 (Fixing Missing Regions)...");
  try {
    // 1. Ensure "Delhi" exists in regions table
    const delhiCheck = await pool.query("SELECT id FROM regions WHERE name = 'Delhi'");
    if (delhiCheck.rows.length === 0) {
        console.log("Inserting missing region: Delhi");
        await pool.query("INSERT INTO regions (name, code, type, created_at, updated_at) VALUES ('Delhi', 'DL', 'Union Territory', NOW(), NOW())");
    }

    const jsonPath = path.join(__dirname, '../public/india.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("india.json not found!");
        return;
    }
    
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const geojson = JSON.parse(raw);
    const features = geojson.features;
    let processed = 0;

    for (const feature of features) {
        let name = feature.properties.st_nm || feature.properties.name || feature.properties.NAME_1;
        
        // MAPPING
        if (name === 'NCT of Delhi') name = 'Delhi';
        if (name === 'Dadra and Nagar Haveli' || name === 'Daman and Diu') {
            name = 'Dadra and Nagar Haveli and Daman and Diu';
        }

        if (!name) continue;

        // Find Region ID
        const regionRes = await pool.query("SELECT id FROM regions WHERE LOWER(name) = LOWER($1)", [name]);
        if (regionRes.rows.length === 0) {
            console.warn(`Region '${name}' still not found. Skipping.`);
            continue;
        }
        const regionId = regionRes.rows[0].id; // $1 in query

        // Use PostGIS to merge if exists (Handling Dadra+Daman case)
        
        // First, check if entry exists
        const boundsRes = await pool.query("SELECT id FROM region_boundaries WHERE region_id = $1", [regionId]);

        if (boundsRes.rows.length > 0) {
            // Update and Union
            console.log(`Updating/Merging boundary for '${name}'...`);
            // We pass parameters: $1 = JSON String of geometry, $2 = Region ID
            await pool.query(`
                UPDATE region_boundaries 
                SET 
                    geom = ST_Multi(ST_Union(ST_MakeValid(COALESCE(geom, ST_GeomFromText('POLYGON EMPTY', 4326))), ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($1::text), 4326)))),
                    boundary_geojson = ST_AsGeoJSON(ST_Multi(ST_Union(ST_MakeValid(COALESCE(geom, ST_GeomFromText('POLYGON EMPTY', 4326))), ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($1::text), 4326)))))::jsonb,
                    updated_at = NOW(),
                    is_active = 1
                WHERE region_id = $2
            `, [JSON.stringify(feature.geometry), regionId]);
        } else {
            // Insert
            console.log(`Inserting boundary for '${name}'...`);
            // We pass parameters: $1 = Region ID, $2 = JSON String of geometry
            await pool.query(`
                INSERT INTO region_boundaries 
                (region_id, boundary_geojson, boundary_type, version, is_active, created_at, updated_at, geom) 
                VALUES ($1, $2::jsonb, 'State', 1, 1, NOW(), NOW(), ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($2::text), 4326)))
            `, [regionId, JSON.stringify(feature.geometry)]);
        }
        processed++;
    }
    
    // Final Step: Update geom_3857 (Performance Layer)
    console.log("Finalizing: Updating geom_3857 and syncing boundary_geojson from geom...");
    await pool.query(`
        UPDATE region_boundaries
        SET 
            geom_3857 = ST_Multi(ST_SimplifyPreserveTopology(ST_Transform(geom, 3857), 10))
        WHERE is_active = 1
    `);

    console.log(`Seed V3 Complete. Processed inputs: ${processed}.`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

seedV3();
