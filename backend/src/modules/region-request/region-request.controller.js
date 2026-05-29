const regionRequestService = require("./region-request.service");
const { logAudit } = require("../audit/audit.service");

const getRequests = async (req, res) => {
  try {
    const requests = await regionRequestService.getAllRequests(
      req.user.id,
      req.user.role?.toLowerCase(),
    );
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get region requests error:", error);
    res.status(500).json({
      success: false,
      error:
        regionRequestService.ERRORS.GET_FAILED || "Failed to fetch requests",
    });
  }
};

const createRequest = async (req, res) => {
  try {
    const request = await regionRequestService.createRequest(
      req.user.id,
      req.body,
    );
    try {
      await logAudit(
        req.user.id,
        "Requested access to region",
        "REGION_ACCESS_REQUEST",
        request.id,
        { ...req.body, requestId: request.id },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error("Create region request error:", error);
    const status =
      error.message === regionRequestService.ERRORS.REGION_NOT_FOUND
        ? 404
        : 400;
    res.status(status).json({
      success: false,
      error: error.message || regionRequestService.ERRORS.CREATE_FAILED,
    });
  }
};

const deleteRequest = async (req, res) => {
  try {
    await regionRequestService.deleteRequest(
      req.params.id,
      req.user.id,
      req.user.role?.toLowerCase(),
    );
    try {
      await logAudit(
        req.user.id,
        "Deleted region access request",
        "REGION_ACCESS_REQUEST",
        req.params.id,
        { action: "DELETE", requestId: req.params.id },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
    res.json({ success: true, message: regionRequestService.SUCCESS.DELETED });
  } catch (error) {
    const status =
      error.message === regionRequestService.ERRORS.REQUEST_NOT_FOUND
        ? 404
        : error.message === regionRequestService.ERRORS.DELETE_PERMISSION
          ? 403
          : 500;
    res.status(status).json({
      success: false,
      error: error.message || regionRequestService.ERRORS.DELETE_FAILED,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    const comments = req.body.comments;


    await regionRequestService.approveRequest(
      req.params.id,
      req.user.id,
      comments,
    );
    try {
      await logAudit(
        req.user.id,
        "Approved region access request",
        "REGION_ACCESS_GRANTED",
        req.params.id,
        { action: "APPROVE", requestId: req.params.id, comments },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
    res.json({ success: true, message: regionRequestService.SUCCESS.APPROVED });
  } catch (error) {
    const status =
      error.message === regionRequestService.ERRORS.REQUEST_NOT_FOUND
        ? 404
        : 400;
    res.status(status).json({
      success: false,
      error: error.message || regionRequestService.ERRORS.APPROVE_FAILED,
    });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const comments = req.body.comments;


    await regionRequestService.rejectRequest(
      req.params.id,
      req.user.id,
      comments,
    );
    try {
      await logAudit(
        req.user.id,
        "Rejected region access request",
        "REGION_ACCESS_DENIED",
        req.params.id,
        { action: "REJECT", requestId: req.params.id, comments },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
    res.json({ success: true, message: regionRequestService.SUCCESS.REJECTED });
  } catch (error) {
    const status =
      error.message === regionRequestService.ERRORS.REQUEST_NOT_FOUND
        ? 404
        : 400;
    res.status(status).json({
      success: false,
      error: error.message || regionRequestService.ERRORS.REJECT_FAILED,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  deleteRequest,
  approveRequest,
  rejectRequest,
};
