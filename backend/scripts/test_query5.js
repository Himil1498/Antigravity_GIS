require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
pool.query("SELECT id, username, role FROM users ORDER BY id DESC LIMIT 5")
  .then(([rows]) => { console.log(rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
