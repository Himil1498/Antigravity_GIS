const { pool } = require("../src/config/database");

async function checkData() {
  try {
    console.log("Checking File 51:");
    const [files] = await pool.query(
      "SELECT * FROM network_files WHERE id = 51",
    );
    console.log(JSON.stringify(files, null, 2));

    // Check if there are other files in Data Center Test folder
    console.log("Files in Folder 44 (Data Center Test):");
    const [folderFiles] = await pool.query(
      "SELECT * FROM network_files WHERE folder_id = 44",
    );
    console.log(JSON.stringify(folderFiles, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkData();
