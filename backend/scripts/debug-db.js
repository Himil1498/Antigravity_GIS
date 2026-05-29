const { pool } = require("../src/config/database");

const debugDb = async () => {
  const client = await pool.getConnection();
  try {
    console.log("🔍 Inspecting Network Files...");

    const [rows] = await client.query(`
      SELECT f.id, f.name, f.icon_type, p.name as folder_name 
      FROM network_files f
      LEFT JOIN network_folders p ON f.folder_id = p.id
      LIMIT 20
    `);

    console.table(rows);
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    client.release();
    process.exit();
  }
};

debugDb();
