const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create "Infrastructure" Root Folder if not exists
    console.log("Creating Infrastructure root folder...");
    const infraRes = await client.query(`
      INSERT INTO network_folders (name, parent_id, is_system, category, created_by)
      SELECT 'Infrastructure', NULL, true, 'infrastructure', NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM network_folders WHERE name = 'Infrastructure' AND parent_id IS NULL
      )
      RETURNING id;
    `);

    let infraId;
    if (infraRes.rows.length > 0) {
      infraId = infraRes.rows[0].id;
    } else {
      const res = await client.query(
        "SELECT id FROM network_folders WHERE name = 'Infrastructure' AND parent_id IS NULL",
      );
      infraId = res.rows[0].id;
    }
    console.log("Infrastructure Folder ID:", infraId);

    // 2. Define System Folders to Move
    const systemFolders = [
      "POP",
      "Sub POP",
      "BTS",
      "Bandwidth Drop BTS",
      "Office Location",
      "NNI",
      "Data Center",
      "Infra Provider",
    ];

    // 3. Move Folders
    console.log("Moving system folders...");
    await client.query(
      `
      UPDATE network_folders
      SET parent_id = $1, category = 'infrastructure'
      WHERE name = ANY($2::text[]) 
      AND (parent_id IS NULL OR parent_id != $1)
    `,
      [infraId, systemFolders],
    );

    // 4. Ensure Customer Root exists (it should) and is category 'customer'
    console.log("Ensuring Customer folder category...");
    await client.query(`
      UPDATE network_folders
      SET category = 'customer'
      WHERE name IN ('Customer', 'Customers') AND parent_id IS NULL
    `);

    await client.query("COMMIT");
    console.log("Migration completed successfully.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", e);
  } finally {
    client.release();
    pool.end(); // Close the pool
  }
}

migrate();
