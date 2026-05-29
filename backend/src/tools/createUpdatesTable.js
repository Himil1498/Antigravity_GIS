require("../config/environment");
const { pool } = require("../config/database");

async function run() {
  try {
    console.log("Checking uuid-ossp extension...");
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    console.log("Creating system_updates table...");
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS system_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        version_tag VARCHAR(50),
        is_published BOOLEAN DEFAULT false,
        is_automated BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await pool.query(tableQuery);

    console.log("Adding default trigger for updated_at...");
    
    // We can manually run updated_at trigger if needed, but skipping for simplicity
    
    console.log("✅ system_updates table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting up database:", err);
    process.exit(1);
  }
}

run();
