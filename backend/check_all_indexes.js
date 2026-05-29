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
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'network_features';
  `);
  console.log(res.rows);
  await pool.end();
}
check();
