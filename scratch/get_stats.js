const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'opticonnect_gis_db',
  password: String(process.env.DB_PASSWORD || ''),
  port: process.env.DB_PORT || 5432,
});

async function getStats() {
  try {
    // Count permissions
    const perms = await pool.query("SELECT COUNT(*) as cnt FROM system_permissions");
    console.log('Total Permissions:', perms.rows[0].cnt);

    // Permission categories
    const cats = await pool.query("SELECT DISTINCT category FROM system_permissions ORDER BY category");
    console.log('Permission Categories:', cats.rows.map(r => r.category));

    // Count users
    const users = await pool.query("SELECT COUNT(*) as cnt FROM users WHERE is_active = true");
    console.log('Active Users:', users.rows[0].cnt);

    // Count roles
    const roles = await pool.query("SELECT DISTINCT role FROM users WHERE is_active = true");
    console.log('Roles:', roles.rows.map(r => r.role));

    // Count regions
    const regions = await pool.query("SELECT COUNT(*) as cnt FROM regions");
    console.log('Total Regions:', regions.rows[0].cnt);

    // Count folders
    const folders = await pool.query("SELECT COUNT(*) as cnt FROM network_folders");
    console.log('Network Folders:', folders.rows[0].cnt);

    // Count features  
    const features = await pool.query("SELECT COUNT(*) as cnt FROM network_features");
    console.log('Network Features:', features.rows[0].cnt);

    // Count groups
    const groups = await pool.query("SELECT COUNT(*) as cnt FROM groups");
    console.log('Groups:', groups.rows[0].cnt);

    // Dark fiber
    const dfRoutes = await pool.query("SELECT COUNT(*) as cnt FROM dark_fiber_routes");
    console.log('Dark Fiber Routes:', dfRoutes.rows[0].cnt);
    
    const dfNodes = await pool.query("SELECT COUNT(*) as cnt FROM dark_fiber_nodes");
    console.log('Dark Fiber Nodes:', dfNodes.rows[0].cnt);

  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

getStats();
