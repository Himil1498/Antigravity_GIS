require("dotenv").config({ path: "../.env" });
const { pool } = require("../src/config/database");

async function verifyUsers() {
  try {
    const [users] = await pool.query("SELECT id, full_name, email FROM users");

    console.log("--- Remaining Users ---");
    users.forEach((u) =>
      console.log(`ID: ${u.id} | Name: ${u.full_name} | Email: ${u.email}`),
    );
    console.log("-----------------------");

    if (users.length === 2) {
      console.log("VERIFICATION SUCCESS: Only 2 users remain.");
    } else {
      console.log(
        `VERIFICATION WARNING: Found ${users.length} users (expected 2).`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

verifyUsers();
