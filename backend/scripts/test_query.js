require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
pool.query("SELECT id, name, parent_id FROM network_folders WHERE name = 'Gujarat' LIMIT 5")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
