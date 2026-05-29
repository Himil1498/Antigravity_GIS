const axios = require("axios");
require("dotenv").config({ path: "../../.env" });

const API_URL = "http://localhost:82/api";
// Default Admin Credentials (adjust if changed in your env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@opticonnect.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const testUser = {
  username: `PermTestUser_${Date.now()}`,
  full_name: `Permission Tester`,
  email: `permtest_${Date.now()}@test.com`,
  password: "Password123!",
  role: "user", // Basic user
  employee_id: `TEST${Date.now()}`,
  phone: "1234567890",
  designation: "Tester",
  department: "QA",
};

const permissionsToAssign = [
  "map:view",
  "map:tools:distance", // Granular
  "network:view",
  "network:infra:items", // Key for folders
];

async function runTest() {
  console.log("🚀 Starting Permission System Verification...");
  let adminToken = "";
  let userId = null;

  try {
    // 1. Login as Admin
    console.log("🔑 Logging in as Admin...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    adminToken = loginRes.data.token;
    console.log("✅ Admin logged in.");

    // 2. Create Test User
    console.log(`👤 Creating test user: ${testUser.email}...`);
    const createRes = await axios.post(`${API_URL}/users`, testUser, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    userId = createRes.data.user.id;
    const numericId = userId; // Assuming it returns numeric ID based on postgres setup, or handle string if needed
    console.log(`✅ User created. ID: ${userId}`);

    // 3. Assign Permissions
    console.log("🛡️ Assigning permissions...");
    await axios.put(
      `${API_URL}/users/${userId}/permissions`,
      { permissions: permissionsToAssign },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("✅ Permissions assigned.");

    // 4. Activate User (Testing the new PATCH endpoint)
    console.log("⚡ Activating user via PATCH...");
    await axios.patch(
      `${API_URL}/users/${userId}/activate`,
      { is_active: true },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("✅ User activated.");

    // 5. Verify Permissions Persistence
    console.log("🔍 Verifying permissions persistence...");
    const permRes = await axios.get(`${API_URL}/users/${userId}/permissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const userDirectPerms = permRes.data.data.direct || [];
    const missingPerms = permissionsToAssign.filter(
      (p) => !userDirectPerms.includes(p),
    );

    if (missingPerms.length === 0) {
      console.log(
        "✅ SUCCESS: All assigned permissions were persisted and returned correctly.",
      );
    } else {
      console.error("❌ FAILURE: Missing permissions:", missingPerms);
      console.log("Returned:", userDirectPerms);
    }

    // 6. Verify Activation Status
    const userRes = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const userData = userRes.data.data || userRes.data.user || userRes.data;
    if (userData && userData.is_active === true) {
      console.log("✅ SUCCESS: User is active.");
    } else {
      console.error("❌ FAILURE: User is NOT active.", userData);
    }
  } catch (error) {
    console.error(
      "❌ Test Failed:",
      error.response
        ? { status: error.response.status, data: error.response.data }
        : error.message,
    );
    if (error.code) console.error("Error Code:", error.code);
  } finally {
    // 7. Cleanup
    if (userId) {
      console.log("🧹 Cleaning up (Deleting test user)...");
      try {
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log("✅ Cleanup complete.");
      } catch (cleanupErr) {
        console.error("⚠️ Cleanup failed:", cleanupErr.message);
      }
    }
  }
}

runTest();
