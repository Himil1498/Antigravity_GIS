const { pool } = require("../src/config/database");

async function checkData() {
  try {
    console.log("Checking 'Data Center' Folders:");
    const [folders] = await pool.query(
      "SELECT id, name, parent_id, is_system FROM network_folders WHERE name ILIKE '%Data Center%'",
    );
    console.log(JSON.stringify(folders, null, 2));

    console.log("\nChecking 'Data Center' Files:");
    const [files] = await pool.query(`
      SELECT f.id, f.name, f.folder_id, f.region_id, nf.name as folder_name, f.feature_count 
      FROM network_files f
      JOIN network_folders nf ON f.folder_id = nf.id
      WHERE nf.name ILIKE '%Data Center%'
    `);
    console.log(JSON.stringify(files, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkData();
