const auditService = require("../audit.service");

const getAuditLogs = async (req, res) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    res.json({
      success: true,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch audit logs" });
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const log = await auditService.getAuditLogById(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: "Audit log not found" });
    }
    res.json({ success: true, log });
  } catch (error) {
    console.error("Get audit log error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch audit log" });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7, limit = 10 } = req.query;

    // Authorization check: Only admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const activity = await auditService.getUserActivity(userId, days, limit);
    res.json({ success: true, activity });
  } catch (error) {
    console.error("Get user activity error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user activity" });
  }
};

const createAuditLog = async (req, res) => {
  try {
    const log = await auditService.createAuditLog(
      req.body,
      req.ip,
      req.user ? req.user.id : null,
    );
    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Create audit log error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create audit log" });
  }
};

const deleteAuditLog = async (req, res) => {
  try {
    const affected = await auditService.deleteAuditLog(req.params.id);
    if (affected === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Audit log not found" });
    }

    // Log the deletion action
    await auditService.createAuditLog(
      {
        action: "Deleted Single Audit Log",
        resource_type: "AUDIT_LOG_CLEARED",
        resource_id: req.params.id,
        details: { log_id: req.params.id, deleted_by_user_id: req.user.id },
      },
      req.ip,
      req.user.id
    );

    res.json({ success: true, message: "Audit log deleted" });
  } catch (error) {
    console.error("Delete audit log error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete audit log" });
  }
};

const clearAllAuditLogs = async (req, res) => {
  try {
    const count = await auditService.clearAllAuditLogs();

    // Log the clear action
    await auditService.createAuditLog(
      {
        action: "Cleared All Audit Logs",
        resource_type: "AUDIT_LOG_CLEARED",
        resource_id: "ALL",
        details: { count, cleared_by_user_id: req.user.id },
      },
      req.ip,
      req.user.id,
    );

    res.json({ success: true, message: `Cleared ${count} audit logs` });
  } catch (error) {
    console.error("Clear audit logs error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to clear audit logs" });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getUserActivity,
  createAuditLog,
  deleteAuditLog,
  clearAllAuditLogs,
};
