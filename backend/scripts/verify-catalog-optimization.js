require("dotenv").config({ path: "../.env" });
const catalogService = require("../src/modules/network-planning/services/catalog.service");
const { pool } = require("../src/config/database");

const verify = async () => {
  try {
    console.log("🧪 Verifying Catalog Service Optimization...");

    // Mock user ID (assuming admin or existing user)
    const userId = 1;

    // 1. Test Global Catalog (No Region)
    console.log("\n--- Test 1: Global Catalog (No Region) ---");
    const globalCatalog = await catalogService.getUnifiedCatalog(userId, null);
    console.log(
      `✅ Global Infrastruture Roots: ${globalCatalog.infrastructure.length}`,
    );
    console.log(`✅ Global Customer Roots: ${globalCatalog.customers.length}`);

    // 2. Test Region Filtered Catalog (Assuming Region ID 1 exists, if not usage a dummy)
    // We'll usage a region ID that likely exists or 9999 to test empty
    console.log("\n--- Test 2: Region Filtered Catalog (Region 1) ---");
    const regionCatalog = await catalogService.getUnifiedCatalog(userId, [1]);
    console.log(
      `✅ Region Infrastruture Roots: ${regionCatalog.infrastructure.length}`,
    );

    // Check if any feature counts are returned
    const inspectCounts = (items) => {
      let total = 0;
      items.forEach((item) => {
        total += item.featureCount;
        if (item.children) total += inspectCounts(item.children);
      });
      return total;
    };

    const infraCounts = inspectCounts(regionCatalog.infrastructure);
    console.log(`✅ Total Feature Count in Region View: ${infraCounts}`);

    console.log("\n🎉 Verification successful: Query executed without errors.");
  } catch (err) {
    console.error("❌ Verification failed:", err);
  } finally {
    pool.end();
  }
};

verify();
