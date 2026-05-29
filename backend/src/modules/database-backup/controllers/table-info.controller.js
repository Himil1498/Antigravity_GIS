const { pool } = require("../../../config/database");

const getDatabaseSchema = async (req, res) => {
  try {
    // 1. Get all tables in the public schema
    const [tables] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name ASC"
    );

    const tableNames = tables.map((t) => t.table_name);

    // 2. Get foreign keys mapping (PostgreSQL syntax)
    const fkQuery = `
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `;

    const [fks] = await pool.query(fkQuery);

    // 3. Format the dependency graph
    const schemaMap = tableNames.map((tableName) => {
      // Tables THIS table depends on (Outgoing FKs) - e.g., features depends on region_id
      const dependsOn = fks
        .filter((fk) => fk.table_name === tableName)
        .map((fk) => fk.foreign_table_name);

      // Tables that depend on THIS table (Incoming FKs) - e.g., user_regions depends on users
      const referencedBy = fks
        .filter((fk) => fk.foreign_table_name === tableName)
        .map((fk) => fk.table_name);

      return {
        tableName,
        // use Set to remove duplicates if multiple FKs point to the same table
        dependsOn: [...new Set(dependsOn)],
        referencedBy: [...new Set(referencedBy)],
      };
    });

    res.json({
      success: true,
      data: schemaMap,
    });
  } catch (error) {
    console.error("Get database schema error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve database schema",
      error: error.message,
    });
  }
};

module.exports = {
  getDatabaseSchema,
};
