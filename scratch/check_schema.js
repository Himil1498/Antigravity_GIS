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

async function checkSchema() {
  try {
    const resApprovals = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'infra_approvals'
    `);
    console.log('--- infra_approvals ---');
    resApprovals.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

    const resFeatures = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'network_features'
    `);
    console.log('\n--- network_features ---');
    resFeatures.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
