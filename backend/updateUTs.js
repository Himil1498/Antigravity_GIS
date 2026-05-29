require('dotenv').config();
const { pool } = require('./src/config/database');

(async () => {
  try {
    const uts = [
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Lakshadweep',
      'Delhi',
      'Puducherry',
      'Ladakh',
      'Jammu and Kashmir'
    ];
    
    for (const ut of uts) {
      await pool.query("UPDATE regions SET type = 'UT' WHERE name = $1", [ut]);
    }
    
    console.log('Updated UTs successfully!');
  } catch (e) {
    console.error('Error updating UTs:', e);
  } finally {
    process.exit(0);
  }
})();
