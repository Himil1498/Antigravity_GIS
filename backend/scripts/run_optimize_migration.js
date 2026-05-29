require('dotenv').config();
const { rawPool: pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/migrations/20260429_optimize_mvt_performance.sql'), 'utf8');
  console.log('Running migration...');
  try {
    await pool.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
