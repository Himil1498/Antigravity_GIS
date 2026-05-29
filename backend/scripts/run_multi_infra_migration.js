const { pool } = require("../src/config/database");
const fs = require("fs");
const path = require("path");

// Explicitly load .env from parent dir (Backend root)
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function runMigration() {
  try {
    console.log("Starting migration...");
    const sqlPath = path.join(__dirname, "../sql/05_multi_infra_migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log(`Executing SQL from ${sqlPath}:`);
    console.log(sql);

    await pool.query(sql);

    console.log("Migration executed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
