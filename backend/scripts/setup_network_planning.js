const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const schemaPath = path.join(__dirname, "../sql/network_planning_schema.sql");

const defaultFolders = [
  "POP",
  "Sub POP",
  "BTS",
  "Bandwidth Drop BTS",
  "NNI",
  "Office Location",
  "Data Center",
  "Infra Provider",
  "Customer",
];

const customerSubFolders = [
  "Jio",
  "Airtel",
  "Tata",
  "Sify",
  "Vodaphone",
  "JTM Internet",
  "Optimal Telemedia",
  "PGCIL",
  "Railtail",
  "TTSL",
  "RCOM",
  "BSNL",
];

const indianStatesAndUTs = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const infraProviderSubFolders = ["Indus", "Elevor", "Ascend"];

const setup = async () => {
  try {
    console.log("🔌 Connecting to database...");
    // Test connection
    await pool.query("SELECT NOW()");

    console.log("📄 Reading schema file...");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    console.log("🚀 Applying schema...");
    await pool.query(schemaSql);
    console.log("✅ Schema applied successfully.");

    // Seed Folders
    console.log("🌱 Seeding default folders...");

    // Check if root folders exist to avoid duplicates
    // Actually, we can just use "ON CONFLICT DO NOTHING" if we had a unique constraint on (name, parent_id).
    // But we defined simple name.
    // I'll check existence first.

    for (const folderName of defaultFolders) {
      // Check if exists at root (parent_id IS NULL)
      const res = await pool.query(
        "SELECT id FROM network_folders WHERE name = $1 AND parent_id IS NULL",
        [folderName],
      );

      let parentId = null;
      if (res.rows.length === 0) {
        const insertRes = await pool.query(
          "INSERT INTO network_folders (name, parent_id, is_system) VALUES ($1, NULL, TRUE) RETURNING id",
          [folderName],
        );
        parentId = insertRes.rows[0].id;
        console.log(`   + Created root folder: ${folderName}`);
      } else {
        parentId = res.rows[0].id;
        console.log(`   . Root folder exists: ${folderName}`);
      }

      // If it is "Customer", create subfolders
      if (folderName === "Customer") {
        for (const sub of customerSubFolders) {
          const subRes = await pool.query(
            "SELECT id FROM network_folders WHERE name = $1 AND parent_id = $2",
            [sub, parentId],
          );

          if (subRes.rows.length === 0) {
            await pool.query(
              "INSERT INTO network_folders (name, parent_id, is_system) VALUES ($1, $2, TRUE)",
              [sub, parentId],
            );
            console.log(`     + Created subfolder: ${sub}`);
          }
        }
      }

      // If it is "Infra Provider", create subfolders
      if (folderName === "Infra Provider") {
        for (const providerName of infraProviderSubFolders) {
          // 1. Get/Create Provider Folder
          let providerId = null;
          const subRes = await pool.query(
            "SELECT id FROM network_folders WHERE name = $1 AND parent_id = $2",
            [providerName, parentId],
          );

          if (subRes.rows.length === 0) {
            const insertRes = await pool.query(
              "INSERT INTO network_folders (name, parent_id, is_system) VALUES ($1, $2, TRUE) RETURNING id",
              [providerName, parentId],
            );
            providerId = insertRes.rows[0].id;
            console.log(`     + Created provider folder: ${providerName}`);
          } else {
            providerId = subRes.rows[0].id;
            console.log(`     . Provider folder exists: ${providerName}`);
          }

          // 2. Create State/UT folders inside this Provider Folder
          for (const region of indianStatesAndUTs) {
            const regionRes = await pool.query(
              "SELECT id FROM network_folders WHERE name = $1 AND parent_id = $2",
              [region, providerId],
            );

            if (regionRes.rows.length === 0) {
              await pool.query(
                "INSERT INTO network_folders (name, parent_id, is_system) VALUES ($1, $2, TRUE)",
                [region, providerId],
              );
            }
          }
          console.log(`       + Verified/Created regions in ${providerName}`);
        }
      }
    }

    console.log("✅ Setup complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
};

setup();
