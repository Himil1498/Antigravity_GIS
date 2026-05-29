const { pool } = require('../src/config/database');

async function updateSessionsTable() {
  console.log('🔄 Checking user_sessions table schema...');
  
  try {
    // Add logout_time column if missing
    try {
      await pool.query(`
        ALTER TABLE user_sessions 
        ADD COLUMN logout_time DATETIME NULL AFTER expires_at
      `);
      console.log('✅ Added logout_time column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ logout_time column already exists');
      } else {
        throw error;
      }
    }

    // Add logout_type column if missing
    try {
      await pool.query(`
        ALTER TABLE user_sessions 
        ADD COLUMN logout_type VARCHAR(20) NULL AFTER logout_time
      `);
      console.log('✅ Added logout_type column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ logout_type column already exists');
      } else {
        throw error;
      }
    }

    console.log('✨ Schema update complete!');
  } catch (error) {
    console.error('❌ Schema update failed:', error);
  } finally {
    process.exit();
  }
}

updateSessionsTable();
