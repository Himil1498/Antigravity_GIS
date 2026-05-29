const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "opticonnect_gis_db",
};

const pool = new Pool(config);

async function runMigration() {
  try {
    console.log(`Connecting to database: ${config.database}...`);

    const sqlPath = path.join(
      __dirname,
      "../sql/04_feasibility_workflow_updates.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Running SQL update...");
    await pool.query(sql);

    console.log("SUCCESS: Feasibility schema updated.");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
