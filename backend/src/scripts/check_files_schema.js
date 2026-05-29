require('dotenv').config({ path: 'backend/.env' });
const { rawPool: pool } = require('../config/database');

async function check() {
  const client = await pool.connect();
  const res = await client.query("SELECT ia.id, ia.status, ia.circuit_id, f.name as folder_name, ia.form_data->>'name' as req_name FROM infra_approvals ia JOIN network_folders f ON ia.folder_id = f.id WHERE f.name IN ('Andaman and Nicobar Islands', 'Gujarat')");
  console.log('Approvals:', res.rows);
  client.release();
  process.exit(0);
}
check();
