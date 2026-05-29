const { pool } = require("../src/config/database");

async function assignAdminPermissions() {
  try {
    console.log("🔄 assigning wildcard permissions to admins...");

    // Update all admins and superadmins to have ["*"] permissions
    const [result] = await pool.query(`
      UPDATE users 
      SET permissions = '["*"]' 
      WHERE role IN ('admin', 'superadmin')
    `);

    console.log(
      `✅ Updated permissions for ${result.affectedRows} admin users.`,
    );

    // Verify
    const [admins] = await pool.query(
      "SELECT username, role, permissions FROM users WHERE role IN ('admin', 'superadmin')",
    );
    console.table(admins);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning permissions:", error);
    process.exit(1);
  }
}

assignAdminPermissions();
