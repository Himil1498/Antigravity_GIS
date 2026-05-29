const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../src/config/database');

const checkColumn = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'default_folder_ids';
    `);
    
    if (result.rows && result.rows.length > 0) {
      console.log('✅ Column default_folder_ids EXISTS.');
    } else {
      console.log('❌ Column default_folder_ids DOES NOT EXIST.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
};

checkColumn();
