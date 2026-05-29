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
    SELECT created_at::text, extract(epoch from created_at) as epoch
    FROM network_files 
    WHERE name = 'My Places (29 MAY 26) - Fixed.kmz'
    ORDER BY created_at DESC LIMIT 1;
  `);
  console.log(res.rows);
  await pool.end();
}
check();
