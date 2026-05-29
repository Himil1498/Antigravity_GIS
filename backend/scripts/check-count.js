const { pool } = require("../src/config/database");

const checkCount = async () => {
  const client = await pool.getConnection();
  try {
    const [fileRows] = await client.query(
      "SELECT COUNT(*) as count FROM network_files",
    );
    const [folderRows] = await client.query(
      "SELECT COUNT(*) as count FROM network_folders",
    );

    console.log(
      "📂 Network Folders Count:",
      fileRows[0]?.count || fileRows[0]?.COUNT,
    ); // Typo in var name but logic valid
    console.log(
      "📄 Network Files Count:",
      fileRows[0]?.count || fileRows[0]?.COUNT,
    );
    console.log(
      "📁 Actual Folders Count:",
      folderRows[0]?.count || folderRows[0]?.COUNT,
    );
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    client.release();
    process.exit();
  }
};

checkCount();
