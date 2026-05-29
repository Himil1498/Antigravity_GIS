const infraApprovalService = require("../services/infra-approval.service");
const { logAudit } = require("../../audit/audit.service");
const { createNotification, notifyAllUsers } = require("../../notification/services/notification.service");

class InfraApprovalController {
  /**
   * POST /infra-approvals - Submit for approval
   */
  async submit(req, res) {
    let result;
    try {
      result = await infraApprovalService.submit(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      console.error("[InfraApproval] Submit error:", err);
      return res.status(500).json({ error: err.message });
    }

    // Post-response async work (fire-and-forget, never crashes the server)
    try {
      logAudit(req.user.id, "INFRA_SUBMIT", "infra_approval", result.approvalId,
        { folderId: req.body.folderId, name: req.body.name }, req
      ).catch((e) => console.error("Audit log failed", e));

      const { rawPool } = require("../../../config/database");
      const admins = await rawPool.query(
        "SELECT id FROM users WHERE role IN ('admin', 'manager') AND id != $1 AND is_active = true",
        [req.user.id]
      );
      for (const admin of admins.rows) {
        createNotification(admin.id, "infra_approval", "New Inventory Submission",
          `${req.user.full_name || req.user.username} submitted "${req.body.name}" for approval.`,
          { action_url: "/network-planning?tab=approvals", related_entity_id: result.approvalId, related_entity_type: "infra_approval" }
        ).catch((e) => console.error("Notification failed", e));
      }
    } catch (e) {
      console.error("[InfraApproval] Post-submit notification error:", e);
    }
  }

  /**
   * GET /infra-approvals - List pending approvals (BM)
   */
  async listPending(req, res) {
    try {
      const approvals = await infraApprovalService.listPending();
      res.json(approvals);
    } catch (err) {
      console.error("[InfraApproval] List error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /infra-approvals/my-submissions - List PM's own submissions
   */
  async listMySubmissions(req, res) {
    try {
      const submissions = await infraApprovalService.listMySubmissions(req.user.id);
      res.json(submissions);
    } catch (err) {
      console.error("[InfraApproval] My submissions error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /infra-approvals/history - List approval history (BM)
   */
  async listHistory(req, res) {
    try {
      const history = await infraApprovalService.listHistory();
      res.json(history);
    } catch (err) {
      console.error("[InfraApproval] History error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /infra-approvals/:id - Get single approval
   */
  async getById(req, res) {
    try {
      const approval = await infraApprovalService.getById(req.params.id);
      res.json(approval);
    } catch (err) {
      console.error("[InfraApproval] Get error:", err);
      res.status(err.message === "Approval not found" ? 404 : 500).json({ error: err.message });
    }
  }

  /**
   * PUT /infra-approvals/:id/approve - Approve (BM)
   */
  async approve(req, res) {
    let result;
    try {
      result = await infraApprovalService.approve(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      console.error("[InfraApproval] Approve error:", err);
      return res.status(500).json({ error: err.message });
    }

    // Post-response async work (fire-and-forget)
    try {
      logAudit(req.user.id, "INFRA_APPROVE", "infra_approval", Number(req.params.id),
        { status: result.status, featureId: result.featureId }, req
      ).catch((e) => console.error("Audit log failed", e));

      const approval = await infraApprovalService.getById(req.params.id);
      const itemName = approval.form_data?.name || "Infrastructure";
      const folderPath = approval.folder_path || approval.folder_name || "Infrastructure";
      const folderId = approval.folder_id;
      const approverName = req.user.full_name || req.user.username;

      // Notify the submitter directly
      createNotification(approval.submitted_by, "infra_approved",
        `Infrastructure ${result.status === "active" ? "Activated" : "Approved"}`,
        `Your submission "${itemName}" has been ${result.status === "active" ? "activated to Live Inventory" : "approved as Planned"} by ${approverName}.`,
        { action_url: `/network-planning?folderId=${folderId}`, related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
      ).catch((e) => console.error("Notification failed", e));

      // Broadcast to ALL users
      if (result.status === "planned") {
        notifyAllUsers(
          "infra_planned",
          "📋 New Planned Infrastructure",
          `"${itemName}" has been approved as Planned Infrastructure in ${folderPath}.`,
          { action_url: `/network-planning?folderId=${folderId}`, related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
        ).catch((e) => console.error("Broadcast notification failed", e));
      } else if (result.status === "active") {
        notifyAllUsers(
          "infra_live",
          "🟢 New Live Inventory",
          `"${itemName}" is now Live Inventory in ${folderPath}.`,
          { action_url: `/network-planning?folderId=${folderId}`, related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
        ).catch((e) => console.error("Broadcast notification failed", e));
      }
    } catch (e) {
      console.error("[InfraApproval] Post-approve notification error:", e);
    }
  }

  /**
   * PUT /infra-approvals/:id/reject - Reject (BM)
   */
  async reject(req, res) {
    let approval;
    try {
      approval = await infraApprovalService.getById(req.params.id);
      const result = await infraApprovalService.reject(req.params.id, req.user.id, req.body.reason);
      res.json(result);
    } catch (err) {
      console.error("[InfraApproval] Reject error:", err);
      return res.status(500).json({ error: err.message });
    }

    // Post-response async work (fire-and-forget)
    try {
      logAudit(req.user.id, "INFRA_REJECT", "infra_approval", Number(req.params.id),
        { reason: req.body.reason }, req
      ).catch((e) => console.error("Audit log failed", e));

      createNotification(approval.submitted_by, "infra_rejected", "Infrastructure Rejected",
        `Your submission "${approval.form_data?.name}" was rejected. Reason: ${req.body.reason}`,
        { action_url: "/network-planning?tab=add-infrastructure", related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
      ).catch((e) => console.error("Notification failed", e));
    } catch (e) {
      console.error("[InfraApproval] Post-reject notification error:", e);
    }
  }

  /**
   * PUT /infra-approvals/:id/circuit - Add Circuit ID (PM)
   */
  async addCircuitId(req, res) {
    let result;
    try {
      const { circuitId, activationDate } = req.body;
      result = await infraApprovalService.addCircuitId(req.params.id, req.user.id, circuitId, activationDate);
      res.json(result);
    } catch (err) {
      console.error("[InfraApproval] Circuit ID error:", err);
      return res.status(500).json({ error: err.message });
    }

    // Post-response async work (fire-and-forget)
    try {
      logAudit(req.user.id, "INFRA_CIRCUIT_ID", "infra_approval", Number(req.params.id),
        { circuitId: req.body.circuitId }, req
      ).catch((e) => console.error("Audit log failed", e));

      const { rawPool } = require("../../../config/database");
      const admins = await rawPool.query(
        "SELECT id FROM users WHERE role IN ('admin', 'manager') AND id != $1 AND is_active = true",
        [req.user.id]
      );
      const approval = await infraApprovalService.getById(req.params.id);
      for (const admin of admins.rows) {
        createNotification(admin.id, "infra_circuit_id", "Circuit ID Added",
          `${req.user.full_name || req.user.username} added Circuit ID "${req.body.circuitId}" to "${approval.form_data?.name}". Awaiting activation approval.`,
          { action_url: "/network-planning?tab=approvals", related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
        ).catch((e) => console.error("Notification failed", e));
      }
    } catch (e) {
      console.error("[InfraApproval] Post-circuitId notification error:", e);
    }
  }

  /**
   * PUT /infra-approvals/:id/resubmit - Resubmit rejected (PM)
   */
  async resubmit(req, res) {
    try {
      const result = await infraApprovalService.resubmit(req.params.id, req.user.id, req.body);
      res.json(result);

      logAudit(req.user.id, "INFRA_RESUBMIT", "infra_approval", Number(req.params.id),
        {}, req
      ).catch((e) => console.error("Audit log failed", e));
    } catch (err) {
      console.error("[InfraApproval] Resubmit error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * DELETE /infra-approvals/:id - Delete a submission (PM owns it or Admin)
   */
  async deleteSubmission(req, res) {
    try {
      const result = await infraApprovalService.deleteSubmission(req.params.id, req.user);
      res.json(result);

      logAudit(req.user.id, "INFRA_DELETE", "infra_approval", Number(req.params.id),
        {}, req
      ).catch((e) => console.error("Audit log failed", e));
    } catch (err) {
      console.error("[InfraApproval] Delete error:", err);
      if (err.message === "Submission not found") {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes("lack permissions")) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /infra-approvals/:id/edit - Edit submission form data (BM)
   */
  async editSubmission(req, res) {
    try {
      const result = await infraApprovalService.editSubmission(
        req.params.id, req.user.id, req.body
      );
      res.json(result);
    } catch (err) {
      console.error("[InfraApproval] Edit error:", err);
      return res.status(500).json({ error: err.message });
    }

    // Post-response async work (fire-and-forget)
    try {
      logAudit(req.user.id, "INFRA_EDIT", "infra_approval", Number(req.params.id),
        { editedFields: Object.keys(req.body?.properties || {}) }, req
      ).catch((e) => console.error("Audit log failed", e));

      const approval = await infraApprovalService.getById(req.params.id);
      createNotification(approval.submitted_by, "infra_edited",
        "Submission Edited by Reviewer",
        `Your submission "${approval.form_data?.name}" was edited by ${req.user.full_name || req.user.username}. Please review the changes.`,
        { action_url: "/network-planning?tab=add-infrastructure", related_entity_id: Number(req.params.id), related_entity_type: "infra_approval" }
      ).catch((e) => console.error("Notification failed", e));
    } catch (e) {
      console.error("[InfraApproval] Post-edit notification error:", e);
    }
  }
}

module.exports = new InfraApprovalController();
