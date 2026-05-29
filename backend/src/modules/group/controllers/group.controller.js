/**
 * Group Controller - Group CRUD Operations
 * Handles group creation, reading, updating, and deletion
 */

const { ERRORS, MESSAGES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");
const { notifyAllAdmins } = require("../../notification/services/notification.service");
const {
  getAllGroups: fetchAllGroups,
  checkMembership,
  getGroupById: fetchGroupById,
  createGroup: createGroupRecord,
  checkCreator,
  updateGroup: updateGroupRecord,
  deleteGroup: deleteGroupRecord,
} = require("../services/group.service");

/**
 * @route   GET /api/groups
 * @desc    Get all user's groups
 * @access  Private
 */
const getAllGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await fetchAllGroups(userId);

    res.json({ success: true, groups });
  } catch (error) {
    console.error("Get groups error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_GROUPS });
  }
};

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID
 * @access  Private
 */
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member of this group
    const membership = await checkMembership(id, userId);

    if (!membership) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.NOT_A_MEMBER });
    }

    const group = await fetchGroupById(id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.GROUP_NOT_FOUND });
    }

    group.user_role = membership.role;

    res.json({ success: true, group });
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_GROUP });
  }
};

/**
 * @route   POST /api/groups
 * @desc    Create new group
 * @access  Private
 */
const createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, is_active } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.GROUP_NAME_REQUIRED });
    }

    const groupId = await createGroupRecord(
      userId,
      name,
      description,
      is_active !== undefined ? is_active : true,
    );

    try {
      await logAudit(
        userId,
        "Created user group",
        "GROUP_CREATE",
        groupId,
        { name, description },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'group_create',
        'New Group Created',
        `User Group "${name}" was created by User ID: ${userId}.`,
        { related_entity_id: groupId, related_entity_type: 'group' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.status(201).json({
      success: true,
      group: {
        id: groupId,
        name,
        description,
        created_by: userId,
        is_active: is_active !== undefined ? is_active : true,
      },
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_CREATE });
  }
};

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group
 * @access  Private (Owner only)
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, is_active } = req.body;

    // Check if user is creator
    const creatorCheck = await checkCreator(id, userId);

    if (!creatorCheck.found) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.GROUP_NOT_FOUND });
    }

    if (!creatorCheck.isCreator) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.ONLY_CREATOR_UPDATE });
    }

    const result = await updateGroupRecord(id, {
      name,
      description,
      is_active,
    });

    try {
      await logAudit(
        userId,
        "Updated user group",
        "GROUP_UPDATE",
        id,
        { name, description, is_active },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'group_update',
        'Group Updated',
        `User Group "${name || 'ID ' + id}" was updated by User ID: ${userId}.`,
        { related_entity_id: id, related_entity_type: 'group' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    if (!result.updated) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NO_FIELDS_TO_UPDATE });
    }

    res.json({ success: true, message: MESSAGES.GROUP_UPDATED });
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_UPDATE });
  }
};

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group
 * @access  Private (Owner only)
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is creator
    const creatorCheck = await checkCreator(id, userId);

    if (!creatorCheck.found) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.GROUP_NOT_FOUND });
    }

    if (!creatorCheck.isCreator) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.ONLY_CREATOR_DELETE });
    }

    await deleteGroupRecord(id);

    try {
      await logAudit(
        userId,
        "Deleted user group",
        "GROUP_DELETE",
        id,
        { action: "DELETE" },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      await notifyAllAdmins(
        'group_delete',
        'Group Deleted',
        `User Group ID ${id} was deleted by User ID: ${userId}.`,
        { related_entity_id: id, related_entity_type: 'group' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({ success: true, message: MESSAGES.GROUP_DELETED });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
