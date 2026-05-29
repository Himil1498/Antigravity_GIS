require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
pool.query("SELECT * FROM user_regions ORDER BY user_id DESC LIMIT 5")
  .then(res => { console.dir(res.rows, {depth: null}); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
