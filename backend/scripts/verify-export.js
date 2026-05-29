const path = require("path");
// Ensure we are in the right directory context if needed, but requiring from absolute paths relative to script location is safer.

// Load Environment Variables manually to ensure connection works
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { pool } = require("../src/config/database");
const exportService = require("../src/modules/network-planning/services/export.service");

async function runTest() {
  console.log("--- Starting Export Feature Verification ---");

  let client;
  try {
    // NOTE: pool.getConnection returns a wrapped client where .query returns [rows, fields]
    client = await pool.getConnection();

    // 1. Get Admin User
    const [userRows] = await client.query(
      "SELECT id, username FROM users WHERE role = 'admin' LIMIT 1",
    );
    const user = userRows[0];
    if (!user) throw new Error("No admin user found");
    const userId = user.id;
    console.log(`Found Test User: ${user.username} (ID: ${userId})`);

    // 2. Get a Folder (Preferably one with files)
    // Try to find a folder that actually has files first
    const [folderRows] = await client.query(`
        SELECT f.id, f.name, COUNT(nf.id) as file_count 
        FROM network_folders f
        JOIN network_files nf ON f.id = nf.folder_id
        GROUP BY f.id, f.name
        ORDER BY file_count DESC
        LIMIT 1
     `);

    let folderId = folderRows[0]?.id;
    let folderName = folderRows[0]?.name;

    if (!folderId) {
      // Fallback to any folder
      const [anyFolderRows] = await client.query(
        "SELECT id, name FROM network_folders LIMIT 1",
      );
      folderId = anyFolderRows[0]?.id;
      folderName = anyFolderRows[0]?.name;
    }

    console.log(`Found Test Folder: ${folderName} (ID: ${folderId || "None"})`);

    // --- SCENARIO 1: Global Live Inventory ---
    console.log("\n[Test 1] Export Global Live Inventory (KML)...");
    const res1 = await exportService.exportCombinedData({
      folderId,
      userId,
      includeLiveInventory: true,
      format: "kml",
    });
    console.log(
      `✅ Success! Filename: ${res1.filename}, Type: ${res1.contentType}, Size: ${res1.buffer.length} bytes`,
    );
    const preview1 = res1.buffer
      .toString()
      .substring(0, 150)
      .replace(/(\r\n|\n|\r)/gm, "");
    console.log(`   Preview: ${preview1}...`);

    // --- SCENARIO 2: Global Approved ---
    console.log("\n[Test 2] Export Global Approved Data (KML)...");
    const res2 = await exportService.exportCombinedData({
      folderId,
      userId,
      includeApproved: true,
      format: "kml",
    });
    console.log(
      `✅ Success! Filename: ${res2.filename}, Type: ${res2.contentType}, Size: ${res2.buffer.length} bytes`,
    );

    // --- SCENARIO 3: Recursive Folder ---
    if (folderId) {
      console.log(
        `\n[Test 3] Export Folder Context (Recursive) for '${folderName}'...`,
      );
      const res3 = await exportService.exportCombinedData({
        folderId,
        userId,
        includeCurrentFolder: true,
        format: "kml",
      });
      console.log(
        `✅ Success! Filename: ${res3.filename}, Type: ${res3.contentType}, Size: ${res3.buffer.length} bytes`,
      );
      const preview3 = res3.buffer
        .toString()
        .substring(0, 150)
        .replace(/(\r\n|\n|\r)/gm, "");
      console.log(`   Preview: ${preview3}...`);
    }

    // --- SCENARIO 4: KMZ Format ---
    console.log("\n[Test 4] Export Combined Data as KMZ...");
    const res4 = await exportService.exportCombinedData({
      folderId,
      userId,
      includeApproved: true,
      includeLiveInventory: true,
      format: "kmz",
    });
    console.log(
      `✅ Success! Filename: ${res4.filename}, Type: ${res4.contentType}, Size: ${res4.buffer.length} bytes`,
    );
    // KMZ is binary (zip), converts to weird string if printed, but checking "PK" header is good
    const isZip = res4.buffer.toString("hex").startsWith("504b0304");
    console.log(`   Is Valid Zip Header (PK...)? ${isZip ? "YES" : "NO"}`);

    console.log("\n-----------------------------------");
    console.log("   VERIFICATION STRONGLY PASSED");
    console.log("-----------------------------------");
  } catch (err) {
    console.error("\n❌ VERIFICATION FAILED");
    console.error(err);
    process.exit(1);
  } finally {
    if (client) client.release();
    process.exit(0);
  }
}

runTest();
