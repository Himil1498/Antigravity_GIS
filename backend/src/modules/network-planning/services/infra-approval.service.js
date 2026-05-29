const { rawPool: pool } = require("../../../config/database");

class InfraApprovalService {
  /**
   * Submit infrastructure for approval (PM action)
   */
  async submit(userId, payload) {
    const { folderId, name, latitude, longitude, properties, iconType } = payload;

    const result = await pool.query(
      `INSERT INTO infra_approvals 
        (folder_id, submitted_by, status, form_data, created_at, updated_at)
       VALUES ($1, $2, 'pending_planned', $3, NOW(), NOW())
       RETURNING id`,
      [
        folderId,
        userId,
        JSON.stringify({
          name,
          latitude,
          longitude,
          properties,
          iconType: iconType || "DEFAULT",
        }),
      ]
    );

    return { success: true, approvalId: result.rows[0].id };
  }

  /**
   * List pending approvals for BM (pending_planned + pending_active)
   */
  async listPending() {
    const result = await pool.query(
      `SELECT 
        ia.*,
        u.username AS submitted_by_name,
        u.full_name AS submitted_by_full_name,
        nf.name AS folder_name,
        -- Build folder path
        (
          WITH RECURSIVE folder_path AS (
            SELECT id, name, parent_id, 1 AS depth
            FROM network_folders WHERE id = ia.folder_id
            UNION ALL
            SELECT nf2.id, nf2.name, nf2.parent_id, fp.depth + 1
            FROM network_folders nf2
            JOIN folder_path fp ON nf2.id = fp.parent_id
          )
          SELECT string_agg(name, ' > ' ORDER BY depth DESC) FROM folder_path
        ) AS folder_path
       FROM infra_approvals ia
       JOIN users u ON u.id = ia.submitted_by
       JOIN network_folders nf ON nf.id = ia.folder_id
       WHERE ia.status IN ('pending_planned', 'pending_active', 'pending_resubmitted')
       ORDER BY ia.created_at DESC`
    );

    return result.rows;
  }

  /**
   * List PM's own submissions
   */
  async listMySubmissions(userId) {
    const result = await pool.query(
      `SELECT 
        ia.*,
        nf.name AS folder_name,
        ab.username AS approved_by_name,
        ab.full_name AS approved_by_full_name,
        (
          WITH RECURSIVE folder_path AS (
            SELECT id, name, parent_id, 1 AS depth
            FROM network_folders WHERE id = ia.folder_id
            UNION ALL
            SELECT nf2.id, nf2.name, nf2.parent_id, fp.depth + 1
            FROM network_folders nf2
            JOIN folder_path fp ON nf2.id = fp.parent_id
          )
          SELECT string_agg(name, ' > ' ORDER BY depth DESC) FROM folder_path
        ) AS folder_path
       FROM infra_approvals ia
       JOIN network_folders nf ON nf.id = ia.folder_id
       LEFT JOIN users ab ON ab.id = ia.approved_by
       WHERE ia.submitted_by = $1
       ORDER BY ia.updated_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get single approval details
   */
  async getById(id) {
    const result = await pool.query(
      `SELECT 
        ia.*,
        u.username AS submitted_by_name,
        u.full_name AS submitted_by_full_name,
        nf.name AS folder_name,
        (
          WITH RECURSIVE folder_path AS (
            SELECT id, name, parent_id, 1 AS depth
            FROM network_folders WHERE id = ia.folder_id
            UNION ALL
            SELECT nf2.id, nf2.name, nf2.parent_id, fp.depth + 1
            FROM network_folders nf2
            JOIN folder_path fp ON nf2.id = fp.parent_id
          )
          SELECT string_agg(name, ' > ' ORDER BY depth DESC) FROM folder_path
        ) AS folder_path
       FROM infra_approvals ia
       JOIN users u ON u.id = ia.submitted_by
       JOIN network_folders nf ON nf.id = ia.folder_id
       WHERE ia.id = $1`,
      [id]
    );

    if (result.rows.length === 0) throw new Error("Approval not found");
    return result.rows[0];
  }

  /**
   * Approve submission (BM action)
   * Stage 1: pending_planned → planned (create network_features row)
   * Stage 2: pending_active → active (update existing feature)
   */
  async approve(approvalId, bmUserId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get approval record
      const approvalResult = await client.query(
        "SELECT * FROM infra_approvals WHERE id = $1 FOR UPDATE",
        [approvalId]
      );

      if (approvalResult.rows.length === 0) throw new Error("Approval not found");
      const approval = approvalResult.rows[0];

      if (approval.status === "pending_planned" || approval.status === "pending_resubmitted") {
        // ===== STAGE 1: Create feature with Planned status =====
        const formData = approval.form_data;
        const folderId = approval.folder_id;

        // Get folder info
        const folderResult = await client.query(
          "SELECT category, default_icon FROM network_folders WHERE id = $1",
          [folderId]
        );
        if (folderResult.rows.length === 0) throw new Error("Folder not found");

        // Find or create "Planned Infrastructure" file
        const PLANNED_FILE_NAME = "Planned Infrastructure";
        let fileId = null;

        const fileResult = await client.query(
          "SELECT id FROM network_files WHERE folder_id = $1 AND name = $2",
          [folderId, PLANNED_FILE_NAME]
        );

        const iconType = formData.iconType || "DEFAULT";

        if (fileResult.rows.length > 0) {
          fileId = fileResult.rows[0].id;
          await client.query(
            "UPDATE network_files SET icon_type = $1 WHERE id = $2",
            [iconType, fileId]
          );
        } else {
          const insertFileResult = await client.query(
            `INSERT INTO network_files 
              (folder_id, name, file_type, uploaded_by, icon_type, created_at)
             VALUES ($1, $2, 'live', $3, $4, NOW()) 
             RETURNING id`,
            [folderId, PLANNED_FILE_NAME, approval.submitted_by, iconType]
          );
          fileId = insertFileResult.rows[0].id;
        }

        // Build properties
        const finalProperties = {
          ...formData.properties,
          name: formData.name,
          icon_type: iconType,
          iconType: iconType,
          source: "manual",
          status: "Planned",
          approval_id: approvalId,
          created_by: approval.submitted_by,
        };

        // Insert feature
        const insertFeatureResult = await client.query(
          `INSERT INTO network_features 
            (file_id, geom, properties, created_at, created_by)
           VALUES 
            ($1, ST_Transform(ST_SetSRID(ST_MakePoint($2, $3), 4326), 3857), $4, NOW(), $5)
           RETURNING id`,
          [
            fileId,
            formData.longitude,
            formData.latitude,
            JSON.stringify(finalProperties),
            approval.submitted_by,
          ]
        );

        // Update file stats
        await client.query(
          "UPDATE network_files SET feature_count = COALESCE(feature_count, 0) + 1 WHERE id = $1",
          [fileId]
        );

        // Update approval record
        await client.query(
          `UPDATE infra_approvals 
           SET status = 'planned', 
               approved_by = $1, 
               feature_id = $2, 
               updated_at = NOW() 
           WHERE id = $3`,
          [bmUserId, insertFeatureResult.rows[0].id, approvalId]
        );

        await client.query("COMMIT");
        return { success: true, status: "planned", featureId: insertFeatureResult.rows[0].id };

      } else if (approval.status === "pending_active") {
        // ===== STAGE 2: Update existing feature to Active =====
        if (!approval.feature_id) throw new Error("No linked feature found");

        // Get current properties and file_id
        const featureResult = await client.query(
          "SELECT file_id, properties FROM network_features WHERE id = $1",
          [approval.feature_id]
        );

        if (featureResult.rows.length === 0) throw new Error("Feature not found");

        const currentProps = featureResult.rows[0].properties || {};
        const oldFileId = featureResult.rows[0].file_id;
        const updatedProps = {
          ...currentProps,
          status: "Active",
          circuit_id: approval.circuit_id,
          activated_at: new Date().toISOString(),
          activated_by: bmUserId,
        };

        await client.query(
          "UPDATE network_features SET properties = $1 WHERE id = $2",
          [JSON.stringify(updatedProps), approval.feature_id]
        );

        // --- NEW: Promote feature to "Live Inventory" file ---
        const LIVE_FILE_NAME = "Live Inventory";
        let liveFileId = null;

        const liveFileResult = await client.query(
          "SELECT id FROM network_files WHERE folder_id = $1 AND name = $2",
          [approval.folder_id, LIVE_FILE_NAME]
        );

        if (liveFileResult.rows.length > 0) {
          liveFileId = liveFileResult.rows[0].id;
        } else {
          const insertLiveFileResult = await client.query(
            `INSERT INTO network_files 
              (folder_id, name, file_type, uploaded_by, icon_type, created_at)
             VALUES ($1, $2, 'live', $3, $4, NOW()) 
             RETURNING id`,
            [approval.folder_id, LIVE_FILE_NAME, approval.submitted_by, updatedProps.iconType || "DEFAULT"]
          );
          liveFileId = insertLiveFileResult.rows[0].id;
        }

        // Update feature to point to Live file and update counts
        await client.query(
          "UPDATE network_features SET file_id = $1 WHERE id = $2",
          [liveFileId, approval.feature_id]
        );
        await client.query(
          "UPDATE network_files SET feature_count = feature_count + 1 WHERE id = $1",
          [liveFileId]
        );
        if (oldFileId) {
          await client.query(
            "UPDATE network_files SET feature_count = GREATEST(0, feature_count - 1) WHERE id = $1",
            [oldFileId] // This was the Planned file
          );
        }

        // Update approval record
        await client.query(
          `UPDATE infra_approvals 
           SET status = 'active', 
               approved_by = $1, 
               updated_at = NOW() 
           WHERE id = $2`,
          [bmUserId, approvalId]
        );

        await client.query("COMMIT");
        return { success: true, status: "active", featureId: approval.feature_id };

      } else {
        throw new Error(`Cannot approve from status: ${approval.status}`);
      }
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Reject submission (BM action)
   */
  async reject(approvalId, bmUserId, reason) {
    if (!reason || reason.trim() === "") {
      throw new Error("Rejection reason is required");
    }

    const result = await pool.query(
      `UPDATE infra_approvals 
       SET status = 'rejected', 
           approved_by = $1, 
           rejection_reason = $2, 
           updated_at = NOW() 
       WHERE id = $3 AND status IN ('pending_planned', 'pending_active', 'pending_resubmitted')
       RETURNING id, status`,
      [bmUserId, reason.trim(), approvalId]
    );

    if (result.rows.length === 0) {
      throw new Error("Approval not found or already processed");
    }

    return { success: true };
  }

  /**
   * Add Circuit ID and re-submit for approval (PM action)
   */
  async addCircuitId(approvalId, pmUserId, circuitId, activationDate) {
    if (!circuitId || circuitId.trim() === "") {
      throw new Error("Circuit ID is required");
    }

    const result = await pool.query(
      `UPDATE infra_approvals 
       SET status = 'pending_active', 
           circuit_id = $1, 
           form_data = jsonb_set(form_data, '{properties,activationDate}', to_jsonb($2::text), true),
           rejection_reason = NULL,
           updated_at = NOW() 
       WHERE id = $3 AND submitted_by = $4 AND status = 'planned'
       RETURNING id`,
      [circuitId.trim(), activationDate, approvalId, pmUserId]
    );

    if (result.rows.length === 0) {
      throw new Error("Approval not found, not yours, or not in Planned status");
    }

    return { success: true };
  }

  /**
   * Resubmit a rejected approval with updated data (PM action)
   */
  async resubmit(approvalId, pmUserId, updatedFormData) {
    const result = await pool.query(
      `UPDATE infra_approvals 
       SET status = 'pending_resubmitted', 
           form_data = $1, 
           rejection_reason = NULL,
           updated_at = NOW() 
       WHERE id = $2 AND submitted_by = $3 AND status = 'rejected'
       RETURNING id`,
      [JSON.stringify(updatedFormData), approvalId, pmUserId]
    );

    if (result.rows.length === 0) {
      throw new Error("Approval not found, not yours, or not in rejected status");
    }

    return { success: true };
  }

  /**
   * Edit a pending submission's form data (BM/Admin action)
   * Preserves original data for audit trail
   */
  async editSubmission(approvalId, bmUserId, updatedFormData) {
    const result = await pool.query(
      `UPDATE infra_approvals 
       SET form_data = $1,
           edited_by = $2,
           edited_original_data = CASE 
             WHEN edited_original_data IS NULL THEN form_data 
             ELSE edited_original_data 
           END,
           updated_at = NOW() 
       WHERE id = $3 AND status IN ('pending_planned', 'pending_active', 'pending_resubmitted')
       RETURNING id`,
      [JSON.stringify(updatedFormData), bmUserId, approvalId]
    );

    if (result.rows.length === 0) {
      throw new Error("Approval not found or not in a pending status");
    }

    return { success: true };
  }

  /**
   * List approval history (approved, active, rejected)
   */
  async listHistory() {
    const result = await pool.query(
      `SELECT 
        ia.*,
        u.username AS submitted_by_name,
        u.full_name AS submitted_by_full_name,
        ab.username AS approved_by_name,
        ab.full_name AS approved_by_full_name,
        nf.name AS folder_name,
        (
          WITH RECURSIVE folder_path AS (
            SELECT id, name, parent_id, 1 AS depth
            FROM network_folders WHERE id = ia.folder_id
            UNION ALL
            SELECT nf2.id, nf2.name, nf2.parent_id, fp.depth + 1
            FROM network_folders nf2
            JOIN folder_path fp ON nf2.id = fp.parent_id
          )
          SELECT string_agg(name, ' > ' ORDER BY depth DESC) FROM folder_path
        ) AS folder_path
       FROM infra_approvals ia
       JOIN users u ON u.id = ia.submitted_by
       JOIN network_folders nf ON nf.id = ia.folder_id
       LEFT JOIN users ab ON ab.id = ia.approved_by
       WHERE ia.status IN ('planned', 'active', 'rejected')
       ORDER BY ia.updated_at DESC
       LIMIT 50`
    );

    return result.rows;
  }

  async deleteSubmission(approvalId, user) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Handle role case-insensitivity
      const isAdmin = user.role?.toLowerCase() === "admin";
      const permissions = user.permissions || [];
      const hasSubmissionDelete = permissions.includes("network:infra:delete_submission_history");
      const hasApprovalDelete = permissions.includes("network:infra:delete_approval_history");

      // 1. Fetch the approval record
      const approvalResult = await client.query(
        "SELECT * FROM infra_approvals WHERE id = $1 FOR UPDATE",
        [approvalId]
      );

      if (approvalResult.rows.length === 0) {
        throw new Error("Submission not found");
      }

      const approval = approvalResult.rows[0];

      // 2. Permission Check
      const isOwner = approval.submitted_by === user.id;
      const isPending = ['pending_planned', 'pending_resubmitted'].includes(approval.status);

      let canDelete = false;

      if (isAdmin) {
         canDelete = true;
      } else if (isPending && isOwner) {
         // Owners can cancel their own pending items
         canDelete = true;
      } else if (!isPending) {
         // Historical items (planned, active, rejected)
         if (isOwner && hasSubmissionDelete) {
            canDelete = true;
         } else if (hasApprovalDelete) {
            canDelete = true;
         }
      }

      if (!canDelete) {
         throw new Error(`You lack permissions to delete an item in ${approval.status} status`);
      }

      // 3. If "planned" or has a feature_id, clean up network_features and network_files
      if (approval.feature_id) {
        // get the file_id first
        const featureResult = await client.query(
           "SELECT file_id FROM network_features WHERE id = $1",
           [approval.feature_id]
        );

        if (featureResult.rows.length > 0) {
           const fileId = featureResult.rows[0].file_id;
           // delete feature
           await client.query("DELETE FROM network_features WHERE id = $1", [approval.feature_id]);
           // decrement file
           await client.query("UPDATE network_files SET feature_count = GREATEST(0, feature_count - 1) WHERE id = $1", [fileId]);
        }
      }

      // 4. Delete the approval record
      await client.query("DELETE FROM infra_approvals WHERE id = $1", [approvalId]);

      await client.query("COMMIT");
      return { success: true };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new InfraApprovalService();
module.exports = new InfraApprovalService();
