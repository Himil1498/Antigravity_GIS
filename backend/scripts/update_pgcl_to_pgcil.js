const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const updatePgclToPgcil = async () => {
  try {
    console.log("🔌 Connecting to database...");

    // Find 'Customer' folder ID
    const parentRes = await pool.query(
      "SELECT id FROM network_folders WHERE name = 'Customer'",
    );

    if (parentRes.rows.length === 0) {
      console.log("❌ 'Customer' folder not found.");
      return;
    }

    const parentId = parentRes.rows[0].id;

    // Check if 'PGCL' exists under 'Customer'
    const folderRes = await pool.query(
      "SELECT id FROM network_folders WHERE name = 'PGCL' AND parent_id = $1",
      [parentId],
    );

    if (folderRes.rows.length > 0) {
      const folderId = folderRes.rows[0].id;
      console.log(
        `Found 'PGCL' folder (ID: ${folderId}). Renaming to 'PGCIL'...`,
      );

      await pool.query(
        "UPDATE network_folders SET name = 'PGCIL' WHERE id = $1",
        [folderId],
      );
      console.log("✅ Renamed 'PGCL' to 'PGCIL' successfully.");
    } else {
      console.log(
        "ℹ️ 'PGCL' folder not found under 'Customer'. Checking if 'PGCIL' already exists...",
      );

      const pgcilRes = await pool.query(
        "SELECT id FROM network_folders WHERE name = 'PGCIL' AND parent_id = $1",
        [parentId],
      );

      if (pgcilRes.rows.length > 0) {
        console.log("✅ 'PGCIL' folder already exists.");
      } else {
        console.log("⚠️ neither 'PGCL' nor 'PGCIL' found.");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
};

updatePgclToPgcil();
