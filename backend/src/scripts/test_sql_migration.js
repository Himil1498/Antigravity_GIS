require('dotenv').config({ path: 'backend/.env' });
const { rawPool: pool } = require('../config/database');
const fs = require('fs');

async function testSQL() {
  const sql = fs.readFileSync('backend/sql/migrations/20260311_migrate_permissions_to_granular.sql', 'utf8');
  try {
    console.log('Testing SQL Migration...');
    const client = await pool.connect();
    
    // Begin transaction so we can rollback
    await client.query('BEGIN');
    
    console.log('Executing SQL...');
    await client.query(sql);
    
    console.log('Rolling back transaction (we just wanted to test syntax)...');
    await client.query('ROLLBACK');
    client.release();
    console.log('SQL Migration tested successfully! Syntax is valid.');
    process.exit(0);
  } catch (err) {
    console.error('SQL Migration failed:', err);
    process.exit(1);
  }
}

testSQL();
