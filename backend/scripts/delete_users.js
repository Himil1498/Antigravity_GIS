require("dotenv").config({ path: "../.env" });
const { pool } = require("../src/config/database");

async function cleanUsers() {
  try {
    console.log("Connecting to database...");

    // Check if we are connected by running a simple query
    await pool.query("SELECT 1");
    console.log("Database connected.");

    // Fetch users to verify names before deleting
    // We want to KEEP 'Neel Darji' and 'Admin Main'
    const keepNames = ["Neel Darji", "Admin Main"];

    // Get list of users who will be deleted
    const [usersToDelete] = await pool.query(
      `SELECT id, username, full_name, email FROM users 
       WHERE full_name NOT IN (?, ?)`,
      keepNames,
    );

    console.log("---------------------------------------------------");
    console.log(`Found ${usersToDelete.length} users to delete:`);
    usersToDelete.forEach((u) =>
      console.log(
        `[DELETE] ID: ${u.id} | Name: ${u.full_name} | Email: ${u.email}`,
      ),
    );
    console.log("---------------------------------------------------");

    if (usersToDelete.length === 0) {
      console.log("No users found to delete. Exiting.");
      process.exit(0);
    }

    const [deleteResult] = await pool.query(
      `DELETE FROM users 
         WHERE full_name NOT IN (?, ?)`,
      keepNames,
    );

    // In pg library, rowCount is usually on the result object directly if using the pool query wrapper correctly?
    // Wait, the pool wrapper in this project returns [rows, fields] usually, but for DELETE it might conform to standard or custom wrapper.
    // Let's check database.js wrapper if possible, or just assume standard mysql2/pg returns.
    // Actually, looking at previous code `const [result] = await pool.query(...)`, it seems to follow mysql2 promise style pattern or similar wrapper.
    // If it is 'pg' pool directly, it returns a Result object.
    // If it is a wrapper... let's just log the result to be sure.

    console.log("Delete operation completed.");
    console.log("Result:", deleteResult);

    console.log("Users cleaned up successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning up users:", error);
    process.exit(1);
  }
}

cleanUsers();
