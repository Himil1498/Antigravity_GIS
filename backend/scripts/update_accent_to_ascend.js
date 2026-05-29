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

const updateAccentToAscend = async () => {
  try {
    console.log("🔌 Connecting to database...");

    // Find 'Infra Provider' folder ID
    const parentRes = await pool.query(
      "SELECT id FROM network_folders WHERE name = 'Infra Provider'",
    );

    if (parentRes.rows.length === 0) {
      console.log("❌ 'Infra Provider' folder not found.");
      return;
    }

    const parentId = parentRes.rows[0].id;

    // Check if 'Accent' exists under 'Infra Provider'
    const folderRes = await pool.query(
      "SELECT id FROM network_folders WHERE name = 'Accent' AND parent_id = $1",
      [parentId],
    );

    if (folderRes.rows.length > 0) {
      const folderId = folderRes.rows[0].id;
      console.log(
        `Found 'Accent' folder (ID: ${folderId}). Renaming to 'Ascend'...`,
      );

      await pool.query(
        "UPDATE network_folders SET name = 'Ascend' WHERE id = $1",
        [folderId],
      );
      console.log("✅ Renamed 'Accent' to 'Ascend' successfully.");
    } else {
      console.log(
        "ℹ️ 'Accent' folder not found under 'Infra Provider'. Checking if 'Ascend' already exists...",
      );

      const ascendRes = await pool.query(
        "SELECT id FROM network_folders WHERE name = 'Ascend' AND parent_id = $1",
        [parentId],
      );

      if (ascendRes.rows.length > 0) {
        console.log("✅ 'Ascend' folder already exists.");
      } else {
        console.log("⚠️ neither 'Accent' nor 'Ascend' found.");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
};

updateAccentToAscend();
