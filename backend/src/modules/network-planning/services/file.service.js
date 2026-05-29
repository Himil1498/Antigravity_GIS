const { pool } = require("../../../config/database");
const catalogService = require("./catalog.service");
const { logAudit } = require("../../audit/audit.service");

class FileService {
  /**
   * Get single file details
   */
  async getFile(fileId) {
    const query = `
      SELECT f.*, 
        (SELECT ST_Extent(ST_Transform(geom, 4326))::text FROM network_features WHERE file_id = f.id AND deleted_at IS NULL) as bounds
      FROM network_files f 
      WHERE f.id = $1 AND f.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query, [fileId]);
    return rows[0];
  }

  /**
   * Get all files flat list (for global map view selector)
   * Now applies RBAC filtering: non-admins only see files in their assigned folders
   */
  async getAllFiles(userId, role) {
    const isAdmin = role === "admin" || role === "Admin";

    if (isAdmin) {
      // Admin sees everything
      const query = `
          SELECT f.id, f.name, f.folder_id, fd.name as folder_name, 
                 pf.name as parent_folder_name, f.icon_type, f.feature_count 
          FROM network_files f 
          LEFT JOIN network_folders fd ON f.folder_id = fd.id 
          LEFT JOIN network_folders pf ON fd.parent_id = pf.id
          WHERE f.deleted_at IS NULL AND (fd.deleted_at IS NULL OR fd.id IS NULL)
          ORDER BY fd.name NULLS FIRST, f.name
      `;
      const [rows] = await pool.query(query);
      return rows;
    }

    // Non-admin: apply RBAC - only files in accessible folders
    let roleFolderIds = [];
    try {
      const [roleRows] = await pool.query("SELECT default_folder_ids FROM roles WHERE name = $1", [role]);
      if (roleRows.length > 0 && Array.isArray(roleRows[0].default_folder_ids)) {
        roleFolderIds = roleRows[0].default_folder_ids;
      }
    } catch (e) {
      console.error("Failed to fetch role folders for getAllFiles", e);
    }

    const roleIdsString = roleFolderIds.length > 0 ? roleFolderIds.join(',') : null;
    const roleUnion = roleIdsString
      ? `UNION SELECT nf.id, nf.parent_id FROM network_folders nf WHERE nf.id IN (${roleIdsString})`
      : "";

    const query = `
        WITH RECURSIVE 
        assigned_base AS (
          SELECT nf.id, nf.parent_id
          FROM network_folders nf
          JOIN user_folder_access ufa ON nf.id = ufa.folder_id
          WHERE ufa.user_id = $1 AND nf.deleted_at IS NULL
          ${roleUnion}
        ),
        descendants AS (
          SELECT id, parent_id FROM assigned_base
          UNION
          SELECT c.id, c.parent_id FROM network_folders c JOIN descendants d ON d.id = c.parent_id WHERE c.deleted_at IS NULL
        ),
        visible_folders AS (
          SELECT id FROM descendants
        )
        SELECT f.id, f.name, f.folder_id, fd.name as folder_name, 
               pf.name as parent_folder_name, f.icon_type, f.feature_count 
        FROM network_files f 
        LEFT JOIN network_folders fd ON f.folder_id = fd.id 
        LEFT JOIN network_folders pf ON fd.parent_id = pf.id
        WHERE (f.folder_id IN (SELECT id FROM visible_folders) OR f.folder_id IS NULL)
        AND f.deleted_at IS NULL AND (fd.deleted_at IS NULL OR fd.id IS NULL)
        ORDER BY fd.name NULLS FIRST, f.name
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(folderId, files, userId, iconType = "layer-group") {
    const client = await pool.getConnection();
    const processingTasks = []; // Collect tasks to run after commit

    try {
      await client.query("BEGIN");
      const uploadedFiles = [];

      for (const file of files) {
        // 1. Save metadata
        const insertQuery = `
          INSERT INTO network_files (folder_id, name, file_type, storage_path, size_bytes, uploaded_by, metadata, icon_type, processing_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'processing')
          RETURNING *;
        `;
        const metadata = {
          originalname: file.originalname,
          mimetype: file.mimetype,
        };
        const fileType = require("path")
          .extname(file.originalname)
          .substring(1)
          .toLowerCase();

        const [rows] = await client.query(insertQuery, [
          folderId,
          file.originalname,
          fileType,
          file.path,
          file.size,
          userId,
          metadata,
          iconType,
        ]);
        const fileRecord = rows[0];
        uploadedFiles.push(fileRecord);

        // Queue task
        processingTasks.push({ record: fileRecord, path: file.path });
      }

      await client.query("COMMIT");

      // 3. Process KML/KMZ Asynchronously AFTER Commit
      // This guarantees the row exists for the background worker
      processingTasks.forEach((task) => {
        this.processKmlFile(task.record, task.path).catch((err) =>
          console.error("Async KML processing error:", err),
        );
      });

      // 4. Audit Log
      for (const file of uploadedFiles) {
        await logAudit(
          userId,
          "Uploaded file: " + file.name,
          "FILE_UPLOADED",
          file.id,
          { file_name: file.name, size: file.size_bytes, folder_id: folderId },
          null, // req is not passed easily here, could just be null
          "SUCCESS"
        ).catch(err => console.error("Audit log failed:", err));
      }

      return uploadedFiles;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Upload transaction failed", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Modified to handle its own connection and update status
  // Modified to use Worker Threads for non-blocking processing
  async processKmlFile(fileRecord, filePath) {
    return new Promise((resolve, reject) => {
      const { Worker } = require("worker_threads");
      const path = require("path");

      const workerPath = path.resolve(
        __dirname,
        "../../../workers/kmlWorker.js",
      );

      const worker = new Worker(workerPath, {
        workerData: {
          fileRecord: fileRecord,
          filePath: filePath,
        },
      });

      worker.on("message", (msg) => {
        if (msg.success) {
          console.log(`Worker completed processing ${fileRecord.name}`);
          catalogService.invalidateCache('catalog:*').catch(console.error);
          resolve(msg);
        } else {
          console.error(
            `Worker failed processing ${fileRecord.name}:`,
            msg.error,
          );
          reject(new Error(msg.error));
        }
      });

      worker.on("error", (err) => {
        console.error("Worker thread error:", err);
        reject(err);
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async deleteFile(fileId, userId) {
    const client = await pool.getConnection();

    try {
      await client.query("BEGIN");

      // 1. Get file info first (within transaction)
      const result = await client.query(
        "SELECT id FROM network_files WHERE id = $1 FOR UPDATE",
        [fileId],
      );
      // Safe destructuring: handle both [rows, fields] (wrapper) and {rows} (pg)
      const fileRows = Array.isArray(result) ? result[0] : result.rows;

      if (!fileRows || fileRows.length === 0) {
        throw new Error("File not found");
      }

      // 2. Soft-delete in database
      await client.query("UPDATE network_files SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2", [userId, fileId]);

      // 3. Commit transaction
      await client.query("COMMIT");
      catalogService.invalidateCache('catalog:*').catch(console.error);

      // 4. Audit Log
      await logAudit(
        userId,
        "Deleted file ID: " + fileId,
        "FILE_DELETED",
        fileId,
        { file_id: fileId },
        null,
        "SUCCESS"
      ).catch(err => console.error("Audit log failed:", err));

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to delete file:", error);
      throw error;
    } finally {
      client.release();
    }

    return { success: true };
  }

  /**
   * Get paginated features for a file
   */
  async getFileFeatures(fileId, page = 1, limit = 50, search = "", sortBy = "id", sortOrder = "ASC") {
    const offset = (page - 1) * limit;
    const client = await pool.getConnection();

    try {
      // Base Query
      let query = `
        SELECT 
          id, 
          ST_AsGeoJSON(ST_Transform(geom, 4326))::json as geometry, 
          properties, 
          created_at 
        FROM network_features 
        WHERE file_id = $1 AND deleted_at IS NULL
      `;
      const params = [fileId];

      // Search Logic (Search within JSONB properties, IDs, Dates, and Geometry Type)
      if (search) {
        query += ` AND (
          properties::text ILIKE $${params.length + 1} 
          OR properties->>'name' ILIKE $${params.length + 1}
          OR id::text ILIKE $${params.length + 1}
          OR ST_GeometryType(geom) ILIKE $${params.length + 1}
          OR created_at::text ILIKE $${params.length + 1}
        )`;
        params.push(`%${search}%`);
      }

      // Helper to safely extract rows from various driver response formats
      const extractRows = (res) => {
        if (!res) return [];
        let rows = [];
        // If it's [rows, fields] (wrapper) or [undefined, fields]
        if (Array.isArray(res)) {
          // Ensure first element is an array before returning it
          if (res.length > 0 && Array.isArray(res[0])) {
            rows = res[0];
          } else {
            // If direct array of rows
            rows = res;
          }
        } else {
          // If it's PG Result object { rows: [...] }
          rows = res?.rows || [];
        }
        // Strongly filter out null/undefined rows to prevent UI and logic issues
        return rows.filter((r) => r !== null && r !== undefined);
      };

      // Count Query
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
      const countResult = await client.query(countQuery, params);
      const countRows = extractRows(countResult);

      console.log("🔢 Count Result:", JSON.stringify(countResult));
      console.log("🔢 Count Rows:", JSON.stringify(countRows));

      let total = 0;
      if (countRows.length > 0 && countRows[0]) {
        // Handle various case/type possibilities
        const row = countRows[0];
        const rawTotal = row.total || row.TOTAL || row.count || row.COUNT;
        total = rawTotal ? parseInt(rawTotal) : 0;
      }

      // Dynamic Sort Logic
      const validSortOrders = ['ASC', 'DESC'];
      const order = validSortOrders.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';
      
      let orderByClause = "id";
      if (sortBy && sortBy !== 'id') {
         if (sortBy === 'type') {
            orderByClause = "ST_GeometryType(geom)";
         } else if (sortBy === 'created_at') {
            orderByClause = "created_at";
         } else {
            // Treat as JSONB property key, cast to text for reliable sorting
            orderByClause = `properties->>'${sortBy}'`;
         }
      }

      // Final Data Query
      query += ` ORDER BY ${orderByClause} ${order} NULLS LAST LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`;
      // Ensure Limit and Offset are Integers
      params.push(parseInt(limit), parseInt(offset));

      const result = await client.query(query, params);
      const rows = extractRows(result);

      // Smart Correction: If Total is 0 but we have rows, infer total
      if (total === 0 && rows.length > 0) {
        console.warn(
          "⚠️ Count query returned 0 but data rows exist. Inferring total.",
        );
        // If we have rows, total is at least (page-1)*limit + rows.length
        const inferred = (parseInt(page) - 1) * parseInt(limit) + rows.length;
        // If we received less than limit, we know exact total.
        // If we received full limit, total is likely more, but let's at least show what we have.
        total = Math.max(total, inferred);
      }

      return {
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (e) {
      console.error("❌ Error in getFileFeatures:", e);
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new FileService();
