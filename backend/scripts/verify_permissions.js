const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

// Configuration
const DB_CONFIG = {
  host: "localhost",
  user: "postgres",
  password: "Optimal@123",
  database: "opticonnect_gis_db",
  port: 5433,
};
const API_URL = "http://localhost:82/api";
const JWT_SECRET =
  "2LNI6aVWG3CDaEe8MCaygTZsNXjL4JDnCC5rqBxfXwV1BXxqNciC67n9iqJm8nr6GT8ZK9HHaJskgulHw1OU6w==";

const ADMIN_ID = 1;
const TEST_USER_ID = 6; // User Role

const pool = new Pool(DB_CONFIG);

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
};

const runTest = async () => {
  console.log("🚀 Starting Permission Verification...");

  try {
    // 1. Get a Folder ID
    const folderRes = await pool.query(
      "SELECT id, name FROM network_folders LIMIT 1",
    );
    if (folderRes.rows.length === 0) {
      console.error("❌ No folders found in DB. Create one manually first.");
      process.exit(1);
    }
    const folder = folderRes.rows[0];
    console.log(`📂 Using Folder: ${folder.name} (ID: ${folder.id})`);

    // 2. Insert Dummy Sessions
    console.log("🔄 Creating Test Sessions...");

    await pool.query("DELETE FROM user_sessions WHERE user_id IN ($1, $2)", [
      ADMIN_ID,
      TEST_USER_ID,
    ]); // Clean up

    // Use Postgres Time
    await pool.query(
      `INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent) 
        VALUES ($1, $2, NOW() + INTERVAL '24 hours', $3, $4)`,
      [ADMIN_ID, "dummy_admin_token", "127.0.0.1", "TestAgent"],
    );

    await pool.query(
      `INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent) 
        VALUES ($1, $2, NOW() + INTERVAL '24 hours', $3, $4)`,
      [TEST_USER_ID, "dummy_user_token", "127.0.0.1", "TestAgent"],
    );

    // Verify insertion
    const sessionCount = await pool.query(
      "SELECT count(*) FROM user_sessions WHERE user_id IN ($1, $2)",
      [ADMIN_ID, TEST_USER_ID],
    );
    console.log(`✅ Sessions inserted: ${sessionCount.rows[0].count}`);

    // 3. Generate Tokens (Must match user_id)
    const adminToken = jwt.sign({ id: ADMIN_ID, role: "admin" }, JWT_SECRET, {
      expiresIn: "24h",
    });
    const userToken = jwt.sign({ id: TEST_USER_ID, role: "user" }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // 3a. Sanity Check: GET User
    console.log("🔄 [Admin] Sanity Check (GET User 1)...");
    const sanityRes = await fetch(`${API_URL}/users/${ADMIN_ID}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Sanity Check Status: ${sanityRes.status}`);
    if (!sanityRes.ok) console.error(await sanityRes.text());

    // 4. Admin: Assign Folder Access to User
    console.log("🔄 [Admin] Assigning Folder Access...");
    const assignRes = await fetch(`${API_URL}/users/${TEST_USER_ID}/folders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId: folder.id,
        access: { can_read: true },
      }),
    });

    console.log(`Assignment Status: ${assignRes.status}`);
    if (!assignRes.ok) {
      console.error("❌ Assignment Failed:", await assignRes.text());
    } else {
      console.log("✅ Access Assigned");
    }

    // 4. User: Fetch Catalog (Restricted)
    console.log("🔄 [User] Fetching Catalog...");
    const userCatRes = await fetch(
      `${API_URL}/network-planning/catalog?userId=${TEST_USER_ID}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    if (!userCatRes.ok) throw new Error(await userCatRes.text());
    const userCat = await userCatRes.json();
    console.log("Catalog Response Type:", typeof userCat.data);
    if (Array.isArray(userCat.data)) {
      console.log("Catalog Data Length:", userCat.data.length);
    } else {
      console.log(
        "Catalog Data structure:",
        JSON.stringify(userCat.data, null, 2).substring(0, 200) + "...",
      );
    }

    // Logic: User should see at least this folder.
    // getUnifiedCatalog returns Tree or Flat list? It returns a Tree/List depending on CTE.
    // My service returns `SELECT * FROM folder_tree`.
    // It should include our folder.
    // Logic: Flatten the categorized object { infrastructure: [], customer: [] }
    const allFolders = Object.values(userCat.data).flat();
    console.log(`Found ${allFolders.length} folders in catalog.`);

    const hasFolder = allFolders.some((f) => f.id === folder.id);
    if (hasFolder) {
      console.log("✅ [User] Can see assigned folder.");
    } else {
      console.error(
        "❌ [User] Cannot see assigned folder!",
        // Log IDs explicitly
        allFolders.map((f) => f.id),
      );
    }

    // 5. Admin: Fetch Catalog (Full)
    console.log("🔄 [Admin] Fetching Catalog...");
    const adminCatRes = await fetch(`${API_URL}/network-planning/catalog`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminCat = await adminCatRes.json();
    const adminFolders = Object.values(adminCat.data).flat();
    console.log(`✅ [Admin] Sees ${adminFolders.length} folders.`);

    // 6. User: Permissions (Direct)
    console.log("🔄 [User] Fetching Permissions...");
    const permRes = await fetch(
      `${API_URL}/users/${TEST_USER_ID}/permissions`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    const perms = await permRes.json();
    console.log(`✅ User Permissions (Direct):`, perms.data.direct);
    console.log(`✅ User Permissions (Role):`, perms.data.role);
  } catch (err) {
    console.error("❌ Test Failed:", err);
  } finally {
    await pool.end();
  }
};

runTest();
