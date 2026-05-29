require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
pool.query("SELECT * FROM user_regions ORDER BY user_id DESC LIMIT 10")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
