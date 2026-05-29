const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");
const { ERRORS } = require("../constants"); // Assuming we have ERRORS

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions (admin only)
 * @access  Private (Admin)
 */
const getAllPermissions = async (req, res) => {
  try {
    const userRole = req.user.role;

    const canManagePermissions = userRole === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('admin:permissions:manage'));

    if (!canManagePermissions) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to manage system permissions",
      });
    }

    const { role, resource } = req.query;

    let query = "SELECT * FROM permissions WHERE 1=1";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (resource) {
      query += " AND resource = ?";
      params.push(resource);
    }

    query += " ORDER BY role, resource";

    const [permissions] = await pool.query(query, params);

    res.json({ success: true, permissions });
  } catch (error) {
    console.error("Get permissions error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get permissions" });
  }
};

/**
 * @route   GET /api/permissions/:id
 * @desc    Get permission by ID (admin only)
 * @access  Private (Admin)
 */
const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const canManagePermissions = userRole === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('admin:permissions:manage'));

    if (!canManagePermissions) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to manage system permissions",
      });
    }

    const [permissions] = await pool.query(
      "SELECT * FROM permissions WHERE id = ?",
      [id],
    );

    if (permissions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, permission: permissions[0] });
  } catch (error) {
    console.error("Get permission error:", error);
    res.status(500).json({ success: false, error: "Failed to get permission" });
  }
};

/**
 * @route   POST /api/permissions
 * @desc    Create new permission (admin only)
 * @access  Private (Admin)
 */
const createPermission = async (req, res) => {
  try {
    const userRole = req.user.role;

    const canManagePermissions = userRole === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('admin:permissions:manage'));

    if (!canManagePermissions) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to manage system permissions",
      });
    }

    const { role, resource, actions, description } = req.body;

    if (!role || !resource || !actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: "Role, resource, and actions array are required",
      });
    }

    // Validate role - check system roles + custom roles from DB
    const systemRoles = ["admin", "manager", "technician", "developer", "user"];
    let validRoles = [...systemRoles];
    try {
      const roleService = require("../services/role.service");
      const dbRoles = await roleService.getAllRoles();
      const dbRoleNames = dbRoles.map(r => r.name);
      validRoles = [...new Set([...systemRoles, ...dbRoleNames])];
    } catch (e) {
      // fallback to system roles only
    }
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Validate actions
    const validActions = ["create", "read", "update", "delete", "manage"];
    const invalidActions = actions.filter(
      (action) => !validActions.includes(action),
    );
    if (invalidActions.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid actions: ${invalidActions.join(", ")}`,
      });
    }

    // Check if permission already exists
    const [existing] = await pool.query(
      "SELECT id FROM permissions WHERE role = ? AND resource = ?",
      [role, resource],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Permission for this role and resource already exists",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO permissions (role, resource, actions, description)
       VALUES (?, ?, ?, ?) RETURNING id`,
      [role, resource, JSON.stringify(actions), description],
    );

    res.status(201).json({
      success: true,
      permission: {
        id: result[0].id,
        role,
        resource,
        actions,
      },
    });

    // Audit
    await logAudit(
      req.user.id,
      "Create System Permission",
      "PERMISSION_DEF_CREATE",
      result[0].id,
      { role, resource, actions, description },
      req,
    );
  } catch (error) {
    console.error("Create permission error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create permission" });
  }
};

/**
 * @route   PUT /api/permissions/:id
 * @desc    Update permission (admin only)
 * @access  Private (Admin)
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const canManagePermissions = userRole === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('admin:permissions:manage'));

    if (!canManagePermissions) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to manage system permissions",
      });
    }

    const { actions, description } = req.body;

    // We only allow updating actions and description, not role/resource to avoid conflicts
    const updates = [];
    const params = [];

    if (actions) {
      if (!Array.isArray(actions)) {
        return res
          .status(400)
          .json({ success: false, error: "Actions must be an array" });
      }
      // Validate actions
      const validActions = ["create", "read", "update", "delete", "manage"];
      const invalidActions = actions.filter(
        (action) => !validActions.includes(action),
      );
      if (invalidActions.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid actions: ${invalidActions.join(", ")}`,
        });
      }
      updates.push("actions = ?");
      params.push(JSON.stringify(actions));
    }

    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    params.push(id);

    const [result] = await pool.query(
      `UPDATE permissions SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, message: "Permission updated successfully" });

    // Audit
    await logAudit(
      req.user.id,
      "Update System Permission",
      "PERMISSION_DEF_UPDATE",
      id,
      { updates: req.body },
      req,
    );
  } catch (error) {
    console.error("Update permission error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update permission" });
  }
};

/**
 * @route   DELETE /api/permissions/:id
 * @desc    Delete permission (admin only)
 * @access  Private (Admin)
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const canManagePermissions = userRole === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('admin:permissions:manage'));

    if (!canManagePermissions) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions to manage system permissions",
      });
    }

    // Check if permission is being used? (Maybe later)

    const [result] = await pool.query("DELETE FROM permissions WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, message: "Permission deleted successfully" });

    // Audit
    await logAudit(
      req.user.id,
      "Delete System Permission",
      "PERMISSION_DEF_DELETE",
      id,
      { action: "DELETE" },
      req
    );
  } catch (error) {
    console.error("Delete permission error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete permission" });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};
