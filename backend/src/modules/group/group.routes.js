const express = require("express");
const router = express.Router();
const {
  authenticate,
  checkPermission,
} = require("../../shared/middleware/auth");
const groupController = require("./controllers/group.controller");
const groupMemberController = require("./controllers/group-member.controller");
const groupPermissionController = require("./controllers/group-permission.controller");

router.use(authenticate);

// Group CRUD
router.get("/", checkPermission("groups:view"), groupController.getAllGroups);
router.post("/", checkPermission("groups:create"), groupController.createGroup);
router.get(
  "/:id",
  checkPermission("groups:view"),
  groupController.getGroupById,
);
router.put("/:id", checkPermission("groups:edit"), groupController.updateGroup);
router.delete(
  "/:id",
  checkPermission("groups:delete"),
  groupController.deleteGroup,
);

// Group Members
router.get("/:id/members", groupMemberController.getGroupMembers);
router.post("/:id/members", groupMemberController.addGroupMember);
router.delete("/:id/members/:userId", groupMemberController.removeGroupMember);
router.patch(
  "/:id/members/:userId/role",
  groupMemberController.updateMemberRole,
);

// Group Permissions
router.get(
  "/:groupId/permissions",
  groupPermissionController.getGroupPermissions,
);
router.put(
  "/:groupId/permissions",
  groupPermissionController.updateGroupPermissions,
);

module.exports = router;
