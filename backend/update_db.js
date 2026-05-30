const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'Ved@1498@!!', host: 'localhost', database: 'opticonnect_gis_db', port: 5432 });
client.connect()
  .then(() => client.query("UPDATE boundary_versions SET status = 'draft' WHERE status = 'published' AND region_id NOT IN (SELECT id FROM regions WHERE name IN ('Gujarat', 'Dadra and Nagar Haveli and Daman and Diu', 'Daman and Diu'));"))
  .then(res => console.log('Updated rows:', res.rowCount))
  .catch(console.error)
  .finally(() => client.end());
