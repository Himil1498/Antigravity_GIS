const { pool } = require("../src/config/database");

async function checkStatus() {
  try {
    const REQUEST_ID = 4;
    console.log(`🔍 Checking status for Request ID: ${REQUEST_ID}`);

    // 1. Get Request Details
    const [requests] = await pool.query(
      "SELECT * FROM region_requests WHERE id = ?",
      [REQUEST_ID],
    );

    if (requests.length === 0) {
      console.log("❌ Request not found.");
      return;
    }

    const req = requests[0];
    console.log("📄 Request Details:", {
      id: req.id,
      user_id: req.user_id,
      region_id: req.region_id,
      status: req.status,
    });

    // 2. Check User Access
    const [access] = await pool.query(
      "SELECT * FROM user_regions WHERE user_id = ? AND region_id = ?",
      [req.user_id, req.region_id],
    );

    if (access.length > 0) {
      console.log("✅ User HAS Access in user_regions:", access[0]);
    } else {
      console.log("❌ User DOES NOT HAVE Access in user_regions.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit();
  }
}

checkStatus();
