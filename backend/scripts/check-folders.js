const { pool } = require("../src/config/database");

const checkFolders = async () => {
  const client = await pool.getConnection();
  try {
    const [rows] = await client.query(
      "SELECT id, name, default_icon FROM network_folders WHERE id IN (5, 6, 7)",
    );
    console.table(rows);
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    client.release();
    process.exit();
  }
};

checkFolders();
