const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "opticonnectgis_db",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function applyPermissions() {
  const client = await pool.connect();
  try {
    console.log("Applying new permissions...");

    // Read the SQL file
    const sqlPath = path.join(
      __dirname,
      "../src/startup/002_add_permissions.sql",
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL
    await client.query(sql);

    console.log("✅ Permissions applied successfully!");
  } catch (err) {
    console.error("❌ Error applying permissions:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

applyPermissions();
