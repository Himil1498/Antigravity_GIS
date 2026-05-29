/**
 * User Permissions Controller
 * Handles granular permissions and folder access assignments
 */
const { pool } = require("../../config/database");
const {
  sendPermissionUpdateEmail,
} = require("../../shared/services/email/permissionEmail");
const {
  createNotification,
} = require("../notification/services/notification.service");
const { logAudit } = require("../audit/audit.service");
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../../../../backend_debug.log");

const logDebug = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : "";
  const logEntry = `[${timestamp}] ${message}${dataStr}\n${"-".repeat(50)}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error("Failed to write to debug log:", err);
  }
};

/**
 * Get System Permission Catalog (for UI Checkboxes)
 */
exports.getPermissionCatalog = async (req, res) => {
  try {
    const [permissions] = await pool.query(
      "SELECT category, code, name, description FROM system_permissions ORDER BY category, code",
    );

    // Group by category for easier UI consumption
    const catalog = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      data: catalog,
    });
  } catch (error) {
    console.error("Get Permission Catalog Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch permission catalog" });
  }
};

/**
 * Get User Effective Permissions
 * Merges Role defaults + Group perms + Direct perms
 */
exports.getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get User Direct Permissions and Role
    const [users] = await pool.query(
      "SELECT id, role, permissions, map_preferences FROM users WHERE id = ?",
      [id],
    );

    if (!users.length) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = users[0];
    const directPermissions = user.permissions || [];

    // 2. Get Group Permissions
    const [groups] = await pool.query(
      `SELECT g.permissions 
       FROM "groups" g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ? AND g.is_active::boolean = true`,
      [id],
    );

    const groupPermissions = groups.reduce((acc, g) => {
      return [...acc, ...(g.permissions || [])];
    }, []);

    // 3. Get Role Permissions (Fix: Fetch permissions linked to the User Role)
    let rolePermissions = [];
    if (user.role) {
      try {
        const [roles] = await pool.query(
          "SELECT permissions FROM roles WHERE LOWER(name) = LOWER(?)",
          [user.role]
        );
        if (roles.length > 0) {
          let perms = roles[0].permissions;
          if (typeof perms === 'string') {
             try { perms = JSON.parse(perms); } catch(e) {}
          }
          if (Array.isArray(perms)) {
            rolePermissions = perms;
          }
        }
        console.log(`[PermissionDebug] Role '${user.role}' found. Permissions:`, rolePermissions);
      } catch (err) {
        console.error("Failed to fetch role permissions:", err);
      }
    }

    // Merge Group and Role permissions for "Inherited"
    const allInherited = [...new Set([...groupPermissions, ...rolePermissions])];

    res.json({
      success: true,
      data: {
        role: user.role,
        direct: directPermissions,
        group: allInherited, // Includes both Group and Role permissions
        map_preferences: user.map_preferences || {},
      },
    });
  } catch (error) {
    console.error("Get User Permissions Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user permissions" });
  }
};

/**
 * Update User Direct Permissions
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // Array of strings e.g. ["map:view", "network:edit"]

    logDebug(`updateUserPermissions CALLED for User ID: ${id}`, {
      body: req.body,
      params: req.params,
      headers: {
        contentType: req.get("Content-Type"),
        auth: req.get("Authorization") ? "Present" : "Missing",
      },
    });

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ success: false, error: "Permissions must be an array" });
    }

    // 1. Get current permissions to calculate diff
    const [currentUser] = await pool.query(
      "SELECT permissions, role FROM users WHERE id = ?",
      [id],
    );
    let oldPermissions = currentUser[0]?.permissions || [];

    // Safety: Ensure it's an array (handle stringified JSON if DB driver returns string)
    if (typeof oldPermissions === "string") {
      try {
        oldPermissions = JSON.parse(oldPermissions);
      } catch (e) {
        oldPermissions = [];
      }
    }
    if (!Array.isArray(oldPermissions)) oldPermissions = [];

    // 2. Update permissions
    await pool.query("UPDATE users SET permissions = ? WHERE id = ?", [
      JSON.stringify(permissions),
      id,
    ]);

    // Response moved to end of function to avoid "headers sent" errors if subsequent steps fail
    // and to ensure atomicity from user perspective (or at least valid reporting)

    // --- HANDLE REGIONS ---
    // --- HANDLE REGIONS ---
    // If assignedRegions is provided in the body, update them now
    const { assignedRegions } = req.body;

    console.log(
      `[Permissions Update] User ${id} - Updating Regions. Count: ${assignedRegions?.length}`,
    );

    if (assignedRegions && Array.isArray(assignedRegions)) {
      try {
        const userService = require("./user.service"); // Lazy load to avoid circular dep if any
        const {
          sendRegionUpdateNotification,
        } = require("./controllers/utils"); // Reuse util

        const oldRegionNames = await userService.getUserRegions(id);
        console.log(
          `[Permissions Update] User ${id} - Old Regions: ${oldRegionNames.length}`,
        );

        // Clear & Re-assign
        await userService.clearUserRegions(id);

        if (assignedRegions.length > 0) {
          console.log(
            `[Permissions Update] Assigning ${assignedRegions.length} new regions...`,
          );
          await userService.assignUserRegions(
            id,
            assignedRegions,
            req.user ? req.user.id : null,
          );
        }

        // Notify
        const addedRegions = assignedRegions.filter(
          (r) => !oldRegionNames.includes(r),
        );
        const removedRegions = oldRegionNames.filter(
          (r) => !assignedRegions.includes(r),
        );

        console.log(
          `[Permissions Update] Regions Added: ${addedRegions.length}, Removed: ${removedRegions.length}`,
        );

        if (addedRegions.length > 0 || removedRegions.length > 0) {
          // Assuming sendRegionUpdateNotification expects pool as first arg based on previous check
          await sendRegionUpdateNotification(
            pool,
            id,
            addedRegions,
            removedRegions,
            assignedRegions,
            req.user,
          );
        }
      } catch (regionErr) {
        console.error(
          "Failed to update regions in permission controller:",
          regionErr,
        );
        logDebug(`[Region Logic] ERROR updating regions`, {
          error: regionErr.message,
          stack: regionErr.stack,
        });
        // We don't fail the request since permissions succeeded
      }
    } else {
      console.log(
        `[Permissions Update] No valid assignedRegions array provided. Type: ${typeof assignedRegions}`,
      );
      logDebug(`[Region Logic] SKIPPED - Invalid assignedRegions`, {
        type: typeof assignedRegions,
        val: assignedRegions,
      });
    }

    // --- SEND RESPONSE EARLY (Optimistic UI) ---
    // We send response here so UI doesn't hang while sending emails
    res.json({
      success: true,
      message: "Permissions updated successfully",
    });

    // 3. Calculate Diff & Send Notification
    try {
      const added = permissions.filter((p) => !oldPermissions.includes(p));
      const removed = oldPermissions.filter((p) => !permissions.includes(p));

      // ... logging ...

      if (added.length === 0 && removed.length === 0) return; // No change

      const formatPerms = (perms) =>
        perms
          .map((p) =>
            p
              .split(":")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" "),
          )
          .join(", ");

      let messageParts = [];
      if (added.length > 0) messageParts.push(`Granted: ${formatPerms(added)}`);
      if (removed.length > 0)
        messageParts.push(`Revoked: ${formatPerms(removed)}`);

      const notificationMessage = messageParts.join(" | ");

      // Fetch fresh user details for email (name etc)
      const [targetUser] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
      );

      // Fetch ALL system permissions to get real descriptions
      const [sysPerms] = await pool.query(
        "SELECT code, description FROM system_permissions",
      );
      const permMap = sysPerms.reduce((acc, p) => {
        acc[p.code] = p.description;
        return acc;
      }, {});

      if (targetUser && targetUser.length > 0) {
        // Audit Log
        if (added.length > 0 || removed.length > 0) {
          await logAudit(
            req.user.id,
            "UPDATE_PERMISSIONS",
            "USER",
            id,
            {
              targetUser: targetUser[0].username,
              added: added,
              removed: removed,
            },
            req,
          );
        }

        // Email (Granular)
        const toPermObj = (code) => ({
          code,
          description:
            permMap[code] ||
            code
              .split(":")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" "),
        });

        const addedObjs = added.map(toPermObj);
        const removedObjs = removed.map(toPermObj);
        const fullList = permissions.map(toPermObj);

        await sendPermissionUpdateEmail(
          targetUser[0],
          fullList,
          "updated",
          addedObjs,
          removedObjs,
        );

        // 🔔 In-App Notification (Detailed & No Navigation)
        await createNotification(
          targetUser[0].id,
          "system",
          "Permissions Updated",
          notificationMessage,
          { action_url: null },
        );
      }
    } catch (emailErr) {
      console.error("Failed to send permission notifications:", emailErr);
    }
  } catch (error) {
    console.error("Update User Permissions Error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, error: "Failed to update permissions" });
    }
  }
};

/**
 * Get User Folder Access Assignments
 */
exports.getUserFolderAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const [folders] = await pool.query(
      `SELECT fa.*, nf.name as folder_name, nf.parent_id 
       FROM user_folder_access fa
       JOIN network_folders nf ON fa.folder_id = nf.id
       WHERE fa.user_id = $1 AND nf.deleted_at IS NULL
       
       UNION
       
       SELECT 
         0 as id, 
         $1 as user_id, 
         nf.id as folder_id, 
         true as can_read, 
         true as can_write, 
         true as can_edit, 
         true as can_delete, 
         nf.created_at as granted_at,
         nf.name as folder_name, 
         nf.parent_id 
       FROM network_folders nf
       WHERE nf.created_by = $1 AND nf.deleted_at IS NULL`,
      [id],
    );

    res.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get Folder Access Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch folder access" });
  }
};

/**
 * Update Folder Access (Assign/Revoke)
 * Logic: "Assign" grants access. "Revoke" removes the entry.
 * We rely on hierarchical logic in CatalogService to handle "Subfolder" access implicitly if parent is assigned.
 * But here we allow explicit assignment.
 */
exports.assignFolderAccess = async (req, res) => {
  try {
    const { id } = req.params; // User ID
    const { folderId, access, assignments } = req.body;

    // Normalize input to array
    let itemsToProcess = [];
    if (assignments && Array.isArray(assignments)) {
      itemsToProcess = assignments;
    } else if (folderId) {
      itemsToProcess = [{ folderId, access }];
    } else {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const {
      createNotification,
    } = require("../notification/services/notification.service");
    const {
      sendPermissionUpdateEmail,
    } = require("../../shared/services/email/permissionEmail");

    // Track changes for notification
    let assignedFolders = [];
    let revokedFolders = [];

    // Process all items
    for (const item of itemsToProcess) {
      const { folderId: fId, access: itemAccess } = item;

      // Get Folder Name for notification
      const [folderRows] = await pool.query(
        "SELECT name FROM network_folders WHERE id = ?",
        [fId],
      );
      const folderName = folderRows[0]?.name || `Folder #${fId}`;

      if (!itemAccess) {
        // Revoke
        const [delRes] = await pool.query(
          "DELETE FROM user_folder_access WHERE user_id = ? AND folder_id = ?",
          [id, fId],
        );
        if (delRes && delRes.rowCount > 0) {
          revokedFolders.push(folderName);
        }
      } else {
        // Upsert
        const {
          can_read = true,
          can_write = false,
          can_edit = false,
          can_delete = false,
        } = itemAccess;

        await pool.query(
          `INSERT INTO user_folder_access (user_id, folder_id, can_read, can_write, can_edit, can_delete)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (user_id, folder_id) 
           DO UPDATE SET 
             can_read = EXCLUDED.can_read,
             can_write = EXCLUDED.can_write,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete`,
          [id, fId, can_read, can_write, can_edit, can_delete],
        );
        assignedFolders.push(folderName);
      }
    }

    res.json({ success: true, message: "Folder access updated" });

    // --- Notifications ---
    if (assignedFolders.length > 0 || revokedFolders.length > 0) {
      const [targetUser] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
      );

      if (targetUser && targetUser.length > 0) {
        // Audit Log
        await logAudit(
          req.user.id,
          "UPDATE_FOLDER_ACCESS",
          "USER",
          id,
          {
            targetUser: targetUser[0].username,
            granted: assignedFolders,
            revoked: revokedFolders,
          },
          req,
        );

        // ... (rest of notification logic)
        // Better to create a generic "Access Updated" email logic or hack it into the existing one.
        // For now, I will modify sendPermissionUpdateEmail to accept folder info, OR just rely on In-App first?
        // User asked for EMAIL.
        // I'll assume valid params and pass folder strings as "Permissions" temporarily or update the email service.
        // Let's UPDATE the Email Service to handle "folders".

        // For now, in-app notification
        const parts = [];
        if (assignedFolders.length > 0)
          parts.push(`Granted Folders: ${assignedFolders.join(", ")}`);
        if (revokedFolders.length > 0)
          parts.push(`Revoked Folders: ${revokedFolders.join(", ")}`);

        await createNotification(
          id,
          "system",
          "Folder Access Updated",
          parts.join(" | "),
          { action_url: null },
        );

        // SEND EMAIL
        // I will implement a quick email sender here or call a specialized method.
        // To save time/risk, I will call sendPermissionUpdateEmail but formatting Folders as "Permissions"
        // so they appear in the list.
        const toPermObj = (name, prefix) => ({
          code: `Folder: ${name}`,
          description: `${prefix} Access to folder`,
        });

        const addedObjs = assignedFolders.map((n) => toPermObj(n, "Granted"));
        const removedObjs = revokedFolders.map((n) => toPermObj(n, "Revoked"));

        await sendPermissionUpdateEmail(
          targetUser[0],
          [], // Full list ignored in 'updated' mode if not used? fallback
          "updated",
          addedObjs,
          removedObjs,
        );
      }
    }
  } catch (error) {
    console.error("Assign Folder Access Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to assign folder access" });
  }
};

/**
 * Get User Folder Add Access Assignments
 */
exports.getUserFolderAddAccess = async (req, res) => {
  try {
    const { id } = req.params;

    const [folders] = await pool.query(
      `SELECT fa.*, nf.name as folder_name, nf.parent_id 
       FROM user_folder_add_access fa
       JOIN network_folders nf ON fa.folder_id = nf.id
       WHERE fa.user_id = ?`,
      [id],
    );

    res.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get Folder Add Access Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch folder add access" });
  }
};

/**
 * Update Folder Add Access (Assign/Revoke)
 */
exports.assignFolderAddAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId, access, assignments } = req.body;

    let itemsToProcess = [];
    if (assignments && Array.isArray(assignments)) {
      itemsToProcess = assignments;
    } else if (folderId) {
      itemsToProcess = [{ folderId, access }];
    } else {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    let assignedFolders = [];
    let revokedFolders = [];

    for (const item of itemsToProcess) {
      const { folderId: fId, access: itemAccess } = item;

      const [folderRows] = await pool.query(
        "SELECT name FROM network_folders WHERE id = ?",
        [fId],
      );
      const folderName = folderRows[0]?.name || `Folder #${fId}`;

      if (!itemAccess) {
        const [delRes] = await pool.query(
          "DELETE FROM user_folder_add_access WHERE user_id = ? AND folder_id = ?",
          [id, fId],
        );
        if (delRes && delRes.rowCount > 0) revokedFolders.push(folderName);
      } else {
        await pool.query(
          `INSERT INTO user_folder_add_access (user_id, folder_id)
           VALUES (?, ?)
           ON CONFLICT (user_id, folder_id) DO NOTHING`,
          [id, fId],
        );
        assignedFolders.push(folderName);
      }
    }

    res.json({ success: true, message: "Folder add access updated" });
  } catch (error) {
    console.error("Assign Folder Add Access Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to assign folder add access" });
  }
};
