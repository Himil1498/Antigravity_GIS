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
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'network_files' AND column_name = 'created_at';
  `);
  console.log(res.rows);
  await pool.end();
}
check();
