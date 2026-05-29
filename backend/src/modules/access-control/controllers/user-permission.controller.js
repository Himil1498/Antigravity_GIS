const { pool } = require("../../../config/database");
const {
  sendPermissionUpdateEmail,
} = require("../../../shared/services/email/permissionEmail");

/**
 * User Permission Controller
 * Handles individual user permission management
 * Admin/Manager can assign permissions directly to users
 */

/**
 * @route   GET /api/users/permissions/users
 * @desc    Get all users with their effective permissions
 * @access  Private (Admin/Manager)
 */
const getUsersWithPermissions = async (req, res) => {
  try {
    const requesterRole = req.user.role;

    if (requesterRole !== "admin" && requesterRole !== "manager") {
      return res.status(403).json({
        success: false,
        error: "Only admin or manager can view all user permissions",
      });
    }

    // Get all users who have active permissions (either direct or via groups)
    // This could be heavy, let's just get users with DIRECT permissions for now + users in groups?
    // Or just list all users and their permission count?
    // Let's list users who have at least one permission or are in a group.

    // Actually, usually this endpoint is "get users who have specific permissions" or simply "list all users with their roles".
    // Given the previous architecture, let's implement a simple list of users with their custom permissions.

    // Get users who have custom permissions (permissions array is not empty)
    // Using Postgres syntax for JSONB length check
    const [usersWithPermissions] = await pool.query(`
      SELECT id, username, full_name, email, role,
             jsonb_array_length(permissions) as direct_permissions_count
      FROM users 
      WHERE jsonb_array_length(permissions) > 0
    `);

    res.json({
      success: true,
      users: usersWithPermissions,
    });
  } catch (error) {
    console.error("Get users with permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get users with permissions",
    });
  }
};

/**
 * @route   GET /api/users/:userId/permissions
 * @desc    Get user's effective permissions (direct + from groups)
 * @access  Private
 */
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Only allow viewing own permissions or admin/manager can view others
    if (
      userId !== requesterId.toString() &&
      requesterRole !== "admin" &&
      requesterRole !== "manager"
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to view these permissions",
      });
    }

    // Get direct permissions (from JSONB column)
    const [userResult] = await pool.query(
      "SELECT permissions, role FROM users WHERE id = ?",
      [userId]
    );

    if (userResult.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
    }

    const directPerms = userResult[0].permissions || [];

    // Get permissions from groups (if groups exist)
    let groupPerms = [];
    try {
      const [groups] = await pool.query(
        `SELECT g.permissions, g.name as group_name 
         FROM "groups" g
         JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = ? AND g.is_active = true`,
        [userId]
      );
      // Flatten group permissions for display
      groupPerms = groups.reduce((acc, g) => {
        return [
          ...acc,
          ...(g.permissions || []).map((p) => ({
            permission_id: p,
            group_name: g.group_name,
            source: "group",
          })),
        ];
      }, []);
    } catch (err) {
      // Ignore if groups table doesn't exist yet
    }

    // Get permissions from Role
    // 1. Get user's role
    const [user] = await pool.query("SELECT role FROM users WHERE id = ?", [
      userId,
    ]);
    const userRole = user[0]?.role;
    const isAdmin = userRole === "admin";

    // 2. Get role permissions from roles table
    let rolePerms = [];
    if (userRole) {
      try {
        const [roles] = await pool.query(
          "SELECT permissions FROM roles WHERE LOWER(name) = LOWER(?)",
          [userRole]
        );
        if (roles.length > 0) {
          // Handle both JSONB (array) and JSON string formats
          const rawPerms = roles[0].permissions;
          const permsArray = Array.isArray(rawPerms)
            ? rawPerms
            : typeof rawPerms === "string"
              ? JSON.parse(rawPerms)
              : [];
          console.log(`[PermissionDebug] Role '${userRole}' found. Permissions:`, permsArray);

          rolePerms = permsArray.map((p) => ({
            permission_id: p,
            group_name: `Role: ${userRole}`, // Show role as source
            source: "role",
          }));
        } else if (userRole === "admin") {
           // Admin implies all, but let's not auto-inject '*' into specific checks unless frontend handles it.
           // Usually admins bypass checks.
        }
      } catch (err) {
        console.error("Failed to fetch role permissions", err);
      }
    }

    // Merge Group and Role permissions for display as "Inherited"
    const inheritedPerms = [...groupPerms, ...rolePerms];
    // Deduplicate by permission_id
    const uniqueInherited = Array.from(
      new Set(inheritedPerms.map((p) => p.permission_id))
    );

    res.json({
      success: true,
      permissions: {
        direct: directPerms,
        directDetails: directPerms.map((p) => ({ permission_id: p })), // Mock struct for frontend compat
        fromGroups: uniqueInherited, // Includes both Group and Role permissions
        groupDetails: inheritedPerms,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Get user permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user permissions",
    });
  }
};

/**
 * @route   PUT /api/users/:userId/permissions
 * @desc    Update user's direct permissions
 * @access  Private (Admin/Manager only)
 */
const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    const grantedBy = req.user.id;
    const requesterRole = req.user.role;

    console.log("🔄 Update Permissions Triggered for User:", userId);

    // Only admin or manager can update permissions
    if (requesterRole !== "admin" && requesterRole !== "manager") {
      return res.status(403).json({
        success: false,
        error: "Only admin or manager can update permissions",
      });
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: "Permissions must be an array",
      });
    }

    // Verify user exists
    const [users] = await pool.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing direct permissions
      // Update JSONB column directly
      await connection.query(
        "UPDATE users SET permissions = ? WHERE id = ?",
        [JSON.stringify(permissions), userId]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `Updated ${permissions.length} permission(s) for user`,
      });

      // 📧 Send Notification
      try {
        console.log("📨 Sending email notification for user:", userId);
        const [targetUser] = await pool.query(
          "SELECT * FROM users WHERE id = ?",
          [userId],
        );
        if (targetUser && targetUser.length > 0) {
          const permList = permissions.map((p) => ({
            code: p,
            description: p
              .split(":")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" "),
          }));
          sendPermissionUpdateEmail(targetUser[0], permList, "updated");
        }
      } catch (e) {
        console.error("Email failed", e);
      }
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Update user permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user permissions",
    });
  }
};

/**
 * @route   POST /api/users/:userId/permissions/add
 * @desc    Add specific permissions to user
 * @access  Private (Admin/Manager only)
 */
const addUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    const grantedBy = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole !== "admin" && requesterRole !== "manager") {
      return res.status(403).json({
        success: false,
        error: "Only admin or manager can add permissions",
      });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Provide at least one permission to add",
      });
    }

    // Get existing permissions
    const [users] = await pool.query("SELECT permissions FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return res.status(404).json({success: false, error: "User not found"});
    
    let currentPerms = users[0].permissions || [];
    
    // Add new permissions (Deduplicate)
    const updatedPerms = [...new Set([...currentPerms, ...permissions])];
    
    // Update DB
    await pool.query(
      "UPDATE users SET permissions = ? WHERE id = ?",
      [JSON.stringify(updatedPerms), userId]
    );

    res.json({
      success: true,
      message: `Added ${permissions.length} permission(s)`,
    });

    // 📧 Send Notification
    try {
      const [targetUser] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
      );
      if (targetUser && targetUser.length > 0) {
        const permList = permissions.map((p) => ({
          code: p,
          description: p
            .split(":")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
        }));
        sendPermissionUpdateEmail(targetUser[0], permList, "assigned");
      }
    } catch (e) {
      console.error("Email failed", e);
    }
  } catch (error) {
    console.error("Add user permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add permissions",
    });
  }
};

/**
 * @route   DELETE /api/users/:userId/permissions/remove
 * @desc    Remove specific permissions from user
 * @access  Private (Admin/Manager only)
 */
const removeUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    const requesterRole = req.user.role;

    if (requesterRole !== "admin" && requesterRole !== "manager") {
      return res.status(403).json({
        success: false,
        error: "Only admin or manager can remove permissions",
      });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Provide at least one permission to remove",
      });
    }

    // Get existing permissions
    const [users] = await pool.query("SELECT permissions FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return res.status(404).json({success: false, error: "User not found"});
    
    let currentPerms = users[0].permissions || [];
    
    // Filter out removed permissions
    const updatedPerms = currentPerms.filter(p => !permissions.includes(p));
    
    // Update DB
    await pool.query(
      "UPDATE users SET permissions = ? WHERE id = ?",
      [JSON.stringify(updatedPerms), userId]
    );

    res.json({
      success: true,
      message: `Removed ${permissions.length} permission(s)`,
    });

    // 📧 Send Notification
    try {
      const [targetUser] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
      );
      if (targetUser && targetUser.length > 0) {
        const permList = permissions.map((p) => ({
          code: p,
          description: p
            .split(":")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
        }));
        sendPermissionUpdateEmail(targetUser[0], permList, "revoked");
      }
    } catch (e) {
      console.error("Email failed", e);
    }
  } catch (error) {
    console.error("Remove user permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove permissions",
    });
  }
};

module.exports = {
  getUsersWithPermissions,
  getUserPermissions,
  updateUserPermissions,
  addUserPermissions,
  removeUserPermissions,
};
