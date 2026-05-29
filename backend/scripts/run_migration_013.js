const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/database');
const fs = require('fs');

const runMigration = async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'sql', '013_add_role_default_folders.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`Migration file not found at: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration: 013_add_role_default_folders.sql ...');
    await pool.query(sql);
    console.log('Migration successful: Default folder column added to roles table.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
