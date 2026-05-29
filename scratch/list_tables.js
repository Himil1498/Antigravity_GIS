const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'opticonnect_gis_db',
  password: String(process.env.DB_PASSWORD || 'Ved@1498@!!'),
  port: process.env.DB_PORT || 5432,
});

async function listTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(res.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listTables();
