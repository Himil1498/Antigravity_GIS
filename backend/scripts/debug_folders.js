const { pool } = require("../src/config/database");

async function checkData() {
  try {
    console.log("Checking Top Level System Folders:");
    const [folders] = await pool.query(
      "SELECT id, name, parent_id FROM network_folders WHERE parent_id IS NULL AND is_system = true",
    );
    console.log(JSON.stringify(folders, null, 2));

    console.log("\nChecking Total File Counts by Folder:");
    const [counts] = await pool.query(`
      SELECT nf.id, nf.name, COUNT(f.id) as file_count, SUM(f.feature_count) as total_features
      FROM network_folders nf
      LEFT JOIN network_files f ON nf.id = f.folder_id
      WHERE nf.is_system = true
      GROUP BY nf.id
      ORDER BY nf.name
    `);
    console.log(JSON.stringify(counts, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkData();
