const { pool } = require("../../config/database");
const xlsx = require("xlsx");

/**
 * Safe list of tables allowed for export
 * Excludes system tables or sensitive internal tables if any
 */
const SAFE_TABLES = [
  "users",
  "roles",
  "permissions", // View for user_permissions if needed, or actual tables
  "system_permissions",
  "regions",
  "network_towers", // Check actual table name
  "fiber_cables",   // Check actual table name -> fiber_links?
  "audit_logs",
  "api_performance_logs",
  "bookmarks",
  "circle_drawings",
  "drawings",
  "polygon_drawings",
  "polyline_drawings",
  "feature_collections",
  "groups",
  "group_members",
  "layers",
  "network_files",
  "network_folders",
  "notifications",
  "user_map_preferences",
  "reports",
  "search_history"
];

// Helper to get actual tables from DB to ensure we match correct names
const getDBTables = async () => {
    const [rows] = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    return rows.map(r => r.table_name);
};

/**
 * Fetch Database Tables List
 * GET /api/admin/export/tables
 */
exports.getExportableTables = async (req, res) => {
  try {
    const allTables = await getDBTables();
    const tablesToExport = allTables.filter(t => !t.startsWith('pg_'));
    res.json({ success: true, data: tablesToExport });
  } catch (error) {
    console.error("Fetch Exportable Tables Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tables" });
  }
};

/**
 * Export Database Tables to Excel
 * GET /api/admin/export/database?table=all|tableName
 */
exports.exportDatabase = async (req, res) => {
  try {
    const { table } = req.query;
    const requestedTable = table || 'all';
    
    // Get all valid tables from DB to cross-reference
    const allTables = await getDBTables();
    
    // Filtering logic
    let tablesToExport = [];
    if (requestedTable === 'all') {
        // Export all tables found in DB (excluding implementation details if necessary)
        // For now, we trust the DB list but maybe exclude migrations/sequalize meta if any
        tablesToExport = allTables.filter(t => !t.startsWith('pg_')); 
    } else {
        if (!allTables.includes(requestedTable)) {
            return res.status(400).json({ success: false, error: `Table '${requestedTable}' not found` });
        }
        tablesToExport = [requestedTable];
    }

    // Create Workbook
    const workbook = xlsx.utils.book_new();
    
    // Fetch and add sheets
    // Generate Sheets
    for (const tableName of tablesToExport) {
        // Query Data
        // Limit to 50000 rows per table for safety
        const [rows] = await pool.query(`SELECT * FROM "${tableName}" LIMIT 50000`);
        
        if (rows.length > 0) {
            // Sanitize data for Excel limits (max 32767 chars per cell)
            const sanitizedRows = rows.map(row => {
                const newRow = {};
                for (const [key, value] of Object.entries(row)) {
                    if (value === null || value === undefined) {
                        newRow[key] = "";
                    } else if (typeof value === 'string') {
                        if (value.length > 32000) {
                            newRow[key] = value.substring(0, 32000) + "...(TRUNCATED)";
                        } else {
                            newRow[key] = value;
                        }
                    } else if (typeof value === 'object') {
                        // Convert objects/arrays to string
                        try {
                            const str = JSON.stringify(value);
                            if (str.length > 32000) {
                                newRow[key] = str.substring(0, 32000) + "...(TRUNCATED)";
                            } else {
                                newRow[key] = str;
                            }
                        } catch (e) {
                            newRow[key] = "[Complex Data]";
                        }
                    } else {
                        newRow[key] = value;
                    }
                }
                return newRow;
            });

            // Convert to Sheet
            const worksheet = xlsx.utils.json_to_sheet(sanitizedRows);
            
            // Add to Workbook (Sheet name max 31 chars in Excel)
            const sheetName = tableName.substring(0, 31);
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        } else {
            // Add empty sheet
            const worksheet = xlsx.utils.json_to_sheet([{ info: "No data found" }]);
            const sheetName = tableName.substring(0, 31);
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
    }

    // Generate Buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Send Response
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = requestedTable === 'all' 
        ? `database_export_${dateStr}.xlsx` 
        : `${requestedTable}_export_${dateStr}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);

  } catch (error) {
    console.error("Database Export Error:", error);
    res.status(500).json({ success: false, error: "Failed to export database" });
  }
};
