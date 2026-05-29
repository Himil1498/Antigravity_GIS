const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { rawPool: pool } = require('../config/database');

async function migratePermissions() {
  let client;
  try {
    console.log('Starting edit permission migration...');
    client = await pool.connect();
    
    // 1. Update roles table
    const rolesRes = await client.query('SELECT id, name, permissions FROM roles');
    let rolesUpdated = 0;
    
    for (const role of rolesRes.rows) {
      if (role.permissions && Array.isArray(role.permissions)) {
        let needsUpdate = false;
        let newPerms = [];
        
        for (const p of role.permissions) {
          if (p === 'network:file:edit') {
            needsUpdate = true;
            newPerms.push('network:file:edit_planned');
            newPerms.push('network:file:edit_live');
            newPerms.push('network:file:edit_imported');
          } else {
            newPerms.push(p);
          }
        }
        
        if (needsUpdate) {
          // Remove duplicates if any
          newPerms = [...new Set(newPerms)];
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
        let needsUpdate = false;
        let newPerms = [];
        
        for (const p of user.permissions) {
          if (p === 'network:file:edit') {
            needsUpdate = true;
            newPerms.push('network:file:edit_planned');
            newPerms.push('network:file:edit_live');
            newPerms.push('network:file:edit_imported');
          } else {
            newPerms.push(p);
          }
        }
        
        if (needsUpdate) {
          newPerms = [...new Set(newPerms)];
          await client.query('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(newPerms), user.id]);
          usersUpdated++;
          console.log(`Updated user: ${user.email}`);
        }
      }
    }
    
    console.log(`Edit Permission Migration complete. Updated ${rolesUpdated} roles and ${usersUpdated} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

migratePermissions();
