const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'opticonnect_gis_db',
  password: 'Ved@1498@!!',
  port: 5432,
});

async function check() {
  const res = await pool.query("SELECT id, name, processing_status, error_message FROM network_files WHERE name LIKE '%29 MAY 26%' ORDER BY created_at DESC LIMIT 1;");
  console.log(res.rows);
  await pool.end();
}
check();
