const { pool } = require("../src/config/database");

async function checkData() {
  try {
    console.log("Checking Files with 'Data Center' in name:");
    const [files] = await pool.query(
      "SELECT id, name, folder_id, icon_type, feature_count FROM network_files WHERE name ILIKE '%Data Center%'",
    );
    console.log(JSON.stringify(files, null, 2));

    console.log("\nChecking Files by icon_type 'DATACENTER' (or similar):");
    const [iconFiles] = await pool.query(
      "SELECT id, name, folder_id, icon_type, feature_count FROM network_files WHERE icon_type ILIKE '%Data%' OR icon_type ILIKE '%Center%'",
    );
    console.log(JSON.stringify(iconFiles, null, 2));

    console.log(
      "\nChecking Features with properties->>'icon_type' = 'DATACENTER':",
    );
    const [featureSample] = await pool.query(`
      SELECT properties->>'name' as name, properties->>'icon_type' as icon_type, file_id
      FROM network_features 
      WHERE properties->>'icon_type' ILIKE '%Data%'
      LIMIT 5
    `);
    console.log(JSON.stringify(featureSample, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkData();
