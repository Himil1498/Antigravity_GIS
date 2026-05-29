const { pool } = require('../src/config/database');

async function checkFiles() {
  try {
    const query = "SELECT id, name FROM regions WHERE name ILIKE '%Gujarat%'";
    const [rows] = await pool.query(query);
    console.log('Regions:');
    console.log(JSON.stringify(rows));
    
    const sridQuery = `
        SELECT 
            (SELECT ST_SRID(geom) FROM region_boundaries LIMIT 1) as rb_srid,
            (SELECT ST_SRID(geom) FROM network_features LIMIT 1) as nf_srid
    `;
    const [sridRows] = await pool.query(sridQuery);
    console.log('SRIDs:', JSON.stringify(sridRows));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkFiles();
