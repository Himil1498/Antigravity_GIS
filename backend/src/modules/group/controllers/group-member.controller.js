/**
 * Group Member Controller
 * Handles group member management operations
 */

const { ERRORS, MESSAGES, ROLES, VALID_MEMBER_ROLES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");
const { checkMembership } = require("../services/group.service");
const { checkCreator } = require("../services/group.service");
const {
  getGroupMembers: fetchGroupMembers,
  canManageMembers,
  isAlreadyMember,
  userExists,
  addGroupMember: addMemberRecord,
  getMemberInfo,
  removeGroupMember: removeMemberRecord,
  updateMemberRole: updateMemberRoleRecord,
} = require("../services/group-member.service");

/**
 * @route   GET /api/groups/:id/members
 * @desc    Get group members
 * @access  Private
 */
const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const membership = await checkMembership(id, userId);

    if (!membership) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.NOT_A_MEMBER });
    }

    const members = await fetchGroupMembers(id);

    res.json({ success: true, members });
  } catch (error) {
    console.error("Get group members error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_MEMBERS });
  }
};

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add member to group
 * @access  Private (Owner/Admin)
 */
const addGroupMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { user_id, role = ROLES.MEMBER } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.USER_ID_REQUIRED });
    }

    // Check if requester is owner or admin
    const canManage = await canManageMembers(id, userId);

    if (!canManage) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.ONLY_OWNER_ADMIN_ADD });
    }

    // Check if user already member
    const alreadyMember = await isAlreadyMember(id, user_id);

    if (alreadyMember) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.USER_ALREADY_MEMBER });
    }

    // Verify user exists
    const exists = await userExists(user_id);
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    await addMemberRecord(id, user_id, role, userId);

    // Audit
    await logAudit(
      userId,
      "Add Group Member",
      "GROUP_MEMBER_ADD",
      id,
      { memberUserId: user_id, role },
      req,
    );

    res.status(201).json({ success: true, message: MESSAGES.MEMBER_ADDED });
  } catch (error) {
    console.error("Add group member error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_ADD_MEMBER });
  }
};

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove member from group
 * @access  Private (Owner/Admin)
 */
const removeGroupMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.user.id;

    // Check if requester is owner or admin
    const canManage = await canManageMembers(id, userId);

    if (!canManage) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.ONLY_OWNER_ADMIN_REMOVE });
    }

    // Check member to remove
    const memberInfo = await getMemberInfo(id, memberUserId);

    if (!memberInfo) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.MEMBER_NOT_FOUND });
    }

    // Cannot remove owner
    if (memberInfo.role === ROLES.OWNER) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.CANNOT_REMOVE_OWNER });
    }

    await removeMemberRecord(id, memberUserId);

    // Audit
    await logAudit(
      userId,
      "Remove Group Member",
      "GROUP_MEMBER_REMOVE",
      id,
      { memberUserId },
      req,
    );

    res.json({ success: true, message: MESSAGES.MEMBER_REMOVED });
  } catch (error) {
    console.error("Remove group member error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_REMOVE_MEMBER });
  }
};

/**
 * @route   PATCH /api/groups/:id/members/:userId/role
 * @desc    Update member role
 * @access  Private (Owner only)
 */
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.user.id;
    const { role } = req.body;

    if (!role || !VALID_MEMBER_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.INVALID_ROLE });
    }

    // Check if requester is creator
    const creatorCheck = await checkCreator(id, userId);

    if (!creatorCheck.found) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.GROUP_NOT_FOUND });
    }

    if (!creatorCheck.isCreator) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.ONLY_CREATOR_UPDATE_ROLES });
    }

    // Check if member exists
    const memberInfo = await getMemberInfo(id, memberUserId);

    if (!memberInfo) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.MEMBER_NOT_FOUND });
    }

    await updateMemberRoleRecord(id, memberUserId, role);

    // Audit
    await logAudit(
      userId,
      "Update Group Member Role",
      "GROUP_MEMBER_ROLE_UPDATE",
      id,
      { memberUserId, role },
      req,
    );

    res.json({ success: true, message: MESSAGES.ROLE_UPDATED });
  } catch (error) {
    console.error("Update member role error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_UPDATE_ROLE });
  }
};

module.exports = {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
};
