const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Optimal@123', 
  database: 'opticonnect_gis_db',
  port: 5433,
});

async function audit() {
  try {
    const res = await pool.query("SELECT name, code FROM regions ORDER BY name");
    const names = res.rows.map(r => `${r.name} (${r.code})`);
    fs.writeFileSync(path.join(__dirname, 'regions_dump.txt'), JSON.stringify(names, null, 2));
    console.log("Dumped regions to regions_dump.txt");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

audit();
