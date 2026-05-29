const { pool } = require("../src/config/database");

async function checkPermissions() {
  try {
    console.log("🔍 Checking permissions for users...");

    const [users] = await pool.query(
      "SELECT id, username, email, role, permissions FROM users WHERE role IN ('admin', 'superadmin') OR username = 'test'",
    );

    console.table(users);

    // Check type of permissions
    if (users.length > 0) {
      console.log("Permissions type:", typeof users[0].permissions);
      console.log(
        "Permissions value:",
        JSON.stringify(users[0].permissions, null, 2),
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking permissions:", error);
    process.exit(1);
  }
}

checkPermissions();
