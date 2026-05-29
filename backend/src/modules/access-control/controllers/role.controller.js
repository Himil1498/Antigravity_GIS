const roleService = require("../services/role.service");
const { logAudit } = require("../../audit/audit.service");

/**
 * @route   GET /api/access/roles
 * @desc    Get all roles with user counts
 * @access  Private (Admin)
 */
const getAllRoles = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const roles = await roleService.getAllRoles(includeInactive);
    const userCounts = await roleService.getRoleUserCounts();

    // Attach user count to each role
    const rolesWithCounts = roles.map(role => ({
      ...role,
      userCount: userCounts[role.name] || 0,
      permissionCount: Array.isArray(role.permissions) 
        ? (role.permissions.includes("*") ? "All" : role.permissions.length)
        : 0,
      folderCount: Array.isArray(role.default_folder_ids) ? role.default_folder_ids.length : 0,
    }));

    res.json({ success: true, roles: rolesWithCounts });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch roles" });
  }
};

/**
 * @route   GET /api/access/roles/:id
 * @desc    Get single role by ID
 * @access  Private (Admin)
 */
const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    res.json({ success: true, role });
  } catch (error) {
    console.error("Get role error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch role" });
  }
};

/**
 * @route   POST /api/access/roles
 * @desc    Create a new custom role
 * @access  Private (Admin)
 */
const createRole = async (req, res) => {
  try {
    const { name, display_name, description, permissions, default_folder_ids, color, icon } = req.body;

    // Validate required fields
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        error: "Role name and display name are required",
      });
    }

    // Validate name format (lowercase, no spaces)
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      return res.status(400).json({
        success: false,
        error: "Role name must be lowercase, start with a letter, and contain only letters, numbers, and underscores",
      });
    }

    // Check if role already exists
    // Check if role already exists
    const existing = await roleService.getRoleByName(name);
    if (existing) {
      if (!existing.is_active) {
        // Reactivate soft-deleted role
        await roleService.updateRole(existing.id, {
          display_name,
          description,
          permissions: permissions || [],
          default_folder_ids: default_folder_ids || [],
          color,
          icon,
          is_active: true
        });

        // Audit
        await logAudit(
          req.user.id,
          "Reactivate Role",
          "role",
          existing.id,
          { name, display_name, permissionCount: (permissions || []).length },
          req
        );

        return res.status(200).json({
          success: true,
          message: `Role '${display_name}' reactivated successfully`,
          role: { id: existing.id, name, display_name },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: `Role '${name}' already exists`,
        });
      }
    }

    const roleId = await roleService.createRole({
      name,
      display_name,
      description,
      permissions: permissions || [],
      default_folder_ids: default_folder_ids || [],
      color,
      icon,
      createdBy: req.user.id,
    });

    // Audit
    await logAudit(
      req.user.id,
      "Create Role",
      "role",
      roleId,
      { name, display_name, permissionCount: (permissions || []).length },
      req
    );

    res.status(201).json({
      success: true,
      message: `Role '${display_name}' created successfully`,
      role: { id: roleId, name, display_name },
    });
  } catch (error) {
    console.error("Create role error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ success: false, error: "Role name already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create role" });
  }
};

/**
 * @route   PUT /api/access/roles/:id
 * @desc    Update an existing role
 * @access  Private (Admin)
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Prevent editing admin role name (but allow editing its permissions for system roles)
    if (role.is_system && role.name === "admin") {
      return res.status(403).json({
        success: false,
        error: "Cannot modify the admin role",
      });
    }

    const { display_name, description, permissions, default_folder_ids, color, icon } = req.body;

    await roleService.updateRole(id, {
      display_name,
      description,
      permissions,
      default_folder_ids,
      color,
      icon,
    });

    // Automatically propagate new folder access to existing users with this role
    if (default_folder_ids && default_folder_ids.length > 0) {
      await roleService.propagateFolderAccess(role.name, default_folder_ids);
    }

    // Audit
    await logAudit(
      req.user.id,
      "Update Role",
      "role",
      id,
      { 
        roleName: role.name,
        changes: { display_name, description, permissionCount: permissions?.length, color, icon }
      },
      req
    );

    res.json({
      success: true,
      message: `Role '${role.display_name}' updated successfully`,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, error: "Failed to update role" });
  }
};

/**
 * @route   DELETE /api/access/roles/:id
 * @desc    Delete a custom role (soft delete)
 * @access  Private (Admin)
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    if (role.is_system) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete system roles. System roles are protected.",
      });
    }

    // Check if any users are assigned to this role
    const userCounts = await roleService.getRoleUserCounts();
    const usersWithRole = userCounts[role.name] || 0;

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete role '${role.display_name}'. ${usersWithRole} user(s) are assigned to this role. Reassign them first.`,
      });
    }

    await roleService.deleteRole(id);

    // Audit
    await logAudit(
      req.user.id,
      "Delete Role",
      "role",
      id,
      { roleName: role.name, displayName: role.display_name },
      req
    );

    res.json({
      success: true,
      message: `Role '${role.display_name}' deleted successfully`,
    });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({ success: false, error: "Failed to delete role" });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
