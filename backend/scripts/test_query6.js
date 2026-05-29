require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
pool.query(`
  SELECT 
    ufa.folder_id, 
    nf.name as folder_name, 
    nf.parent_id,
    p.name as parent_name,
    ufa.can_read
  FROM user_folder_access ufa 
  JOIN network_folders nf on ufa.folder_id = nf.id
  LEFT JOIN network_folders p on nf.parent_id = p.id
  WHERE ufa.user_id = 108
`)
  .then(([rows]) => { console.log("Explicit Folders:", rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
