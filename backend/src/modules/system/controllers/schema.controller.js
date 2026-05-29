
const { pool } = require("../../../config/database");

/**
 * Get Database Schema Information
 * Returns tables, columns, and foreign key relationships
 */
exports.getDatabaseSchema = async (req, res) => {
  try {
    // 1. Get All Tables
    const [tables] = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // 2. Get All Columns
    const [columns] = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // 3. Get Foreign Keys (Relationships)
    const [foreignKeys] = await pool.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);

    // 4. Get Annotations
    const [annotations] = await pool.query('SELECT table_name, description FROM system_schema_annotations');

    // 5. Construct response object
    const schema = tables.map(table => {
      const annot = annotations.find(a => a.table_name === table.table_name);
      
      const tableColumns = columns.filter(c => c.table_name === table.table_name);
      
      const outgoing = foreignKeys
        .filter(fk => fk.table_name === table.table_name)
        .map(fk => ({
          column: fk.column_name,
          targetTable: fk.foreign_table_name,
          targetColumn: fk.foreign_column_name
        }));

      const incoming = foreignKeys
        .filter(fk => fk.foreign_table_name === table.table_name)
        .map(fk => ({
          sourceTable: fk.table_name,
          sourceColumn: fk.column_name,
          targetColumn: fk.foreign_column_name
        }));

      return {
        name: table.table_name,
        type: table.table_type,
        description: annot ? annot.description : "",
        columns: tableColumns,
        relationships: {
          outgoing,
          incoming
        }
      };
    });

    res.json({
      success: true,
      data: schema
    });

  } catch (error) {
    console.error("Get Database Schema Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch database schema" });
  }
};

/**
 * Update Table Annotation
 */
exports.updateTableAnnotation = async (req, res) => {
  try {
    const { tableName, description } = req.body;

    if (!tableName) {
        return res.status(400).json({ success: false, error: "Table name is required" });
    }

    // Upsert Annotation (PostgreSQL)
    await pool.query(`
      INSERT INTO system_schema_annotations (table_name, description, updated_by, last_updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (table_name) 
      DO UPDATE SET description = EXCLUDED.description, updated_by = EXCLUDED.updated_by, last_updated_at = NOW()
    `, [tableName, description, req.user?.username || 'system']);

    res.json({
      success: true,
      message: "Annotation updated successfully"
    });

  } catch (error) {
    console.error("Update Annotation Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to update annotation" 
    });
  }
};

/**
 * Execute Read-Only SQL Query
 */
exports.executeReadOnlyQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    const trimmedQuery = query.trim();

    // Safety Checks
    // 1. Must start with SELECT
    if (!trimmedQuery.match(/^\s*SELECT\b/i)) {
      return res.status(400).json({ 
        success: false, 
        error: "Only SELECT queries are allowed." 
      });
    }

    // 2. Must not contain destructive keywords
    if (/\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|GRANT|REVOKE|CREATE|REPLACE|EXEC|Show|Explain)\b/i.test(trimmedQuery)) {
        return res.status(400).json({ 
          success: false, 
          error: "Destructive or administrative commands are not allowed."
        });
    }

    // Execute
    const [rows] = await pool.query(trimmedQuery);

    res.json({
      success: true,
      data: rows,
      rowCount: rows.length
    });

  } catch (error) {
    console.error("SQL Run Error:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Query execution failed" 
    });
  }
};
