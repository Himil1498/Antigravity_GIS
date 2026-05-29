const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/database');

const runMigration = async () => {
  try {
    console.log('Running migration: Adding default_folder_ids column...');
    
    // Try to add the column directly. 
    // If it exists, it will throw an error, which we can catch and ignore if it's "duplicate column"
    try {
      await pool.query(`ALTER TABLE roles ADD COLUMN default_folder_ids JSONB DEFAULT '[]'::jsonb;`);
      console.log('✅ Column default_folder_ids added successfully.');
    } catch (err) {
      if (err.code === '42701') { // duplicate_column
        console.log('ℹ️ Column default_folder_ids already exists. Skipping.');
      } else {
        throw err;
      }
    }

    // Add comment
    try {
      await pool.query(`COMMENT ON COLUMN roles.default_folder_ids IS 'JSON array of network_folder IDs to auto-assign as folder access when a user is assigned this role';`);
      console.log('✅ Comment added successfully.');
    } catch (err) {
      console.warn('⚠️ Could not add comment (non-fatal):', err.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
