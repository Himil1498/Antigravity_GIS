const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { rawPool: pool } = require('../config/database');

async function migratePermissions() {
  let client;
  try {
    console.log('Starting delete cleanup migration...');
    client = await pool.connect();
    
    // 1. Update roles table
    const rolesRes = await client.query('SELECT id, name, permissions FROM roles');
    let rolesUpdated = 0;
    
    for (const role of rolesRes.rows) {
      if (role.permissions && Array.isArray(role.permissions)) {
        if (role.permissions.includes('network:file:delete')) {
          const newPerms = role.permissions.filter(p => p !== 'network:file:delete');
          await client.query('UPDATE roles SET permissions = $1 WHERE id = $2', [JSON.stringify(newPerms), role.id]);
          rolesUpdated++;
          console.log(`Updated role: ${role.name}`);
        }
      }
    }
    
    // 2. Update users table
    const usersRes = await client.query('SELECT id, email, permissions FROM users');
    let usersUpdated = 0;
    
    for (const user of usersRes.rows) {
      if (user.permissions && Array.isArray(user.permissions)) {
        if (user.permissions.includes('network:file:delete')) {
          const newPerms = user.permissions.filter(p => p !== 'network:file:delete');
          await client.query('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(newPerms), user.id]);
          usersUpdated++;
          console.log(`Updated user: ${user.email}`);
        }
      }
    }
    
    console.log(`Delete Cleanup Migration complete. Updated ${rolesUpdated} roles and ${usersUpdated} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

migratePermissions();
