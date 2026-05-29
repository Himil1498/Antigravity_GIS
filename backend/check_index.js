const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'opticonnect_gis_db',
  password: 'Ved@1498@!!',
  port: 5432,
});

async function check() {
  const res = await pool.query(`
    SELECT indexdef 
    FROM pg_indexes 
    WHERE indexname = 'idx_network_features_file_geom_active';
  `);
  console.log(res.rows);
  await pool.end();
}
check();
