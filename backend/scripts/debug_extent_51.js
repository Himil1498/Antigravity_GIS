const { pool } = require("../src/config/database");

async function checkData() {
  try {
    console.log("Checking Extent of File 51:");
    const [rows] = await pool.query(`
      SELECT 
        ST_XMin(ST_Extent(geom)) as xmin,
        ST_YMin(ST_Extent(geom)) as ymin,
        ST_XMax(ST_Extent(geom)) as xmax,
        ST_YMax(ST_Extent(geom)) as ymax,
        COUNT(*) as count
      FROM network_features
      WHERE file_id = 51
    `);
    console.log(JSON.stringify(rows[0], null, 2));

    console.log("\nChecking Sample Coordinates:");
    const [samples] = await pool.query(`
      SELECT ST_AsText(geom) as wkt
      FROM network_features
      WHERE file_id = 51
      LIMIT 5
    `);
    console.log(JSON.stringify(samples, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkData();
