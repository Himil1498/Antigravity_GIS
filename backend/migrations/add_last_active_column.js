const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'telecom_gis_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const client = new Client(config);

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add last_active_at column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
    `);
    console.log('Added last_active_at column');

    // Add index for performance on queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at);
    `);
    console.log('Added index on last_active_at');

    client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    client.end(); 
  }
}

runMigration();
