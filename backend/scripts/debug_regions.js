const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const catalogService = require("../src/modules/network-planning/services/catalog.service");
const { rawPool } = require("../src/config/database");

// Helper to calculate Tile X/Y
function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
}

async function debugRegions() {
  try {
    const REGION_ID = 7; // Gujarat
    const Z = 10;

    console.log("🔍 Finding a valid feature in Gujarat...");

    // Get a feature inside Gujarat
    const query = `
      SELECT 
        ST_X(ST_Transform(nf.geom, 4326)) as lon,
        ST_Y(ST_Transform(nf.geom, 4326)) as lat
      FROM network_features nf
      INNER JOIN region_boundaries rb ON rb.region_id = $1
      WHERE ST_Intersects(
        CASE 
          WHEN ST_SRID(nf.geom) = 4326 THEN nf.geom 
          ELSE ST_Transform(nf.geom, 4326) 
        END, 
        rb.geom
      )
      AND nf.deleted_at IS NULL
      LIMIT 1
    `;

    const res = await rawPool.query(query, [REGION_ID]);

    if (res.rows.length === 0) {
      console.log("❌ No features found in Gujarat!");
      return;
    }

    const { lon, lat } = res.rows[0];
    console.log(`✅ Found Feature at: ${lat}, ${lon}`);

    const x = long2tile(lon, Z);
    const y = lat2tile(lat, Z);
    console.log(`📍 Calculated Tile: Z=${Z}, X=${x}, Y=${y}`);

    console.log("\n🔍 Testing getVectorTiles...");

    // 1. Gujarat Tile WITH Region Filer
    console.log(`\nTEST 1: Tile (${Z}/${x}/${y}) WITH region=${REGION_ID}`);
    const t1 = await catalogService.getVectorTiles(
      Z,
      x,
      y,
      null,
      [REGION_ID],
      null,
    );
    console.log(`Result: ${t1 ? t1.length + " bytes" : "NULL"}`);

    // 2. Bangalore Tile WITH Region Filter (Should be Empty)
    // Use hardcoded Bangalore
    const bang_x = long2tile(77.5, Z);
    const bang_y = lat2tile(12.9, Z);

    console.log(
      `\nTEST 2: Bangalore Tile (${Z}/${bang_x}/${bang_y}) WITH region=${REGION_ID}`,
    );
    const t2 = await catalogService.getVectorTiles(
      Z,
      bang_x,
      bang_y,
      null,
      [REGION_ID],
      null,
    );
    console.log(`Result: ${t2 ? t2.length + " bytes" : "NULL (Expected)"}`);

    // 3. Global Tile (Same coords as Test 1)
    console.log(`\nTEST 3: Tile (${Z}/${x}/${y}) Global (No Region Filter)`);
    const t3 = await catalogService.getVectorTiles(Z, x, y, null, null, null);
    console.log(`Result: ${t3 ? t3.length + " bytes" : "NULL"}`);

    if (t1 && t3) {
      console.log(
        `\n✅ Data Validation: Region filtered size: ${t1.length}, Global size: ${t3.length}`,
      );
      if (t1.length === t3.length) {
        console.log(
          "ℹ️ Sizes are identical (Expected if all data in this tile belongs to Gujarat)",
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

debugRegions();
